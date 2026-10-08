@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title PhishShield - Iniciador de Servicios

echo ============================================================
echo        PHISHSHIELD - INICIADOR DE SERVICIOS
echo ============================================================
echo.

REM 1. Detectar directorio raiz del proyecto
set "BASE_DIR=%~dp0"
if exist "%BASE_DIR%phishshield1\package.json" (
    set "PROJECT_ROOT=%BASE_DIR%phishshield1"
) else if exist "%BASE_DIR%package.json" (
    set "PROJECT_ROOT=%BASE_DIR%"
) else (
    echo [ERROR] No se encontro el archivo package.json de PhishShield.
    echo Asegurate de ejecutar este script dentro de la carpeta del proyecto.
    pause
    exit /b 1
)

REM Quitar barra diagonal final si existe
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo [*] Directorio del proyecto: %PROJECT_ROOT%

REM 2. Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Node.js version 18 o superior desde: https://nodejs.org/
    pause
    exit /b 1
)

REM 3. Localizar Python y el entorno virtual
set "ML_DIR=%PROJECT_ROOT%\server\ml_service"
set "PYTHON_CMD="

if exist "%ML_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_CMD=venv\Scripts\python.exe"
    echo [*] Entorno virtual Python detectado en: server\ml_service\venv
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=python"
        echo [!] Usando Python global del sistema.
    ) else (
        echo [ADVERTENCIA] No se encontro Python ni un entorno virtual configurado.
        echo El microservicio de Machine Learning no podra iniciarse automaticamente.
    )
)

REM 4. Iniciar Servicio de Machine Learning (Python / FastAPI :8000)
if defined PYTHON_CMD (
    echo.
    echo [1/2] Levantando Microservicio de Machine Learning en puerto 8000...
    pushd "%ML_DIR%"
    start "PhishShield - Servicio ML (:8000)" cmd /k "%PYTHON_CMD% -m uvicorn main:app --host 127.0.0.1 --port 8000"
    popd
    ping 127.0.0.1 -n 4 >nul
)

REM 5. Iniciar Servidor Web Principal (Node.js / Express :3001)
echo.
echo [2/2] Levantando Servidor Web y API Principal en puerto 3001...
pushd "%PROJECT_ROOT%"
start "PhishShield - Servidor Web (:3001)" cmd /k "node server.js"
popd
ping 127.0.0.1 -n 3 >nul

echo.
echo ============================================================
echo    SERVICIOS INICIADOS CORRECTAMENTE
echo ============================================================
echo.
echo  Plataforma Web:       http://localhost:3001
echo  Microservicio ML:     http://localhost:8000
echo  Documentacion ML:     http://localhost:8000/docs
echo.
echo  Credenciales Admin:
echo     - Usuario:    admin
echo     - Password:   Windows12@
echo.
echo  Para detener todos los servicios:
echo     Ejecuta el archivo: detener_servicios.bat (o detener.bat)
echo ============================================================
echo.

REM Abrir navegador automaticamente
echo Abriendo navegador en http://localhost:3001 ...
start http://localhost:3001

echo.
echo Puedes minimizar esta ventana. Los servicios continuaran
echo ejecutandose en sus ventanas dedicadas.
echo.
pause