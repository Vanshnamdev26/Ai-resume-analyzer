# CV Insight — AI Resume Analyzer

A full-stack starter project that compares a PDF resume with a job description and reports text similarity, detected skill overlap, potential skill gaps, and resume improvement suggestions.

## Features
- PDF text extraction using PyMuPDF
- TF-IDF keyword/text similarity score
- Rule-based detection of common technical and professional skills
- Matched skills and potential missing skills
- Actionable, rule-based suggestions
- Responsive React UI with burgundy styling
- FastAPI backend; no paid AI API key required
- Uploaded PDFs are processed in memory and are not saved by this app

> **Important:** This MVP uses TF-IDF and a built-in skill list. It is not a large language model, an ATS simulator, or a hiring decision tool. Scores are indicative and may miss synonyms, context, or skills phrased differently. Don't add skills you don't genuinely have. For a stronger AI version, add a sentence-transformer embedding model or an LLM API with structured output and evaluation.

## Requirements
- Python 3.10+
- Node.js 18+

## 1. Start the backend

Open a terminal in the project folder:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows CMD**
```cmd
.venv\Scripts\activate.bat
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs

## 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually http://localhost:5173.

## Configuration
The frontend defaults to `http://localhost:8000`. For a deployed API, create `frontend/.env` with:

```env
VITE_API_URL=https://your-api-domain.example
```

Restart the Vite server after changing environment variables. Configure the backend CORS allowlist in `backend/main.py` to include your deployed frontend domain before production deployment.

## API endpoints
- `GET /` — API status
- `GET /api/health` — health check
- `POST /api/analyze` — multipart form with `resume` PDF and `job_description`
- `POST /api/analyze-text` — JSON with `resume_text` and `job_description` (useful for testing)

## Before production
- Add file/content scanning, stricter upload validation, rate limits, and request-size limits at the server/proxy.
- Restrict CORS to your actual frontend origin.
- Add privacy/retention controls and a clear privacy notice.
- Add tests, observability, and more comprehensive skill/synonym coverage.
- If adding an LLM provider, keep API keys on the backend in environment variables; never expose secrets in `VITE_*` variables.
