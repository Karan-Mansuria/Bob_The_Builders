# Backend (FastAPI)

## Setup

1) Create venv and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Run API:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints
- POST `/api/jobs` (multipart form): file (pdf), quality_score (0..1), optional min_bid, max_bid
- GET `/api/jobs` list
- GET `/api/jobs/{id}` detail + result

The service will:
- Extract text/tables from the uploaded PDF
- Derive estimated cost (base price)
- Run the optimizer with `Bob_The_Builders/ml` models
- Persist results in SQLite (`backend_data.sqlite3`)

## Frontend
Run Vite with:

```bash
cd "../AI Tender Optimization Website"
VITE_API_BASE=http://localhost:8000 npm run dev
```


