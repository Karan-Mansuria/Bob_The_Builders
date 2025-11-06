# Bob The Builders - AI Tender Optimization Platform

An intelligent AI-powered platform that helps construction companies optimize their bids for tender submissions. The system uses machine learning models to analyze tender documents, extract key parameters, and recommend optimal bid amounts that maximize expected profit while considering win probability.

## 🎯 Overview

Bob The Builders is a full-stack web application that automates the tender analysis and bid optimization process. It combines:

- **PDF Document Processing**: Extracts text, tables, and data from tender PDFs using OCR
- **Intelligent Data Extraction**: Identifies key tender parameters (estimated cost, project details, etc.)
- **ML-Powered Optimization**: Uses trained models to predict win probability and expected profit
- **Bid Recommendation**: Suggests optimal bid amounts that balance profitability and competitiveness

## ✨ Features

- 📄 **PDF Upload & Processing**: Upload tender documents in PDF format
- 🔍 **Intelligent Extraction**: Automatically extracts tender parameters, estimated costs, and project details
- 🤖 **ML-Based Optimization**: Leverages pre-trained models for win probability and profit prediction
- 📊 **Interactive Dashboard**: View job history, upload new tenders, and track optimization results
- 📈 **Detailed Analytics**: See win probability, expected profit, and profit-if-won for recommended bids
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- ⚡ **Real-time Processing**: Background job processing with status updates

## 🏗️ Architecture

The project consists of three main components:

### 1. Frontend (`website/AI Tender Optimization Website/`)
- **Technology**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI components
- **Features**: Authentication, dashboard, file upload, results visualization

### 2. Backend (`website/backend/`)
- **Technology**: FastAPI, Python 3
- **Database**: SQLite (SQLAlchemy ORM)
- **Features**: RESTful API, background job processing, PDF extraction pipeline

### 3. ML Pipeline (`website/Bob_The_Builders/ml/`)
- **Models**: 
  - Win Probability Classifier (`win_classifier_final.pkl`)
  - Profit Regressor (`profit_regressor_final.pkl`)
- **Optimization**: Golden-section search algorithm with auto-expansion
- **Features**: Bid optimization, expected profit calculation, diagnostic analysis

### 4. Extraction Module (`website/Extraction/`)
- **Technology**: pdfplumber, PaddleOCR, OpenCV
- **Features**: PDF text extraction, table extraction, OCR for scanned documents, parameter context collection

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- TypeScript
- Vite 6.4.1
- Tailwind CSS
- Radix UI
- Recharts (for data visualization)

### Backend
- FastAPI 0.115.0
- Python 3
- SQLAlchemy 2.0.36
- Uvicorn

### ML & Processing
- scikit-learn 1.4.2
- pandas 2.2.2
- numpy 1.26.4
- joblib 1.4.2
- pdfplumber 0.11.4
- PaddleOCR 2.9.1
- OpenCV 4.10.0.84

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
```bash
cd website/backend
```

2. Create a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd "website/AI Tender Optimization Website"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
VITE_API_BASE=http://localhost:8000 npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

### ML Models

The pre-trained models should be located at:
- `website/Bob_The_Builders/ml/models/win_classifier_final.pkl`
- `website/Bob_The_Builders/ml/models/profit_regressor_final.pkl`

If models are missing, you can train them using:
```bash
cd website/Bob_The_Builders/ml
python3 bid_optimization_pipeline_from_scratch.py --csv dataset.csv --opt_base 100000 --opt_quality 0.72 --auto_expand --use_profit_formula
```

## 🚀 Usage

### 1. Start the Application

1. Start the backend server (see Backend Setup above)
2. Start the frontend development server (see Frontend Setup above)

### 2. Using the Web Interface

1. **Login**: Enter your email to access the dashboard
2. **Upload Tender**: 
   - Click "Upload New Tender"
   - Select a PDF file
   - Set quality score (0.0 to 1.0) - represents your company's quality/competitiveness
   - Optionally set min/max bid constraints
   - Submit the job
3. **View Results**: 
   - Monitor job status in the dashboard
   - Click on completed jobs to see optimization results
   - Review recommended bid, win probability, and expected profit

### 3. API Usage

#### Create a Job
```bash
curl -X POST "http://localhost:8000/api/jobs" \
  -F "file=@tender.pdf" \
  -F "quality_score=0.75" \
  -F "min_bid=500000" \
  -F "max_bid=1000000"
```

#### List All Jobs
```bash
curl "http://localhost:8000/api/jobs"
```

#### Get Job Details
```bash
curl "http://localhost:8000/api/jobs/{job_id}"
```

## 📁 Project Structure

```
Bob_The_Builders/
├── README.md                          # This file
├── website/
│   ├── AI Tender Optimization Website/  # Frontend React application
│   │   ├── src/
│   │   │   ├── components/            # React components
│   │   │   │   ├── auth-page-neo.tsx
│   │   │   │   ├── dashboard-page-final.tsx
│   │   │   │   ├── upload-page-final.tsx
│   │   │   │   ├── results-page.tsx
│   │   │   │   └── ui/                # Reusable UI components
│   │   │   ├── api.ts                 # API client
│   │   │   └── App.tsx                # Main app component
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── backend/                       # FastAPI backend
│   │   ├── main.py                    # API endpoints
│   │   ├── db.py                      # Database setup
│   │   ├── models.py                  # SQLAlchemy models
│   │   ├── pipeline.py                # Full processing pipeline
│   │   └── requirements.txt
│   │
│   ├── Bob_The_Builders/
│   │   ├── ml/                        # ML models and optimization
│   │   │   ├── run_optimizer.py       # Bid optimization logic
│   │   │   ├── bid_optimization_pipeline_from_scratch.py
│   │   │   ├── data_synthesizer.py
│   │   │   └── models/                # Pre-trained models
│   │   │       ├── win_classifier_final.pkl
│   │   │       └── profit_regressor_final.pkl
│   │   └── dataset.csv                # Training data
│   │
│   ├── Extraction/                    # PDF extraction module
│   │   ├── extract_tender_params.py
│   │   ├── extractor.py
│   │   └── multiple3.py
│   │
│   └── backend_data.sqlite3           # SQLite database
```

## 🔄 Processing Pipeline

The system processes tender documents through the following steps:

1. **PDF Upload**: User uploads a PDF tender document
2. **Step 1 - Extraction**: 
   - Extract text and tables from PDF pages
   - Use OCR (PaddleOCR) for scanned documents
   - Save extracted content to structured files
3. **Step 2 - Parameter Context Collection**:
   - Identify keywords and collect surrounding context
   - Extract relevant snippets for tender parameters
4. **Step 3 - Value Extraction**:
   - Apply extraction rules to find specific values
   - Extract estimated cost, project details, etc.
5. **Base Price Derivation**:
   - Determine base price from extracted data
   - Use fallback methods if primary extraction fails
6. **ML Optimization**:
   - Load pre-trained models
   - Run optimization algorithm to find best bid
   - Calculate win probability and expected profit
7. **Results Storage**:
   - Save results to database
   - Return to frontend for display

## 📊 API Endpoints

### POST `/api/jobs`
Create a new optimization job.

**Request:**
- `file` (multipart/form-data): PDF file
- `quality_score` (float, 0-1): Company quality/competitiveness score
- `min_bid` (float, optional): Minimum bid constraint
- `max_bid` (float, optional): Maximum bid constraint

**Response:**
```json
{
  "job_id": "uuid",
  "status": "queued"
}
```

### GET `/api/jobs`
List all jobs (last 50).

**Response:**
```json
[
  {
    "id": "uuid",
    "filename": "tender.pdf",
    "status": "succeeded",
    "created_at": "2024-01-01T00:00:00",
    "result": {
      "best_bid": 1000000,
      "p_win_at_best": 0.75,
      "expected_profit_at_best": 150000,
      "profit_if_won_at_best": 200000,
      "base_price": 800000
    }
  }
]
```

### GET `/api/jobs/{job_id}`
Get details of a specific job.

**Response:**
Same structure as individual job in list endpoint.

## 🤖 ML Models

The system uses two pre-trained machine learning models:

1. **Win Probability Classifier**: Predicts the probability of winning a tender at a given bid amount
2. **Profit Regressor**: Predicts the profit if the tender is won at a given bid amount

Both models use:
- Relative markup: `(bid_amount - base_price) / base_price`
- Quality score: User-provided company quality metric (0-1)

The optimization algorithm:
- Searches bid space using golden-section search
- Auto-expands search range if optimal bid is near boundaries
- Maximizes expected profit: `P(win) × Profit_if_won`

## 🧪 Development

### Training New Models

To train new ML models:

1. Generate or prepare training data:
```bash
cd website/Bob_The_Builders/ml
python3 data_synthesizer.py --n 10000 --outfile dataset.csv --seed 919839423
```

2. Train models:
```bash
python3 bid_optimization_pipeline_from_scratch.py \
  --csv dataset.csv \
  --opt_base 100000 \
  --opt_quality 0.72 \
  --auto_expand \
  --use_profit_formula
```

### Running Tests

Backend API can be tested using:
- FastAPI's automatic docs at `http://localhost:8000/docs`
- curl commands (see API Usage section)
- Postman or similar API clients

## 🐛 Troubleshooting

### Backend Issues
- **Models not found**: Ensure model files exist in `website/Bob_The_Builders/ml/models/`
- **Database errors**: Delete `backend_data.sqlite3` to reset the database
- **Import errors**: Ensure you're in the correct directory and virtual environment is activated

### Frontend Issues
- **API connection errors**: Verify backend is running on port 8000
- **Build errors**: Run `npm install` to ensure all dependencies are installed
- **Port conflicts**: Change Vite port in `vite.config.ts` or use `--port` flag

### PDF Processing Issues
- **OCR not working**: Ensure PaddleOCR dependencies are installed correctly
- **Extraction failures**: Check PDF format - scanned PDFs require OCR
- **Base price not found**: Verify PDF contains estimated cost or tender value information

## 📝 License

This project was developed for the Aurigo Hackathon (Karke Dikhaayenge).

## 👥 Contributing

This is a hackathon project. For improvements or contributions, please follow standard Git workflow practices.

## 🙏 Acknowledgments

- Built for Aurigo Hackathon
- Uses PaddleOCR for OCR capabilities
- Radix UI for accessible component primitives
- FastAPI for high-performance API framework

---

**Note**: This is an AI-powered tender optimization system. Always review recommendations with domain experts before making final bid decisions.
