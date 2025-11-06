from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, Optional

# Local imports from project scripts (avoid importing extractor to prevent side effects)
from Extraction import extract_tender_params as step2_params
from Bob_The_Builders.ml.bid_optimization_pipeline_from_scratch import optimize_bid
import joblib

# Import step 3 functions
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "Extraction"))
from multiple3 import build_extraction_rules, SIMPLE_RULES


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def run_full_pipeline(
    pdf_path: str,
    quality_score: float,
    work_dir: Optional[str] = None,
    min_bid: Optional[float] = None,
    max_bid: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Runs: Step1 extraction -> Step2 param contexts -> Base price parse -> Optimizer.
    Returns dict suitable to persist and send back to FE.
    """
    if work_dir is None:
        work_dir = os.path.dirname(pdf_path) or "."

    out_folder = os.path.join(work_dir, "extracted_pages_new")
    _ensure_dir(out_folder)

    # --- Step 1: Extract pages/tables/texts from the uploaded PDF ---
    print("[Pipeline] Step 1: Extracting pages/tables/texts from PDF...", file=sys.stderr)
    _run_step1_extraction(pdf_path, out_folder)
    print(f"[Pipeline] Step 1 complete. Files saved to {out_folder}", file=sys.stderr)

    # --- Step 2: Collect param contexts ---
    print("[Pipeline] Step 2: Collecting parameter contexts...", file=sys.stderr)
    orig_folder = step2_params.Config.PROTOCOL_FOLDER
    try:
        step2_params.Config.PROTOCOL_FOLDER = out_folder
        text_blocks = step2_params.read_all_texts_and_tables(out_folder)
        contexts = step2_params.collect_keyword_contexts(text_blocks)
        param_context_dir = Path(out_folder) / "param_contexts"
        param_context_dir.mkdir(parents=True, exist_ok=True)
        index_lines = []
        for param, snippets in contexts.items():
            if not snippets:
                (param_context_dir / f"{param}_000.txt").write_text("", encoding="utf-8")
                index_lines.append(f"{param}: 0")
                continue
            for i, (source, snippet) in enumerate(snippets, 1):
                fname = f"{param}_{i:03}.txt"
                header = f"# param: {param}\n# source: {source}\n\n"
                (param_context_dir / fname).write_text(header + "\n".join(snippet), encoding="utf-8")
            index_lines.append(f"{param}: {len(snippets)}")
        (param_context_dir / "INDEX.txt").write_text("\n".join(index_lines), encoding="utf-8")
        print(f"[Pipeline] Step 2 complete. Contexts saved to {param_context_dir}", file=sys.stderr)
    finally:
        step2_params.Config.PROTOCOL_FOLDER = orig_folder

    # --- Step 3: Extract final values from param_contexts ---
    print("[Pipeline] Step 3: Extracting final values from param_contexts...", file=sys.stderr)
    param_context_dir = Path(out_folder) / "param_contexts"
    extracted_data = _run_step3_extraction(param_context_dir)
    print(f"[Pipeline] Step 3 extracted: {extracted_data}", file=sys.stderr)

    # --- Derive base_price (Estimated Cost) from extracted data ---
    base_price = None
    if extracted_data.get("Estimated Cost") and extracted_data["Estimated Cost"] != "NAN":
        try:
            base_price = float(str(extracted_data["Estimated Cost"]).replace(",", "").strip())
        except (ValueError, AttributeError):
            pass

    if base_price is None:
        # Fallback: try to extract from contexts directly
        base_price = _extract_estimated_cost_from_contexts(contexts)
        if base_price is None:
            # Last resort: search any number-like in all texts
            base_price = _fallback_first_money(out_folder)

    if base_price is None or base_price <= 0:
        raise ValueError(f"Could not determine valid base price from extracted document. Got: {base_price}")

    print(f"[Pipeline] Using base_price: {base_price}", file=sys.stderr)

    # --- Load models with absolute paths and run optimizer ---
    print("[Pipeline] Loading ML models...", file=sys.stderr)
    repo_root = Path(__file__).resolve().parents[1]
    models_dir = repo_root / "Bob_The_Builders" / "ml" / "models"
    clf_path = models_dir / "win_classifier_final.pkl"
    reg_path = models_dir / "profit_regressor_final.pkl"
    
    if not clf_path.exists():
        raise FileNotFoundError(f"Classifier model not found: {clf_path}")
    if not reg_path.exists():
        raise FileNotFoundError(f"Regressor model not found: {reg_path}")
    
    clf_pipe = joblib.load(clf_path)
    reg_pipe = joblib.load(reg_path)
    print("[Pipeline] Models loaded. Running optimizer...", file=sys.stderr)

    out = optimize_bid(
        clf_pipe,
        reg_pipe,
        base_price=float(base_price),
        quality_score=float(quality_score),
        min_bid=min_bid,
        max_bid=max_bid,
        auto_expand=True,
        use_profit_formula=True,
    )
    # Ensure all expected fields exist
    if "profit_if_won_at_best" not in out:
        # use_profit_formula=True above, so profit_if_won = best_bid - base_price
        try:
            out["profit_if_won_at_best"] = float(out.get("best_bid", 0.0)) - float(base_price)
        except Exception:
            out["profit_if_won_at_best"] = None
    out["base_price"] = float(base_price)
    out["extracted_data"] = extracted_data  # Add all extracted tender parameters
    print(f"[Pipeline] Optimization complete. Best bid: {out.get('best_bid')}", file=sys.stderr)
    print(f"[Pipeline] Extracted data: {extracted_data}", file=sys.stderr)
    return out


def _run_step1_extraction(pdf_path: str, output_folder: str) -> None:
    """Minimal re-implementation of the script loop to avoid re-import side effects."""
    import pdfplumber
    from paddleocr import PaddleOCR
    import pandas as pd
    import cv2
    import numpy as np

    os.makedirs(output_folder, exist_ok=True)
    ocr = PaddleOCR(use_angle_cls=True, lang='en')

    def save_table(df, page_num, table_idx):
        csv_path = os.path.join(output_folder, f"page{page_num}_table{table_idx}.csv")
        df.to_csv(csv_path, index=False, header=False)

    def save_text(text, page_num):
        text_path = os.path.join(output_folder, f"page{page_num}_text.txt")
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(text)

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            page_text = page.extract_text() or ""

            if tables:
                for idx, table in enumerate(tables):
                    df = pd.DataFrame(table[1:], columns=table[0])
                    save_table(df, page_num, idx)

            if page_text.strip():
                save_text(page_text, page_num)

            if not tables and not page_text.strip():
                page_image = page.to_image(resolution=300).original
                img = cv2.cvtColor(np.array(page_image), cv2.COLOR_RGB2BGR)
                result = ocr.ocr(img)
                ocr_text = []
                if result is not None:
                    for line in result:
                        if line is None:
                            ocr_text.append("None")
                            continue
                        try:
                            line_text = " ".join([word_info[1][0] if word_info and len(word_info) > 1 and word_info[1] and len(word_info[1]) > 0 else "None" for word_info in line])
                            ocr_text.append(line_text)
                        except (TypeError, IndexError) as e:
                            ocr_text.append("None")
                else:
                    ocr_text.append("None")
                save_text("\n".join(ocr_text) if ocr_text else "None", page_num)


def _extract_estimated_cost_from_contexts(contexts: Dict[str, Any]) -> Optional[float]:
    # Handles keys per step2_params.KEYWORDS, estimated_cost likely under 'estimated_cost'
    money_re = re.compile(r"[₹\s]*([0-9][0-9,\.]+)")
    candidates = []
    for key in ("estimated_cost", "Estimated Cost", "tender_value", "tender cost"):
        if key in contexts and contexts[key]:
            for _, snippet in contexts[key]:
                joined = " ".join(snippet)
                for m in money_re.finditer(joined):
                    num = m.group(1).replace(",", "")
                    try:
                        val = float(num)
                        if val > 0:
                            candidates.append(val)
                    except Exception:
                        continue
    return max(candidates) if candidates else (min(candidates) if candidates else None)


def _fallback_first_money(extracted_dir: str) -> Optional[float]:
    money_re = re.compile(r"[₹\s]*([0-9][0-9,\.]{4,})")
    for p in sorted(Path(extracted_dir).glob("*.txt")):
        text = p.read_text(encoding="utf-8", errors="ignore")
        m = money_re.search(text)
        if m:
            try:
                return float(m.group(1).replace(",", ""))
            except Exception:
                continue
    return None


def _run_step3_extraction(param_context_dir: Path) -> Dict[str, Any]:
    """Run step 3 extraction on param_contexts folder."""
    extraction_rules = build_extraction_rules(SIMPLE_RULES)
    final_extracted_data = {key: None for key in SIMPLE_RULES.keys()}
    
    if not param_context_dir.exists():
        return {k: "NAN" for k in SIMPLE_RULES.keys()}
    
    all_files = sorted([f for f in os.listdir(param_context_dir) if f.endswith('.txt') and not f.startswith('INDEX')])
    
    for filename in all_files:
        if all(value is not None for value in final_extracted_data.values()):
            break
            
        file_path = param_context_dir / filename
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read()
                text += "\nEnd of Document"
            
            for key_name, rule in extraction_rules.items():
                if final_extracted_data[key_name] is None:
                    match = None
                    normalizer = rule["normalizer"]
                    
                    if rule["pattern_colon"]:
                        match = rule["pattern_colon"].search(text)
                    if not match and rule["pattern_proximity"]:
                        match = rule["pattern_proximity"].search(text)
                    
                    if match:
                        try:
                            raw_value = match.groups()[-1]
                            normalized_value = normalizer(raw_value)
                            if normalized_value:
                                final_extracted_data[key_name] = normalized_value
                        except Exception:
                            continue
        except Exception:
            continue
    
    # Replace None with "NAN"
    for key, value in final_extracted_data.items():
        if value is None:
            final_extracted_data[key] = "NAN"
    
    return final_extracted_data


