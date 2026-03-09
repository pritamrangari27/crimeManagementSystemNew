"""
FastAPI service for crime type classification.

Endpoints:
  POST /classify-fir  — Classify FIR text into a crime type
  GET  /health         — Health check
  GET  /labels         — List supported crime categories

Run:  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import joblib
import json
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

app = FastAPI(title="Crime Type Classifier", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model artifacts at startup ──
classifier = None
vectorizer = None
label_encoder = None


@app.on_event("startup")
def load_model():
    global classifier, vectorizer, label_encoder

    clf_path = os.path.join(MODEL_DIR, "classifier.joblib")
    vec_path = os.path.join(MODEL_DIR, "vectorizer.joblib")
    le_path = os.path.join(MODEL_DIR, "label_encoder.joblib")

    if not all(os.path.exists(p) for p in [clf_path, vec_path, le_path]):
        print("⚠️  Model files not found. Run `python train_model.py` first.")
        return

    classifier = joblib.load(clf_path)
    vectorizer = joblib.load(vec_path)
    label_encoder = joblib.load(le_path)
    print(f"✓ Model loaded — {len(label_encoder.classes_)} crime categories")


# ── Schemas ──
class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000, description="FIR description text")


class ClassifyResponse(BaseModel):
    crime_type: str
    confidence: float
    all_scores: dict


# ── Endpoints ──
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": classifier is not None,
        "categories": len(label_encoder.classes_) if label_encoder else 0,
    }


@app.get("/labels")
def labels():
    if label_encoder is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"labels": list(label_encoder.classes_)}


@app.post("/classify-fir", response_model=ClassifyResponse)
def classify_fir(req: ClassifyRequest):
    if classifier is None or vectorizer is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train_model.py first.")

    # Vectorize input
    X = vectorizer.transform([req.text])

    # Get decision function scores for all classes
    decision_scores = classifier.decision_function(X)[0]

    # Convert to pseudo-probabilities via softmax
    exp_scores = np.exp(decision_scores - np.max(decision_scores))
    probabilities = exp_scores / exp_scores.sum()

    predicted_idx = int(np.argmax(probabilities))
    predicted_label = label_encoder.inverse_transform([predicted_idx])[0]
    confidence = float(probabilities[predicted_idx])

    # Build scores dict (top 5)
    all_indices = np.argsort(probabilities)[::-1][:5]
    all_scores = {
        label_encoder.inverse_transform([int(i)])[0]: round(float(probabilities[i]), 4)
        for i in all_indices
    }

    return ClassifyResponse(
        crime_type=predicted_label,
        confidence=round(confidence, 4),
        all_scores=all_scores,
    )
