# backend/app.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from nlp_pipeline import MindScribePipeline

# Initialize FastAPI App
app = FastAPI(
    title="MindScribe NLP API",
    description="Mental Wellness Free-Text Emotional Analysis & 8-Stage NLP Engine",
    version="1.0.0"
)

# Enable CORS for frontend clients (React dev server on 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class JournalRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Free-text journal entry submitted by the user")

# Initialize Pipeline instance once at startup
try:
    pipeline = MindScribePipeline(
        model_path="mindscribe_model.pkl",
        vec_path="mindscribe_vectorizer.pkl",
        corpus_path="mindscribe_curated_5k.csv"
    )
    print("✅ MindScribe NLP Engine loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load NLP Pipeline artifacts: {e}")
    pipeline = None

# ── ENDPOINTS ─────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "online",
        "service": "MindScribe NLP Backend",
        "model_loaded": pipeline is not None
    }

@app.post("/analyze", tags=["NLP Analysis"])
async def analyze_journal(request: JournalRequest):
    """
    Main analysis endpoint.
    Accepts journal text and returns:
    1. Clean emotional wellness report (no percentages or scores)
    2. Complete 8-stage NLP pipeline trace for explainability & faculty review
    """
    if pipeline is None:
        raise HTTPException(status_code=500, detail="NLP Pipeline is not initialized. Check model artifacts.")
    
    clean_text = request.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Journal entry cannot be blank or contain only whitespace.")
    
    try:
        results = pipeline.analyze(clean_text)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Local Runner
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)