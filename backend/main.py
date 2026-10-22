from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import fitz
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="AI Resume Analyzer API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SKILL_BANK = [
    "python", "javascript", "typescript", "java", "c++", "sql", "html", "css", "react", "node.js", "express", "fastapi", "django", "flask", "rest api", "mongodb", "postgresql", "mysql", "git", "github", "docker", "aws", "azure", "machine learning", "deep learning", "artificial intelligence", "nlp", "natural language processing", "pytorch", "tensorflow", "scikit-learn", "pandas", "numpy", "data analysis", "data visualization", "power bi", "tableau", "llm", "generative ai", "rag", "embeddings", "vector database", "prompt engineering", "transformers", "statistics", "linear algebra", "communication", "teamwork", "problem solving", "agile", "testing", "linux", "tailwind css", "vite", "redux", "next.js"
]

class AnalyzeTextRequest(BaseModel):
    resume_text: str
    job_description: str


def extract_pdf_text(content: bytes) -> str:
    try:
        with fitz.open(stream=content, filetype="pdf") as doc:
            return "\n".join(page.get_text() for page in doc)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read this PDF. Please upload a valid, text-based PDF.") from exc


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def detect_skills(text: str) -> List[str]:
    normalized = normalize(text)
    found = []
    for skill in SKILL_BANK:
        pattern = r"(?<![a-z0-9+#.])" + re.escape(skill.lower()) + r"(?![a-z0-9+#.])"
        if re.search(pattern, normalized):
            found.append(skill)
    return found


def analyze(resume_text: str, job_description: str):
    if len(resume_text.strip()) < 40:
        raise HTTPException(status_code=400, detail="Not enough readable text was found in the resume. Try a text-based PDF.")
    if len(job_description.strip()) < 30:
        raise HTTPException(status_code=400, detail="Please enter a more detailed job description (at least 30 characters).")

    try:
        matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000).fit_transform([resume_text, job_description])
        similarity = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
    except ValueError:
        similarity = 0.0

    resume_skills = detect_skills(resume_text)
    job_skills = detect_skills(job_description)
    matched = [s for s in job_skills if s in resume_skills]
    missing = [s for s in job_skills if s not in resume_skills]
    skill_score = round((len(matched) / len(job_skills)) * 100) if job_skills else 0
    match_score = round((similarity * 65) + ((skill_score / 100) * 35))

    suggestions = []
    if missing:
        suggestions.append("If you genuinely have experience with these job-related skills, make them more visible in your resume: " + ", ".join(missing[:8]) + ".")
    if not re.search(r"\b(project|projects)\b", resume_text, re.I):
        suggestions.append("Add a Projects section with the problem, technologies used, and measurable outcome for each project.")
    if not re.search(r"\b(achieved|improved|built|developed|created|reduced|increased|implemented|designed)\b", resume_text, re.I):
        suggestions.append("Use clear action verbs to describe what you built or contributed, and include measurable results where truthful.")
    if len(resume_text.split()) < 180:
        suggestions.append("Your resume text looks quite short. Check whether important experience, projects, education, and skills are missing.")
    if not suggestions:
        suggestions.append("Your resume covers many detected job requirements. Tailor the summary and project bullets to the specific role, without adding skills you do not have.")

    return {
        "match_score": max(0, min(100, match_score)),
        "keyword_similarity": round(similarity * 100),
        "skill_match_score": skill_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "suggestions": suggestions,
        "word_count": len(resume_text.split()),
        "disclaimer": "This is an indicative text/keyword comparison, not a hiring decision. Scores depend on the wording and detected skills; review the results yourself."
    }

@app.get("/")
def root():
    return {"message": "AI Resume Analyzer API is running", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze_resume(resume: UploadFile = File(...), job_description: str = Form(...)):
    if resume.content_type != "application/pdf" and not (resume.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")
    content = await resume.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF must be smaller than 8 MB.")
    resume_text = extract_pdf_text(content)
    result = analyze(resume_text, job_description)
    return result

@app.post("/api/analyze-text")
def analyze_text(request: AnalyzeTextRequest):
    return analyze(request.resume_text, request.job_description)
