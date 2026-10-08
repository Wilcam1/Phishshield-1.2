# 🛡️ PhishShield — Plataforma Integral de Detección de Phishing e Inteligencia de Amenazas

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random_Forest-f89939?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-Chromium_Sandbox-40b5a4?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**PhishShield** es una plataforma corporativa avanzada de ciberseguridad diseñada para proteger a organizaciones, PYMEs y colaboradores frente a ataques de ingeniería social, suplantación de identidad (*typosquatting* y homógrafos), robo de credenciales y enlaces maliciosos.

Combina un **pipeline multicapa de 19 validaciones técnicas**, un **Microservicio de Machine Learning en Python con Random Forest y Entropía de Shannon**, **inspección forense de certificados SSL/TLS y árboles DOM**, **emulación aislada en sandbox local con Puppeteer** y un **Asistente Educativo con IA Generativa y Micro-Quizzes interactivos**.

---

## 🌟 Arquitectura y Flujo del Sistema

```
                   ┌─────────────────────────────────────────────────────────────┐
                   │                 PhishShield Client Interface                │
                   │   (HTML5 + CSS3 Animations + Generative UI + Dark Mode)     │
                   └──────────────────────────────┬──────────────────────────────┘
                                                  │ HTTP / REST API
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                            Node.js / Express Core Backend (:3001)                            │
│                                                                                              │
│   ┌───────────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────┐   │
│   │    URL & Lexical Parser   │   │   Typosquatting & IDN     │   │   Risk Calculator    │   │
│   │   (IP, HTTP, Subdomains)  │   │  (Levenshtein / Unicode)  │   │ (Dynamic Multi-Tier) │   │
│   └─────────────┬─────────────┘   └─────────────┬─────────────┘   └──────────┬───────────┘   │
│                 │                               │                            │               │
│   ┌─────────────┴─────────────┐   ┌─────────────┴─────────────┐   ┌──────────┴───────────┐   │
│   │   Native TLS / SSL Audit  │   │   DOM & Form Inspector    │   │  Generative AI / LLM │   │
│   │  (Age, Trust Chain, SAN)  │   │   (Puppeteer Headless)    │   │ (Explanation & Quiz) │   │
│   └───────────────────────────┘   └───────────────────────────┘   └──────────────────────┘   │
└──────────────────────┬──────────────────────────┬────────────────────────────┬───────────────┘
                       │                          │                            │
        ┌──────────────▼─────────────┐   ┌────────▼─────────────┐   ┌──────────▼───────────────┐
        │  Python FastAPI ML (:8000) │   │  Threat Feeds APIs   │   │  Local Persistence / SOC │
        │  (Random Forest / Entropy) │   │ (VirusTotal / GSB)   │   │  (Audit History / JSON)  │
        └────────────────────────────┘   └──────────────────────┘   └──────────────────────────┘
```

---

## 🧠 Arquitectura Detallada de Machine Learning (`server/ml_service`)

El subsistema de Inteligencia Artificial de PhishShield está desacoplado como un **microservicio autónomo en Python 3.10+ (FastAPI + Uvicorn)** ubicado en el directorio [`server/ml_service/`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/phishshield1/server/ml_service). Proporciona evaluación probabilística en tiempo real sobre la legitimidad de cualquier URL.

```
server/ml_service/
├── extractor.py        # Pipeline de extracción de 15 características y entropía de Shannon
├── train.py            # Generación de datasets balanceados y entrenamiento de RandomForest
├── main.py             # API REST FastAPI con endpoints /predict, /health y /docs
├── model.joblib        # Modelo serializado pre-entrenado y listo para inferencia
└── requirements.txt    # Dependencias de Python requeridas
```

### 1. Vector de 15 Características Forenses y Léxicas (`extractor.py`)

A diferencia de modelos basados únicamente en palabras completas, el extractor descompone la URL utilizando `tldextract` y análisis de teoría de la información, extrayendo un vector con **15 variables numéricas y probabilísticas**:

| # | Característica | Tipo | Descripción y Relevancia en Ciberseguridad |
|---|---|---|---|
| 1 | `url_length` | Entero | Longitud total de la URL. Las URLs fraudulentas tienden a ser significativamente más largas para ofuscar el destino. |
| 2 | `domain_length` | Entero | Longitud del nombre de dominio limpio (sin prefijos `www.`). |
| 3 | `path_length` | Entero | Longitud del recurso o ruta interna (`pathname`). |
| 4 | `subdomains_count` | Entero | Número de subdominios anidados. Frecuente en tácticas de camuflaje (*ej. `banco.login.actualizar.com.ru`*). |
| 5 | `digits_in_domain` | Entero | Conteo de dígitos numéricos presentes dentro del nombre de dominio. |
| 6 | `digits_in_url` | Entero | Total de dígitos numéricos en la URL completa. |
| 7 | `hyphens_in_domain` | Entero | Conteo de guiones en el dominio (técnica estándar de *combosquatting* como `marca-segura-login`). |
| 8 | `dots_in_domain` | Entero | Número de puntos delimitadores dentro del dominio. |
| 9 | `special_chars_url` | Entero | Frecuencia de caracteres especiales de riesgo: `@`, `?`, `=`, `-`, `_`, `&`, `.`. |
| 10 | `domain_entropy` | Flotante | **Entropía de Shannon** del dominio: mide la aleatoriedad de los caracteres para detectar dominios creados mediante Algoritmos de Generación de Dominios (*DGA*). |
| 11 | `is_ip` | Binario ($0$ o $1$) | Alerta si la dirección es una IP directa (IPv4) en lugar de un nombre de dominio resoluble. |
| 12 | `is_https` | Binario ($0$ o $1$) | Presencia del protocolo seguro HTTPS ($1$) o HTTP inseguro ($0$). |
| 13 | `params_count` | Entero | Cantidad de parámetros de consulta (`query strings`) en la solicitud GET. |
| 14 | `suspicious_words_count` | Entero | Detección de términos críticos sensibles (`login`, `secure`, `bank`, `account`, `signin`, `password`, `verify`, `update`, `bancolombia`, `paypal`, `token`, etc.). |
| 15 | `tld_sospechoso` | Binario ($0$ o $1$) | Identifica TLDs gratuitos o de reputación riesgosa frecuentemente utilizados en campañas masivas (`.xyz`, `.top`, `.info`, `.club`, `.work`, `.gq`, `.cf`, `.tk`, `.ml`, `.ga`). |

#### Cálculo de la Entropía de Shannon:
$$\text{Entropía} = -\sum_{i=1}^{n} P(c_i) \log_2 P(c_i)$$
Donde $P(c_i)$ representa la probabilidad de ocurrencia de cada carácter en el dominio. Una entropía anormalmente alta denota cadenas pseudoaleatorias características de infraestructura maliciosa temporal.

---

### 2. Algoritmo y Entrenamiento del Modelo (`train.py`)

* **Algoritmo:** **`RandomForestClassifier`** de Scikit-Learn con ensamble de **100 árboles de decisión** (`n_estimators=100`, `max_depth=12`, `random_state=42`).
* **Resistencia al sobreajuste (Overfitting):** La profundidad máxima de 12 niveles previene la memorización de marcas específicas y favorece la generalización de patrones morfológicos.
* **Manejo Dual de Datasets:**
  1. **Dataset Real:** Si existe el archivo [`PhiUSIIL_Phishing_URL_Dataset.csv`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/PhiUSIIL_Phishing_URL_Dataset.csv) en la raíz, entrena automáticamente con muestras balanceadas reales.
  2. **Generador Sintético Autónomo:** Si no hay un CSV externo, el script genera dinámicamente un dataset balanceado de 2,000 muestras clasificadas:
     * **Clase 0 (Legítimas):** Dominios consolidados con combinaciones realistas de rutas corporativas.
     * **Clase 1 (Phishing):** Patrones avanzados de *combosquatting*, IPs expuestas, suplantaciones bancarias y parámetros comprometidos.
* **Auto-Recuperación (Cold Start):** Al iniciar la API en [`main.py`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/phishshield1/server/ml_service/main.py), si `model.joblib` no se encuentra en disco, el servicio ejecuta de forma transparente `train_model()` antes de aceptar peticiones, garantizando disponibilidad inmediata.

---

### 3. Especificación de la API de Machine Learning (FastAPI)

El microservicio se ejecuta de forma independiente en el puerto `8000`:

#### `POST /predict`
Recibe la URL objetivo y retorna la inferencia probabilística junto con las características extraídas.

* **Ejemplo de Solicitud:**
  ```bash
  curl -X POST http://127.0.0.1:8000/predict \
    -H "Content-Type: application/json" \
    -d '{"url": "https://bancolombia-login-secure.xyz/verify"}'
  ```

* **Ejemplo de Respuesta:**
  ```json
  {
    "is_fraud": true,
    "probability": 1.0,
    "features": {
      "url_length": 44,
      "domain_length": 29,
      "path_length": 7,
      "subdomains_count": 0,
      "digits_in_domain": 0,
      "digits_in_url": 0,
      "hyphens_in_domain": 2,
      "dots_in_domain": 1,
      "special_chars_url": 6,
      "domain_entropy": 4.12,
      "is_ip": 0,
      "is_https": 1,
      "params_count": 0,
      "suspicious_words_count": 3,
      "tld_sospechoso": 1
    }
  }
  ```

#### `GET /health`
Verifica el estado del servicio y la carga del modelo:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

#### `GET /docs`
Documentación interactiva Swagger UI disponible en: **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

### 4. Integración con el Backend Node.js y Tolerancia a Fallos (`mlService.js`)

* **Llamadas Concurrentes No Bloqueantes:** El servidor Node.js orquesta la consulta de ML en paralelo mediante `Promise.allSettled` simultáneamente con VirusTotal, PhishTank, inspección SSL y Puppeteer.
* **Control de Latencia:** Aplica un timeout estricto de **2.0 segundos** para evitar demoras en la respuesta al usuario final.
* **Degradación Elegante:** Si el microservicio de Python no está activo, el sistema continúa funcionando con el análisis heurístico, SSL, DOM y feeds externos sin interrumpir la operación ni arrojar errores 500.

---

### 5. Ponderación de Machine Learning en el Motor de Riesgo (`riskCalculator.js`)

La probabilidad calculada por el modelo de ML incide matemáticamente en la puntuación total de riesgo (escala de 0 a 10 puntos):

* **Probabilidad $\ge 80\%$:** **$+6$ puntos** de penalización (`Machine Learning: Phishing altamente probable`).
* **Probabilidad $\ge 50\%$ y $< 80\%$:** **$+4$ puntos** de penalización (`Machine Learning: Phishing probable`).
* **Probabilidad $< 20\%$:** **$-2$ puntos** de bonificación de confianza (`Machine Learning: Verificado limpio por modelo de clasificación`).

---

### 6. Visualización en Interfaz de Usuario y Asistente de IA

1. **Badge en Tiempo Real:** En el modal de *"Ver análisis detallado"*, se despliega el indicador **`Probabilidad IA (ML): XX.X%`** con resaltado dinámico verde ($\le 50\%$) o rojo de alerta ($> 50\%$).
2. **Asistente Educativo Contextual:** El módulo [`aiExplanationService.js`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/phishshield1/server/services/aiExplanationService.js) toma en cuenta el veredicto del modelo para redactar explicaciones comprensibles y formular micro-quizzes de capacitación adaptados al ataque.

---

## 🔍 Otras Capacidades del Sistema

### 1. Pipeline Heurístico y Forense (19 Reglas)
* **Heurística Léxica:** Detección de IPs directas, protocolo HTTP plano, variables sensibles expuestas (`password`, `token`), ofuscación de subdominios y patrones sospechosos.
* **Typosquatting (Levenshtein):** Identificación de dominios visual o fonéticamente cercanos a marcas protegidas (ej. `bancolornbia.com` frente a `bancolombia.com`).
* **Ataques de Homógrafos (Unicode / Punycode):** Detección de caracteres cirílicos o griegos que suplantan caracteres latinos (ej. `bаncolombia.com` con `а` cirílica `U+0430`).

### 2. Inspección Profunda de Certificados SSL/TLS (`sslInspector.js`)
* Auditoría de SNI, entidad emisora de confianza (DigiCert, Google Trust Services, GlobalSign, Let's Encrypt).
* Detección de certificados autofirmados, expirados o con cadenas de confianza rotas.
* Alerta si el certificado fue emitido hace **menos de 72 horas** (estrategia común en infraestructuras desechables de phishing).

### 3. Auditoría de DOM y Formularios Sensibles (`domInspector.js`)
* Emulación segura con Puppeteer en modo headless.
* Detección de campos `<input type="password">` y formularios de tarjetas bancarias / CVV en dominios no autorizados.
* Verificación de suplantación de títulos `<title>`.
* **Score Floor Automático:** Asigna automáticamente **Riesgo Alto ($\ge 7/10$)** si se detecta intento de captura de credenciales o información financiera.

### 4. Sandbox de Navegación Local (Puppeteer)
* Genera capturas de pantalla aisladas en el servidor para que el colaborador previsualice el aspecto del sitio web de forma segura sin exponer su navegador local a exploits o descargas automáticas (*drive-by downloads*).

### 5. Panel Administrativo Tipo SOC (Security Operations Center)
* Interfaz widescreen (`98vw` / `96vh`) con métricas clave (KPIs), gráfico Donut interactivo, exportación forense en CSV y alertas comunitarias en JSON.
* Gestión de credenciales administrativas con validación en tiempo real de contraseñas robustas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Backend Principal** | Node.js (v18+), Express.js (ESM), TLS Nativo, Axios |
| **Microservicio Machine Learning** | Python (3.10+), FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy, tldextract, Joblib |
| **Motor de Sandbox** | Puppeteer (Chromium Headless Sandbox) |
| **Frontend** | HTML5, CSS3 Variables, Keyframe Animations, Generative UI, JavaScript Vanilla (ESM) |
| **Inteligencia de Amenazas** | VirusTotal API, Google Safe Browsing API, PhishTank Feed, Google Gemini 1.5 Flash |
| **Persistencia Local** | Auditoría estructurada en JSON (`cache.json`, `history.json`, `reports.json`) |

---

## 🚀 Instalación y Puesta en Marcha

### 1. Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior instalada).
* [Python](https://www.python.org/) (versión 3.10 o superior instalada y agregada al PATH).

---

### Opción A: Inicio en 1 Clic con Scripts Automatizados (Windows) ⚡

Se incluyen scripts por lotes optimizados para levantar y apagar todo el ecosistema con un solo comando:

1. **Iniciar todo el sistema:**
   Haz doble clic sobre **[`iniciar_servicios.bat`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/iniciar_servicios.bat)** (o `iniciar.bat`).
   * Detecta automáticamente las rutas y el entorno virtual de Python.
   * Levanta el microservicio de Machine Learning en `http://localhost:8000`.
   * Levanta el servidor Node.js en `http://localhost:3001`.
   * Abre automáticamente el navegador en la plataforma web.

2. **Apagar todos los servicios:**
   Haz doble clic sobre **[`detener_servicios.bat`](file:///c:/Users/Wilson%20Rios/Documents/Proyectos/phishshield1%202/detener_servicios.bat)** (o `detener.bat`).
   * Libera los puertos `3001`, `3000` y `8000` y cierra los procesos de fondo limpiamente.

---

### Opción B: Puesta en Marcha Manual (Multiplataforma)

#### 1. Configurar el Backend (Node.js)
```bash
git clone https://github.com/Wilcam1/Phishshield-URL.git
cd phishshield1
npm install
```

#### 2. Configurar el Microservicio de Machine Learning (Python)
```bash
# Navegar a la carpeta del microservicio
cd server/ml_service

# En Windows:
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# En Linux / macOS:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

*(Opcional) Reentrenar el modelo manualmente:*
```bash
python train.py
```

#### 3. Configurar Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz de `phishshield1/` con la siguiente estructura:

```ini
# Puerto del servidor web
PORT=3001

# URL del microservicio de Machine Learning
ML_SERVICE_URL=http://localhost:8000

# Credenciales administrativas del Panel SOC
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Windows12@

# APIs de Inteligencia de Amenazas (Opcionales)
VIRUSTOTAL_API_KEY=tu_api_key_virustotal
GOOGLE_SAFE_BROWSING_API_KEY=tu_api_key_safebrowsing
GEMINI_API_KEY=tu_gemini_api_key_opcional
```

#### 4. Iniciar los Servicios Manualmente

* **Terminal 1 — Microservicio de Machine Learning:**
  ```bash
  cd server/ml_service
  # Con el entorno virtual activo:
  uvicorn main:app --host 127.0.0.1 --port 8000
  ```

* **Terminal 2 — Servidor Principal Web & API:**
  ```bash
  cd phishshield1
  npm start
  ```

La aplicación web estará disponible en: **[http://localhost:3001](http://localhost:3001)**  
La documentación Swagger del modelo ML en: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 🧪 Pruebas de Integración Automatizadas

PhishShield incluye una suite de pruebas que valida de extremo a extremo la integración entre el backend Express, las heurísticas y el microservicio de Machine Learning:

```bash
node test-analysis.js
```

### Casos de Prueba Verificados:
* ✅ **Sitios legítimos:** `google.com`, `bancolombia.com` $\to$ Riesgo BAJO, Probabilidad ML baja, SSL confiable.
* 🚨 **Combosquatting / Suplantación:** `bancolombia-login-secure.xyz` $\to$ Riesgo ALTO, Probabilidad ML 100%, TLD sospechoso.
* 🚨 **Typosquatting (Levenshtein):** `bancolornbia.com` $\to$ Riesgo ALTO/MEDIO, Alerta de distancia de edición.
* 🚨 **Ataques de Homógrafos:** `bаncolombia.com` (con `а` cirílica `U+0430`) $\to$ Riesgo ALTO, Alerta Punycode.
* ⚠️ **IP / HTTP Inseguro:** `http://192.168.1.1/login` $\to$ Riesgo MEDIO, Sin cifrado TLS.

---

## 📁 Estructura del Repositorio

```text
phishshield1/
├── iniciar_servicios.bat       # Script Windows para levantar Node.js + FastAPI en 1 clic
├── detener_servicios.bat       # Script Windows para apagar todos los servicios
├── iniciar.bat                 # Acceso rápido a iniciar_servicios.bat
├── detener.bat                 # Acceso rápido a detener_servicios.bat
├── client/                     # Frontend de la plataforma
│   ├── adminManager.js         # Panel SOC, métricas, filtros y exportaciones
│   ├── apiClient.js            # Cliente HTTP REST para comunicación con el backend
│   ├── app.js                  # Orquestador del flujo cliente
│   ├── storage.js              # Almacenamiento local del historial
│   ├── tipsEngine.js           # Motor de consejos de seguridad
│   └── uiManager.js            # Renderizado de UI, Asistente IA, Micro-Quiz y DOM
├── server/                     # Backend Node.js
│   ├── ml_service/             # Microservicio de Machine Learning en Python
│   │   ├── extractor.py        # Extractor de 15 características forenses y entropía de Shannon
│   │   ├── train.py            # Generador de datasets y entrenamiento de RandomForest
│   │   ├── main.py             # API REST FastAPI (/predict, /health, /docs)
│   │   ├── requirements.txt    # Dependencias de Python (FastAPI, scikit-learn, etc.)
│   │   ├── model.joblib        # Pesos del modelo entrenado y serializado
│   │   └── venv/               # Entorno virtual de Python
│   ├── analyzers/              # Algoritmos de análisis heurístico y forense
│   │   ├── domInspector.js     # Inspección de formularios DOM con Puppeteer
│   │   ├── riskCalculator.js   # Motor de ponderación dinámica y puntuación de riesgo
│   │   ├── sslInspector.js     # Auditoría nativa de certificados TLS/SSL
│   │   ├── typosquattingDetector.js # Detección de homógrafos y distancia Levenshtein
│   │   └── urlAnalyzer.js      # Extractor de características léxicas en Node.js
│   ├── repositories/           # Repositorios de persistencia JSON
│   ├── services/               # Integraciones externas y microservicios
│   │   ├── mlService.js        # Cliente HTTP Axios para conexión con FastAPI (:8000)
│   │   ├── aiExplanationService.js # Explicaciones contextuales con IA y micro-quizzes
│   │   ├── cacheService.js     # Sistema de caché de análisis en memoria
│   │   ├── phishTankService.js # Integración con base de datos PhishTank
│   │   ├── safeBrowsingService.js # Integración con Google Safe Browsing
│   │   └── virusTotalService.js# Integración con VirusTotal API
│   └── app.js                  # Servidor Express principal y orquestador paralelo
├── index.html                  # Interfaz de usuario interactiva
├── styles.css                  # Sistema de diseño, animaciones y soporte responsivo
├── test-analysis.js            # Suite de pruebas de integración automatizadas
├── server.js                   # Punto de entrada de la aplicación Node.js
├── package.json                # Dependencias y scripts de Node.js
├── .env.example                # Plantilla de variables de entorno documentada
└── README.md                   # Documentación técnica completa del proyecto
```

---

## 🛡️ Descargo de Responsabilidad
Este software ha sido diseñado con fines de protección corporativa, análisis forense y concienciación en ciberseguridad. Las validaciones heurísticas y modelos de aprendizaje automático representan una sólida capa defensiva complementaria a los sistemas de seguridad de punto final (*EDR*) y pasarelas de correo seguro (*SEG*).
