# educational_service.py
"""
Servicio FastAPI que genera explicaciones pedagógicas adaptativas y micro‑quizzes
a partir del resultado del análisis forense y la predicción del modelo ML.

Requisitos (pip):
    fastapi, uvicorn, pydantic, openai (opcional)

Uso:
    uvicorn ml.educational_service:app --host 0.0.0.0 --port 6000

Si la variable de entorno `OPENAI_API_KEY` está definida, el servicio utilizará
OpenAI GPT‑4 para generar explicaciones y preguntas. En caso contrario, se
aplicará una plantilla estática basada en reglas simples.
"""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

# Intentar cargar la API de OpenAI (si está disponible)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    try:
        import openai
        openai.api_key = openai_api_key
    except Exception as e:
        openai_api_key = None
        print(f"Warning: OpenAI SDK not usable: {e}")
else:
    openai_api_key = None

app = FastAPI(title="PhishShield Educational Service", version="1.0")

class AnalysisResult(BaseModel):
    url: str
    score: float
    riskLevel: str  # ALTO, MEDIO, BAJO
    features: Dict[str, Any]
    details: List[str]

class ExplanationResponse(BaseModel):
    explanation: str
    quiz: List[Dict[str, Any]]  # Cada ítem: {question, options, answer}

def _static_explanation(data: AnalysisResult) -> ExplanationResponse:
    """Genera una explicación y preguntas de forma estática (sin LLM)."""
    # Texto base adaptado al nivel de riesgo
    risk_msg = {
        "ALTO": "La URL presenta múltiples indicadores de phishing. Se recomienda bloquearla y alertar al usuario.",
        "MEDIO": "La URL muestra señales de posible suplantación. Se sugiere revisarla con cautela.",
        "BAJO": "La URL parece legítima, aunque conviene monitorizarla.",
    }.get(data.riskLevel, "Nivel de riesgo no reconocido.")

    explanation = (
        f"Análisis de la URL **{data.url}**:\n\n"
        f"- Score total: {data.score}\n"
        f"- Nivel de riesgo: {data.riskLevel}\n"
        f"- Comentario: {risk_msg}\n\n"
        "Principales indicadores detectados:\n"
    )
    for d in data.details[:5]:  # mostrar los primeros 5 detalles
        explanation += f"  * {d}\n"
    explanation += "\nMantenga buenas prácticas al navegar: verifique siempre la URL y evite proporcionar credenciales en sitios sospechosos."

    # Quiz estático simple basado en features comunes
    quiz = []
    if data.features.get("entropy", 0) > 4.5:
        quiz.append({
            "question": "¿Qué indica una alta entropía en el dominio?",
            "options": [
                "Que el dominio es corto y fácil de recordar",
                "Que el dominio probablemente sea generado por algoritmo (DGA)",
                "Que el dominio pertenece a un sitio popular",
                "Que el dominio contiene solo letras ASCII"
            ],
            "answer": 1
        })
    if data.features.get("subdomains", 0) > 2:
        quiz.append({
            "question": "¿Por qué un número elevado de sub‑dominios puede ser sospechoso?",
            "options": [
                "Los sub‑dominios siempre indican phishing",
                "Los atacantes usan muchos sub‑dominios para ocultar la verdadera URL",
                "Los navegadores bloquean sitios con muchos sub‑dominios",
                "No hay implicaciones de seguridad"
            ],
            "answer": 1
        })
    # Si no hay preguntas generadas, añadir una genérica
    if not quiz:
        quiz.append({
            "question": "¿Cuál es la práctica recomendada al encontrar una URL sospechosa?",
            "options": [
                "Ingresar sus credenciales para comprobar",
                "Reportar a los equipos de seguridad y evitar interacciones",
                "Compartir la URL en redes sociales",
                "Ignorar y seguir navegando"
            ],
            "answer": 1
        })
    return ExplanationResponse(explanation=explanation, quiz=quiz)

async def _llm_explanation(data: AnalysisResult) -> ExplanationResponse:
    """Utiliza la API de OpenAI para generar la explicación y preguntas."""
    if not openai_api_key:
        raise RuntimeError("OpenAI API key not configured")

    prompt = (
        f"You are an educational assistant for a phishing detection platform. "
        f"Given the following analysis result, produce a concise Spanish explanation for a user and three multiple‑choice quiz questions (with four options each) that reinforce understanding. "
        f"Do not mention the LLM. Return a JSON object with keys 'explanation' and 'quiz' where each quiz item has 'question', 'options' (list), and 'answer' (index of correct option starting at 0)."
        f"\n\nAnalysis Result:\n{data.json()}"
    )
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800,
        )
        content = response.choices[0].message.content.strip()
        # Intentar parsear como JSON (el LLM debe devolver JSON)
        import json
        result = json.loads(content)
        return ExplanationResponse(**result)
    except Exception as e:
        # Fallback a la versión estática
        print(f"OpenAI request failed: {e}, falling back to static explanation")
        return _static_explanation(data)

@app.post("/explain", response_model=ExplanationResponse)
async def explain(result: AnalysisResult):
    """Genera una explicación pedagógica y un micro‑quiz a partir del análisis.
    Si la API de OpenAI está disponible, se usará; de lo contrario, se aplicará una plantilla estática.
    """
    if openai_api_key:
        return await _llm_explanation(result)
    else:
        return _static_explanation(result)

# Ejemplo de cómo probar localmente (no se ejecuta al iniciar el servicio)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000)
