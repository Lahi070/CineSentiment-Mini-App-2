# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
import pandas as pd
import io
import os
# pyrefly: ignore [missing-import]
from ml_pipeline import SentimentPipeline

app = FastAPI(title="CineSentiment API")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, change to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths relative to backend directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'Model Data')

pipeline = None

@app.on_event("startup")
async def startup_event():
    global pipeline
    try:
        pipeline = SentimentPipeline(
            model_path=os.path.join(MODEL_DIR, "cinesentiment_v2.keras"),
            tokenizer_path=os.path.join(MODEL_DIR, "tokenizer_v2.json"),
            model_config_path=os.path.join(MODEL_DIR, "model_config_v2.json"),
            clean_text_config_path=os.path.join(MODEL_DIR, "clean_text_config.json")
        )
    except Exception as e:
        print(f"Error initializing pipeline: {e}")

class ReviewRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_sentiment(request: ReviewRequest):
    if not pipeline:
        raise HTTPException(status_code=500, detail="Model pipeline not initialized")
        
    score = pipeline.predict([request.text])[0]
    sentiment = "Positive" if score >= 0.5 else "Negative"
    confidence = score if sentiment == "Positive" else 1 - score
    
    # Get keywords for highlighting
    highlights = pipeline.get_keyword_highlights(request.text, float(score))
    
    return {
        "sentiment": sentiment,
        "score": float(score),
        "confidence": float(confidence),
        "highlights": highlights
    }

@app.post("/batch-predict")
async def batch_predict(file: UploadFile = File(...)):
    if not pipeline:
        raise HTTPException(status_code=500, detail="Model pipeline not initialized")
        
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only TXT files are supported.")
        
    contents = await file.read()
    try:
        text_content = contents.decode('utf-8')
    except UnicodeDecodeError:
        text_content = contents.decode('latin-1')
        
    reviews = [line.strip() for line in text_content.splitlines() if line.strip()]
    
    if not reviews:
        raise HTTPException(status_code=400, detail="The TXT file is empty or contains no valid text.")
        
    # Predict in batches if necessary, but pipeline handles lists natively
    scores = pipeline.predict(reviews)
    
    results = []
    for review, score in zip(reviews, scores):
        sentiment = "Positive" if score >= 0.5 else "Negative"
        confidence = score if sentiment == "Positive" else 1 - score
        results.append({
            "text": review,
            "sentiment_score": float(confidence),
            "confidence": float(confidence),
            "sentiment_label": sentiment
        })
        
    return results
