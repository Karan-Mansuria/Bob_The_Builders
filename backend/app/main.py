from __future__ import annotations

import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, conint, confloat

# --- Paths ---
REPO_ROOT = Path(__file__).resolve().parents[2]
ML_DIR = REPO_ROOT / "ml"
MODELS_DIR = ML_DIR / "models"
EXTRACTION_DIR = REPO_ROOT / "Extraction"

# --- Import optimizer ---
import sys
sys.path.insert(0, str(ML_DIR))
try:
    from run_optimizer import optimize_bid, predict_win_prob_single, predict_profit_if_won_single  # type: ignore
except Exception as e:  # pragma: no cover
    raise RuntimeError(f"Failed to import optimizer from {ML_DIR}: {e}")

import joblib

# --- Import extraction module ---
from app.extraction import extract_fields_from_pdf


def load_models() -> Dict[str, Any]:
    clf_path = MODELS_DIR / "win_classifier_final.pkl"
    reg_path = MODELS_DIR / "profit_regressor_final.pkl"
    if not clf_path.exists() or not reg_path.exists():
        raise FileNotFoundError("Model files not found in ml/models. Expected win_classifier_final.pkl and profit_regressor_final.pkl")
    clf = joblib.load(str(clf_path))
    reg = joblib.load(str(reg_path))
    return {"clf": clf, "reg": reg}


models_cache = load_models()


app = FastAPI(title="Tender Optimization API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # adjust in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizeRequest(BaseModel):
    base_price: confloat(gt=0)
    quality_score: confloat(ge=0, le=1)
    min_bid: Optional[confloat(gt=0)] = None
    max_bid: Optional[confloat(gt=0)] = None
    n_points: conint(ge=21, le=2001) = 201
    auto_expand: bool = True
    tol_rel: confloat(gt=0, le=1) = 1e-3
    min_pwin: confloat(gt=0, le=1) = 1e-4
    use_profit_formula: bool = False


class OptimizeResponse(BaseModel):
    best_bid: float
    expected_profit_at_best: float
    p_win_at_best: float
    profit_if_won_at_best: float
    initial_bracket: list[float]
    auto_expanded: bool
    diagnostic_bids: list[float]
    diagnostic_exp_profit: list[float]


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(payload: OptimizeRequest) -> Dict[str, Any]:
    try:
        result = optimize_bid(
            models_cache["clf"],
            models_cache["reg"],
            base_price=payload.base_price,
            quality_score=payload.quality_score,
            min_bid=payload.min_bid,
            max_bid=payload.max_bid,
            n_points=payload.n_points,
            auto_expand=payload.auto_expand,
            tol_rel=payload.tol_rel,
            min_pwin=payload.min_pwin,
            use_profit_formula=payload.use_profit_formula,
        )
        return result
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------
# Extraction helpers
# -------------------------

def _parse_money_to_float(text: Optional[str]) -> Optional[float]:
    """Parse money string to float, handling normalization from extraction module."""
    if not text or text == "NAN":
        return None
    # Use the same normalization as extraction module
    cleaned = re.sub(r"[^\d\.]+", "", text)
    cleaned = cleaned.strip(" .")
    try:
        return float(cleaned) if cleaned else None
    except Exception:
        return None


class ExtractResponse(BaseModel):
    tender_no: Optional[str] = None
    estimated_cost: Optional[str] = None
    emd: Optional[str] = None
    date_of_opening: Optional[str] = None
    completion_time: Optional[str] = None


@app.post("/extract", response_model=ExtractResponse)
async def extract(
    file: UploadFile = File(...),
    use_ocr: bool = False
) -> Dict[str, Optional[str]]:
    """
    Extract tender fields from uploaded PDF.
    Uses the extraction logic from Extraction/extractor.py and Extraction/multiple3.py.
    
    Args:
        file: PDF file to extract from
        use_ocr: Whether to use OCR for scanned PDFs (requires paddleocr, pdf2image, opencv-python)
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = Path(tmp.name)

        # Use the proper extraction module
        fields = extract_fields_from_pdf(tmp_path, use_ocr=use_ocr)
        os.unlink(tmp_path)

        # Map to response format (handle "NAN" values)
        def map_value(val: Optional[str]) -> Optional[str]:
            return None if val == "NAN" or not val else val

        return {
            "tender_no": map_value(fields.get("Tender No")),
            "estimated_cost": map_value(fields.get("Estimated Cost")),
            "emd": map_value(fields.get("EMD")),
            "date_of_opening": map_value(fields.get("Date of Opening")),
            "completion_time": map_value(fields.get("Completion Time")),
        }
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Extraction failed: {e}")


class AnalyzeAndOptimizeResponse(BaseModel):
    extracted: ExtractResponse
    optimization: OptimizeResponse


@app.post("/analyze-and-optimize", response_model=AnalyzeAndOptimizeResponse)
async def analyze_and_optimize(
    quality_score: float = Form(..., ge=0, le=1, description="Quality score in [0,1]"),
    use_profit_formula: bool = Form(False),
    use_ocr: bool = Form(False),
    file: UploadFile = File(...),
) -> Dict[str, Any]:
    """
    Extract fields from PDF and optimize bid using extracted estimated_cost as base_price.
    """
    # 1) Extract fields using the proper extraction module
    extract_payload = await extract(file, use_ocr=use_ocr)

    # 2) Determine base_price from estimated_cost
    base_price = _parse_money_to_float(extract_payload.get("estimated_cost"))
    if not base_price:
        raise HTTPException(
            status_code=422, 
            detail="Could not parse base price from document. Please ensure 'Estimated Cost' field is present and valid."
        )

    # 3) Optimize
    opt = optimize_bid(
        models_cache["clf"],
        models_cache["reg"],
        base_price=base_price,
        quality_score=quality_score,
        use_profit_formula=use_profit_formula,
    )

    return {
        "extracted": extract_payload,
        "optimization": opt,
    }



