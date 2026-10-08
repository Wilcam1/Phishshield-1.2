# train_random_forest.py
"""
Entrenamiento del modelo Random Forest para clasificación de URLs phishing.

Requisitos (pip):
    pandas, scikit-learn, numpy

Uso:
    python train_random_forest.py --data ./data/phish_dataset.csv --output ./ml/model.pkl

El script asume que el CSV contiene:
    - una columna "label" con valores 0 (legítimo) o 1 (phishing)
    - 15 columnas de características forenses (ver forensicEngine.js) y una columna "entropy"
"""

import argparse
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def load_dataset(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found: {path}")
    df = pd.read_csv(path)
    return df

def train_model(df, n_estimators=200, max_depth=None, random_state=42):
    X = df.drop(columns=["label"]).values
    y = df["label"].values
    rf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_state,
        n_jobs=-1,
        class_weight="balanced",
    )
    rf.fit(X, y)
    return rf

def evaluate_model(rf, X_test, y_test):
    preds = rf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds)
    rec = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    cm = confusion_matrix(y_test, preds)
    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "confusion_matrix": cm.tolist(),
    }

def cross_validate(df, folds=5):
    X = df.drop(columns=["label"]).values
    y = df["label"].values
    rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, class_weight="balanced")
    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=42)
    scores = cross_val_score(rf, X, y, cv=cv, scoring="f1")
    return scores

def main():
    parser = argparse.ArgumentParser(description="Train Random Forest for PhishShield")
    parser.add_argument("--data", required=True, help="Path to CSV dataset with features + label")
    parser.add_argument("--output", default="./ml/model.pkl", help="Path to save the trained model")
    parser.add_argument("--test-size", type=float, default=0.2, help="Proportion of dataset for test split")
    args = parser.parse_args()

    df = load_dataset(args.data)
    # Split for final evaluation
    train_df, test_df = train_test_split(df, test_size=args.test_size, stratify=df["label"], random_state=42)
    model = train_model(train_df)
    metrics = evaluate_model(model, test_df.drop(columns=["label"]).values, test_df["label"].values)
    print("Evaluation on hold‑out test set:")
    for k, v in metrics.items():
        print(f"{k}: {v}")

    # Cross‑validation for robustness
    cv_scores = cross_validate(train_df)
    print(f"Cross‑validation F1 scores (5‑fold): {cv_scores}")
    print(f"Mean F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save model
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    joblib.dump(model, args.output)
    print(f"Model saved to {args.output}")

if __name__ == "__main__":
    main()
