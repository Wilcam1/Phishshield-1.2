"""
train_random_forest.py
----------------------
Entrenamiento del modelo Random Forest para clasificación de URLs de phishing (Punto 4).

Requisitos (pip):
    pandas, scikit-learn, joblib, numpy

Uso:
    python ml/train_random_forest.py --datos ./data/phish_dataset.csv --salida ./ml/model.pkl

El script espera un archivo CSV con:
    - Una columna 'etiqueta' o 'label' con valores binarios: 0 (legítimo) o 1 (phishing).
    - Columnas con las características forenses numéricas y 'entropia'.
"""

import argparse
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix


def cargar_dataset(ruta_archivo: str) -> pd.DataFrame:
    """Carga y valida el archivo CSV que contiene el conjunto de datos."""
    if not os.path.exists(ruta_archivo):
        raise FileNotFoundError(f"Archivo de dataset no encontrado: {ruta_archivo}")
    df_datos = pd.read_csv(ruta_archivo)
    return df_datos


def entrenar_modelo(
    df_entrenamiento: pd.DataFrame,
    cantidad_estimadores: int = 200,
    profundidad_maxima: int = None,
    semilla_aleatoria: int = 42,
) -> RandomForestClassifier:
    """Entrena un clasificador Random Forest con ponderación balanceada de clases."""
    columna_objetivo = "etiqueta" if "etiqueta" in df_entrenamiento.columns else "label"
    X_entrenamiento = df_entrenamiento.drop(columns=[columna_objetivo]).values
    y_entrenamiento = df_entrenamiento[columna_objetivo].values

    clasificador = RandomForestClassifier(
        n_estimators=cantidad_estimadores,
        max_depth=profundidad_maxima,
        random_state=semilla_aleatoria,
        n_jobs=-1,
        class_weight="balanced",
    )
    clasificador.fit(X_entrenamiento, y_entrenamiento)
    return clasificador


def evaluar_modelo(
    clasificador: RandomForestClassifier,
    X_prueba,
    y_prueba,
) -> dict:
    """Calcula las métricas estándar de rendimiento del modelo sobre el conjunto de prueba."""
    predicciones = clasificador.predict(X_prueba)
    exactitud = accuracy_score(y_prueba, predicciones)
    precision_val = precision_score(y_prueba, predicciones, zero_division=0)
    sensibilidad = recall_score(y_prueba, predicciones, zero_division=0)
    puntuacion_f1 = f1_score(y_prueba, predicciones, zero_division=0)
    matriz_conf = confusion_matrix(y_prueba, predicciones)

    return {
        "exactitud": round(float(exactitud), 4),
        "precision": round(float(precision_val), 4),
        "sensibilidad": round(float(sensibilidad), 4),
        "f1_score": round(float(puntuacion_f1), 4),
        "matriz_confusion": matriz_conf.tolist(),
    }


def validacion_cruzada(df_datos: pd.DataFrame, pliegues: int = 5) -> list:
    """Ejecuta validación cruzada estratificada para asegurar la generalización del modelo."""
    columna_objetivo = "etiqueta" if "etiqueta" in df_datos.columns else "label"
    X = df_datos.drop(columns=[columna_objetivo]).values
    y = df_datos[columna_objetivo].values

    clasificador = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    estratificacion = StratifiedKFold(n_splits=pliegues, shuffle=True, random_state=42)
    puntuaciones = cross_val_score(clasificador, X, y, cv=estratificacion, scoring="f1")
    return puntuaciones


def principal():
    analizador = argparse.ArgumentParser(description="Entrenador de Random Forest para PhishShield")
    analizador.add_argument("--datos", "--data", dest="datos", required=True, help="Ruta al archivo CSV con características")
    analizador.add_argument("--salida", "--output", dest="salida", default="./ml/model.pkl", help="Ruta para guardar el modelo serializado")
    analizador.add_argument("--proporcion-prueba", "--test-size", dest="proporcion_prueba", type=float, default=0.2, help="Proporción del dataset para prueba (ej. 0.2)")

    argumentos = analizador.parse_args()

    print(f"Cargando dataset desde: {argumentos.datos}")
    df_completo = cargar_dataset(argumentos.datos)

    columna_objetivo = "etiqueta" if "etiqueta" in df_completo.columns else "label"
    df_entrenamiento, df_prueba = train_test_split(
        df_completo,
        test_size=argumentos.proporcion_prueba,
        stratify=df_completo[columna_objetivo],
        random_state=42,
    )

    print("Entrenando modelo Random Forest...")
    modelo_entrenado = entrenar_modelo(df_entrenamiento)

    X_prueba = df_prueba.drop(columns=[columna_objetivo]).values
    y_prueba = df_prueba[columna_objetivo].values
    metricas = evaluar_modelo(modelo_entrenado, X_prueba, y_prueba)

    print("\n--- Métricas de evaluación en conjunto de prueba ---")
    for nombre_metrica, valor in metricas.items():
        print(f"  {nombre_metrica}: {valor}")

    print("\nEjecutando validación cruzada (5 pliegues)...")
    puntuaciones_cv = validacion_cruzada(df_entrenamiento, pliegues=5)
    print(f"  Puntuaciones F1 por pliegue: {puntuaciones_cv}")
    print(f"  Media F1: {puntuaciones_cv.mean():.4f} (+/- {puntuaciones_cv.std():.4f})")

    directorio_salida = os.path.dirname(argumentos.salida)
    if directorio_salida:
        os.makedirs(directorio_salida, exist_ok=True)
    joblib.dump(modelo_entrenado, argumentos.salida)
    print(f"\nModelo serializado exitosamente en: {argumentos.salida}")


if __name__ == "__main__":
    principal()
