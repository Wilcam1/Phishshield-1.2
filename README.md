# 🛡️ PhishShield - Plataforma Integral de Detección Forense de Phishing

PhishShield es un sistema avanzado de ciberseguridad defensiva y análisis forense automatizado de URLs y dominios sospechosos. Integra una arquitectura fullstack en un único repositorio con un frontend moderno en **Angular 22** y un motor de inspección multicapa de 19 factores en **Node.js (Express 5)**.

---

## 🚀 Arquitectura del Sistema

```text
[ Cliente Web / Angular 22 ]
         │
         ▼  (HTTPS / REST)
[ API Gateway / Express 5 con Helmet & Rate Limiting ]
         │
         ├── 1. Validador Antifraude y SSRF (OWASP)
         ├── 2. Motor Heurístico y Typosquatting (Distancia Levenshtein / Caracteres Homoglifos)
         ├── 3. Inspección Criptográfica SSL/TLS (X.509, Emisor, Caducidad, Wildcards)
         ├── 4. Motor de Renderizado Headless DOM (Puppeteer / Formularios / Iframes)
         ├── 5. Conectores de Inteligencia de Amenazas (VirusTotal, Google Safe Browsing, PhishTank)
         ├── 6. Asistente Educativo y Generativo de Ciberseguridad (Gemini AI)
         └── 7. Módulo de Autenticación Segura (Scrypt + CSPRNG + Tokens con TTL)
```

---

## 📋 Requisitos del Entorno

- **Node.js**: `v20.x` o superior
- **NPM**: `v10.x` o superior
- **Chromium / Chrome**: Necesario para captura visual y auditoría profunda de DOM (incluido automáticamente en Docker).

---

## 🛠️ Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
git clone https://github.com/tu-usuario/PhishShield-Angular.git
cd "PhishShield - Angular"
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de plantilla `.env.example` a `.env`:

```bash
cp .env.example .env
```

Parámetros principales en `.env`:

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha de la API Express | `3000` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | `production` |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos separados por comas | `http://localhost:4200,http://localhost:3000` |
| `ADMIN_USERNAME` | Usuario administrador para panel SOC | `admin` |
| `ADMIN_PASSWORD` | Contraseña maestra del administrador | *(Definir en despliegue)* |
| `VIRUSTOTAL_API_KEY` | Clave API de VirusTotal (Opcional) | - |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Clave API de Google Safe Browsing (Opcional) | - |
| `GEMINI_API_KEY` | Clave API de Google Gemini (Opcional) | - |

---

## 💻 Ejecución del Proyecto

### Modo Desarrollo (Frontend + Backend concurrentes)
```bash
npm start
```
- **Frontend Angular**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000`

### Solo Servidor Backend
```bash
npm run server
```

### Solo Cliente Angular
```bash
npm run client
```

### Compilación para Producción (Build)
```bash
npm run build
```
*(Los artefactos optimizados se generan en `dist/phishshield-angular` y son servidos automáticamente por el backend en producción).*

---

## 🧪 Pruebas Automatizadas y Calidad

El proyecto cuenta con una suite integral de pruebas unitarias, de integración y de seguridad:

```bash
# Ejecutar todas las pruebas (Frontend + Backend)
npm run test:all

# Ejecutar pruebas del backend (Vitest)
npm run test:server

# Ejecutar pruebas del frontend (Vitest / Angular)
npm test

# Verificación de linting estático
npm run lint
```

---

## 🐳 Despliegue en Producción con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
docker-compose up -d --build
```

El servicio estará disponible en `http://localhost:3000` con:
- Healthcheck activo cada 30 segundos.
- Usuario no root `node` para máxima seguridad.
- Soporte para Chromium sin permisos privilegiados (`--no-sandbox`).
- Reinicio automático ante fallos (`unless-stopped`).

### Opción 2: Docker CLI Directo

```bash
docker build -t phishshield:latest .
docker run -d -p 3000:3000 --name phishshield-app --restart unless-stopped phishshield:latest
```

---

## 🔒 Medidas de Seguridad Implementadas (OWASP)

1. **Defensa contra SSRF (Server-Side Request Forgery)**: Filtro estricto que bloquea peticiones a `127.0.0.1`, `localhost`, rangos privados RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) y metadatos de proveedores cloud (`169.254.169.254`).
2. **Autenticación Criptográfica Robusta**:
   - Algoritmo de derivación de claves **Scrypt** con sal de 16 bytes.
   - Tokens de sesión generados mediante CSPRNG (`crypto.randomBytes(32)`).
   - Expiración automática de tokens mediante TTL (2 horas).
   - Comparación de contraseñas resistente a timing attacks (`crypto.timingSafeEqual`).
3. **Control de Flujo y Mitigación DoS**:
   - Límite global: 300 peticiones / 15 min por IP.
   - Límite en análisis y captura: 60 peticiones / 5 min.
   - Límite de inicio de sesión: 8 intentos fallidos / 15 min.
4. **Cabeceras HTTP Seguras**: `Helmet` con `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, y CORS restrictivo configurable.
5. **Apagado Limpio (Graceful Shutdown)**: Manejo nativo de `SIGTERM` y `SIGINT` cerrando conexiones HTTP activas sin pérdida de datos.

---

## 📡 Catálogo de Endpoints de la API

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Verificación de estado del servidor y uptime |
| `POST` | `/analizar` | Público (Limitado) | Ejecuta el análisis forense multicapa de una URL |
| `POST` | `/reportar` | Público (Limitado) | Registra una URL como phishing en la lista comunitaria |
| `GET` | `/estadisticas` | Público | Métricas agregadas de detección y volumen |
| `GET` | `/historial` | Público | Lista histórica de análisis recientes |
| `GET` | `/api/screenshot` | Público (Limitado) | Captura visual en tiempo real de la página |
| `POST` | `/api/login` | Público (Limitado) | Autenticación de administradores |
| `GET` | `/api/admin/export/reportes` | Privado (Token) | Exportación en formato CSV de reportes |
| `POST` | `/api/admin/cambiar-password`| Privado (Token) | Actualización de contraseña administrativa |
