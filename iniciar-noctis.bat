@echo off
chcp 65001 >nul
title Noctis Gaming - Iniciar Plataforma
color 0B

echo ===============================================================================
echo                      NOCTIS GAMING - ARRANQUE DE PLATAFORMA
echo ===============================================================================
echo.

echo [1/3] Verificando estado del motor Docker...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR CRITICO] Docker no se encuentra en ejecucion o no responde.
    echo Por favor inicia Docker Desktop y vuelve a ejecutar este script.
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)
echo [OK] Docker esta activo y respondiendo correctamente.
echo.

echo [2/3] Levantando contenedores existentes con Docker Compose (Arranque Rapido)...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Ocurrio un fallo al levantar los contenedores con Docker Compose.
    echo.
    pause
    exit /b 1
)
echo [OK] Contenedores iniciados en segundo plano.
echo.

echo [3/3] Esperando a que el frontend este disponible en http://localhost:3000...
set MAX_RETRIES=40
set RETRY_COUNT=0

:POLL_LOOP
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    goto APP_READY
)

set /a RETRY_COUNT+=1
if %RETRY_COUNT% geq %MAX_RETRIES% (
    echo.
    echo [ADVERTENCIA] Se alcanzo el tiempo maximo de espera (40 segundos).
    echo Los contenedores continuan levantandose en segundo plano.
    goto OPEN_BROWSER
)

echo Aguardando inicializacion de servicios (intento %RETRY_COUNT% de %MAX_RETRIES%)...
timeout /t 2 /nobreak >nul
goto POLL_LOOP

:APP_READY
echo.
echo ===============================================================================
echo [EXITO] Noctis Gaming se encuentra activo y listo en http://localhost:3000
echo ===============================================================================
echo.

:OPEN_BROWSER
echo Abriendo la tienda en tu navegador predeterminado...
start http://localhost:3000

echo.
echo Para detener los contenedores sin perder datos, ejecuta: detener-noctis.bat
echo Para actualizar o recompilar algun servicio, ejecuta: actualizar-noctis.bat
echo.
timeout /t 5 >nul
exit /b 0
