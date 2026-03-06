"""
Train and save the crime type classification model.
Uses TF-IDF vectorizer + Linear SVM for fast, accurate text classification.

Run: python train_model.py
Produces: model/classifier.joblib, model/vectorizer.joblib, model/label_encoder.joblib
"""

import os
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from training_data import TRAINING_DATA

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")


def train():
    texts = [t[0] for t in TRAINING_DATA]
    labels = [t[1] for t in TRAINING_DATA]

    print(f"Training samples: {len(texts)}")
    print(f"Crime categories: {len(set(labels))} — {sorted(set(labels))}")

    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)

    # TF-IDF + LinearSVC pipeline
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True,
    )
    X = vectorizer.fit_transform(texts)

    clf = LinearSVC(C=1.0, max_iter=10000, class_weight="balanced")
    clf.fit(X, y)

    # Cross-validation score
    scores = cross_val_score(
        Pipeline([("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words="english", sublinear_tf=True)),
                  ("clf", LinearSVC(C=1.0, max_iter=10000, class_weight="balanced"))]),
        texts, y, cv=5, scoring="accuracy"
    )
    print(f"Cross-validation accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")

    # Save artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(MODEL_DIR, "classifier.joblib"))
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.joblib"))
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, "label_encoder.joblib"))

    # Save label map for quick reference
    label_map = {int(i): lbl for i, lbl in enumerate(label_encoder.classes_)}
    with open(os.path.join(MODEL_DIR, "label_map.json"), "w") as f:
        json.dump(label_map, f, indent=2)

    print(f"Model saved to {MODEL_DIR}/")
    print(f"Labels: {label_map}")


if __name__ == "__main__":
    train()
