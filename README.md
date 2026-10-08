# README.md (Español)

## 📚 PhishShield – Plataforma de detección de phishing

**PhishShield** es una solución modular y desacoplada para identificar URLs maliciosas mediante análisis forense, heurísticas avanzadas y un modelo de Machine Learning (Random Forest).  El proyecto está completamente traducido al español y sigue buenas prácticas de separación de responsabilidades, optimización y cumplimiento legal.

---

### 🏗️ Arquitectura de capas

```mermaid
flowchart LR
    subgraph Frontend[Panel SOC (React)]
        FE[Interfaz de usuario] -->|WebSocket| BE
    end
    subgraph Backend[Orquestador (Node/Express)]
        BE[API REST] -->|enqueue| MQ[Broker RabbitMQ]
        MQ -->|consume| Worker[Worker Node]
        Worker -->|request| ML[Micro‑servicio ML (FastAPI)]
        Worker -->|store| DB[(PostgreSQL)]
        Worker -->|emit| FE
    end
    subgraph ML[Micro‑servicio ML]
        ML -->|load| Model[Random Forest model.pkl]
    end
    subgraph Extras[Componentes auxiliares]
        Edu[Servicio educativo (FastAPI)] -->|explain| FE
        Val[Validación experimental (Jupyter)]
    end
    %% Fuentes externas
    ext1[Google SafeBrowsing] 
    ext2[VirusTotal]
    ext3[PhishTank]
    Worker -->|consulta| ext1
    Worker -->|consulta| ext2
    Worker -->|consulta| ext3
```

---

### ⚙️ Componentes principales
| Componente | Tecnologías | Responsabilidad |
|------------|-------------|-----------------|
| **Frontend** | React, Material‑UI, socket.io | Visualización en tiempo real, panel de control y quizzes educativos. |
| **Backend Orquestador** | Node.js, Express, RabbitMQ, PostgreSQL | API pública, encolado de análisis, persistencia y emisión de eventos. |
| **Motor forense** | `backend/engine/forensicEngine.js` | 19 validaciones (estructura URL, typosquatting, homógrafos, SSL, etc.). |
| **Decision Engine** | `backend/engine/decisionEngine.js` | Combina score forense y probabilidad ML, aplica regla de piso y determina nivel de riesgo. |
| **Micro‑servicio ML** | FastAPI, scikit‑learn, joblib | Modelo Random Forest que predice phishing a partir de 15 + 1 características. |
| **Componente educativo** | FastAPI, OpenAI (opcional) | Genera explicaciones adaptativas y micro‑quizzes. |
| **Validación experimental** | Jupyter Notebook, sklearn | Partición de PhiUSIIL, K‑Fold, bootstrap, intervalos de confianza. |
| **Evaluación** | k6, pytest, SUS survey | Métricas de precisión, latencia, usabilidad. |
| **Ética & Legal** | Documentación `point9_ethics_legal.md` | Cumplimiento Ley 1581 / 2012 y Decreto 1377 / 2013. |

---

### 🚀 Instalación y despliegue rápido
```bash
# 1️⃣ Clonar el repositorio y crear la rama de trabajo
git clone https://github.com/Wilcam1/Phishshield-1.2.git phishshield
cd phishshield
git checkout -b refactor/traduccion-espanol-y-arquitectura

# 2️⃣ Instalar dependencias del backend
cd backend
npm install  # Node, Express, amqplib, etc.

# 3️⃣ Instalar dependencias del motor forense y decision engine
npm install fast-levenshtein punycode node-forge puppeteer node-fetch

# 4️⃣ Instalar dependencias del ML
cd ../ml
pip install -r requirements.txt  # fastapi uvicorn scikit-learn pandas joblib openai (opcional)

# 5️⃣ Preparar base de datos y broker (Docker Compose)
cd ..
docker-compose up -d postgres rabbitmq

# 6️⃣ Entrenar el modelo (usar tu dataset)
python ml/train_random_forest.py --data ./data/phish_dataset.csv --output ./ml/model.pkl

# 7️⃣ Levantar servicios
# Backend
cd backend && npm run start &
# Micro‑servicio ML
cd ../ml && uvicorn service:app --host 0.0.0.0 --port 5000 &
# Servicio educativo (opcional)
cd ../ml && uvicorn educational_service:app --host 0.0.0.0 --port 6000 &

# 8️⃣ Acceder al panel SOC
Abrir http://localhost:3000 en el navegador.
```

---

### 🧪 Ejemplo de flujo de análisis
1. El usuario introduce una URL en el panel.
2. El frontend envía `POST /analyze` al backend.
3. El backend encola la petición y el **worker** ejecuta `forensicEngine.runAllValidations`.
4. El **worker** llama al micro‑servicio ML (`/predict`).
5. `decisionEngine.evaluateRisk` combina ambos resultados y devuelve **ALTO**, **MEDIO** o **BAJO**.
6. El frontend muestra el nivel de riesgo y, si el usuario lo solicita, consulta el **servicio educativo** para obtener una explicación y un quiz.

---

### 📦 Cambios de nombre de recursos (Refactor)
Todos los archivos, carpetas y variables fueron traducidos al español siguiendo las reglas de la fase 3 (no traducir librerías, palabras reservadas, claves API, etc.).  Los commits atómicos reflejan cada bloque de cambios.

---

### 📜 Licencia
Este proyecto se distribuye bajo la licencia **MIT**.  Ver el archivo `LICENSE` para más detalles.

---

### 📞 Contacto
- **Autor:** Wilson Rios
- **GitHub:** https://github.com/Wilcam1/Phishshield-1.2
- **Correo:** wilcam1@example.com

---

*Este README está disponible como artefacto `README.md` en el repositorio.*
