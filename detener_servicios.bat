@echo off
chcp 65001 >nul
title PhishShield - Detención de Servicios

echo ============================================================
echo        PHISHSHIELD - DETENIENDO TODOS LOS SERVICIOS
echo ============================================================
echo.

echo [*] Deteniendo servicios en puertos 3001, 3000 y 8000...

powershell -NoProfile -ExecutionPolicy Bypass -Command "3001, 3000, 8000 | ForEach-Object { $port = $_; $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { $pidNum = $c.OwningProcess; try { $pName = (Get-Process -Id $pidNum -ErrorAction SilentlyContinue).ProcessName; Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue; Write-Host ('  [OK] Puerto ' + $port + ': Proceso ' + $pName + ' detenido (PID ' + $pidNum + ')') -ForegroundColor Green } catch { Write-Host ('  [!] No se pudo detener PID ' + $pidNum) -ForegroundColor Yellow } } } else { Write-Host ('  [-] Puerto ' + $port + ': Sin actividad') -ForegroundColor Gray } }"

REM Cerrar ventanas CMD creadas por el iniciador si siguen abiertas
taskkill /fi "WINDOWTITLE eq PhishShield - Servicio ML*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq PhishShield - Servidor Web*" /f >nul 2>&1

echo.
echo ============================================================
echo    TODOS LOS SERVICIOS HAN SIDO DETENIDOS CON ÉXITO
echo ============================================================
echo.
pause