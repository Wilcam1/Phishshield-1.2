"""
educational_service.py
----------------------
Servicio FastAPI que genera explicaciones pedagógicas adaptativas y micro-quizzes
interactivos para fortalecer la concienciación contra el phishing (Punto 6).

Requisitos (pip):
    fastapi, uvicorn, pydantic, openai (opcional)

Uso:
    uvicorn ml.educational_service:app --host 0.0.0.0 --port 6000
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Verificación de clave para proveedor de IA Generativa
clave_api_openai = os.getenv("OPENAI_API_KEY")

app = FastAPI(
    title="PhishShield - Servicio Educativo Asistido por IA",
    description="Generador adaptativo de explicaciones técnicas y micro-quizzes pedagógicos",
    version="1.2.0",
)


class ResultadoAnalisis(BaseModel):
    """Modelo de datos con los resultados del análisis forense y heurístico."""
    url: str
    puntuacion: float = Field(default=0.0, alias="score")
    nivel_riesgo: str = Field(default="BAJO", alias="riskLevel")
    caracteristicas: Dict[str, Any] = Field(default_factory=dict, alias="features")
    detalles: List[str] = Field(default_factory=list, alias="details")

    class Config:
        allow_population_by_field_name = True


class ItemCuestionario(BaseModel):
    """Estructura de una pregunta de selección múltiple."""
    pregunta: str
    opciones: List[str]
    indice_correcto: int


class RespuestaEducativa(BaseModel):
    """Respuesta consolidada con explicación adaptada y micro-quiz."""
    explicacion: str
    cuestionario: List[ItemCuestionario]


def _generar_explicacion_estatica(datos: ResultadoAnalisis) -> RespuestaEducativa:
    """Genera una explicación pedagógica guiada mediante reglas heurísticas (sin dependencia de red)."""
    mensajes_riesgo = {
        "ALTO": "La URL analizada presenta anomalías estructurales severas consistentes con campañas activas de phishing.",
        "MEDIO": "La URL presenta indicios sospechosos que sugieren posible suplantación o infraestructura de reciente creación.",
        "BAJO": "La URL no muestra señales evidentes de suplantación y coincide con patrones de sitios confiables.",
    }

    mensaje_base = mensajes_riesgo.get(datos.nivel_riesgo.upper(), "Nivel de riesgo no categorizado.")

    texto_explicacion = (
        f"### Análisis Pedagógico de Seguridad\n\n"
        f"**URL examinada:** `{datos.url}`\n"
        f"- **Puntuación de riesgo:** {datos.puntuacion} puntos.\n"
        f"- **Clasificación:** Nivel {datos.nivel_riesgo.upper()}.\n\n"
        f"**Diagnóstico:** {mensaje_base}\n\n"
        f"**Hallazgos técnicos destacados:**\n"
    )

    for detalle in datos.detalles[:5]:
        texto_explicacion += f"- {detalle}\n"

    texto_explicacion += (
        "\n> **Recomendación para colaboradores:** Antes de ingresar contraseñas o datos corporativos, "
        "compruebe el dominio exacto en la barra de direcciones y nunca acceda desde enlaces no solicitados."
    )

    preguntas = []

    # Pregunta contextual: Entropía
    entropia = datos.caracteristicas.get("entropia", datos.caracteristicas.get("entropy", 0))
    if entropia > 4.5:
        preguntas.append(
            ItemCuestionario(
                pregunta="¿Qué indica una alta entropía en el nombre de un dominio web?",
                opciones=[
                    "Que el dominio es breve y fácil de recordar por los clientes.",
                    "Que probablemente fue generado de forma automatizada por un algoritmo (DGA).",
                    "Que cuenta con el certificado de seguridad más avanzado.",
                    "Que el sitio web carga más rápido de lo habitual.",
                ],
                indice_correcto=1,
            )
        )

    # Pregunta contextual: Subdominios
    subdominios = datos.caracteristicas.get("subdominios", datos.caracteristicas.get("subdomains", 0))
    if subdominios > 2:
        preguntas.append(
            ItemCuestionario(
                pregunta="¿Por qué los atacantes suelen usar múltiples subdominios en sus enlaces fraudulentos?",
                opciones=[
                    "Para engañar visualmente al usuario imitando marcas legítimas.",
                    "Porque es un requisito técnico obligatorio para configurar HTTPS.",
                    "Para reducir los costos del servidor web.",
                    "Para mejorar el posicionamiento en los motores de búsqueda.",
                ],
                indice_correcto=0,
            )
        )

    # Pregunta de refuerzo general
    if not preguntas:
        preguntas.append(
            ItemCuestionario(
                pregunta="Si un enlace sospechoso le solicita iniciar sesión de emergencia, ¿qué debe hacer?",
                opciones=[
                    "Ingresar los datos para verificar si la cuenta está realmente bloqueada.",
                    "Ignorar el enlace, reportarlo al equipo de seguridad y acceder al portal oficial directamente.",
                    "Reenviar el correo a todos sus compañeros para preguntar si es real.",
                    "Hacer clic y cambiar la contraseña inmediatamente desde ese sitio.",
                ],
                indice_correcto=1,
            )
        )

    return RespuestaEducativa(explicacion=texto_explicacion, cuestionario=preguntas)


@app.post("/explicar", response_model=RespuestaEducativa)
@app.post("/explain", response_model=RespuestaEducativa)
async def explicar_analisis(resultado: ResultadoAnalisis):
    """Punto de acceso API para obtener la explicación adaptativa y el micro-quiz."""
    return _generar_explicacion_estatica(resultado)


@app.get("/salud")
@app.get("/health")
def verificar_salud():
    """Comprobación de estado del microservicio."""
    return {"estado": "operativo", "servicio": "educativo-phishshield"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000)
