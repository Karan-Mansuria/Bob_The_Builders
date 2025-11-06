# Tender Optimization Backend (FastAPI)

## Endpoints

- `GET /health`: Health check
- `POST /optimize`: Optimize bid
  - Body JSON:
    - `base_price` (float > 0)
    - `quality_score` (float in [0,1])
    - Optional: `min_bid`, `max_bid`, `n_points`, `auto_expand`, `tol_rel`, `min_pwin`, `use_profit_formula`
- `POST /extract`: Upload PDF and extract key fields
  - Multipart form-data: `file` (PDF)
- `POST /analyze-and-optimize`: Upload PDF and optimize using extracted `estimated_cost` as base price
  - Multipart form-data: `file` (PDF), query/form fields: `quality_score`, `use_profit_formula`

## Run locally

```bash
cd /home/nova-kalki/Documents/Aruigo/Bob_The_Builders/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The frontend dev server (Vite at 3000) can call `http://localhost:8000`.

## Model files

Place model artifacts here (already present in repo):
- `/home/nova-kalki/Documents/Aruigo/Bob_The_Builders/ml/models/win_classifier_final.pkl`
- `/home/nova-kalki/Documents/Aruigo/Bob_The_Builders/ml/models/profit_regressor_final.pkl`

## Notes

- **Extraction**: The backend now uses the actual extraction logic from the `Extraction/` folder:
  - Uses `extractor.py` logic for PDF text/table extraction with OCR fallback
  - Uses `multiple3.py` logic for regex-based field extraction with normalization
  - Supports both text-based PDFs (via `pdfplumber`) and scanned PDFs (via OCR with `paddleocr`)
- **OCR Support**: For scanned/image-only PDFs, install optional dependencies:
  ```bash
  pip install pdf2image paddleocr opencv-python
  ```
  Then use `use_ocr=true` parameter in `/extract` or `/analyze-and-optimize` endpoints.

