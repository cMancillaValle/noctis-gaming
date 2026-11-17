@echo off
chcp 65001 >nul
title Noctis Gaming - Detener Plataforma
color 0D

echo ===============================================================================
echo                      NOCTIS GAMING - DETENCION SEGURA
echo ===============================================================================
echo.

echo [1/2] Verificando Docker...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Docker no esta en ejecucion o ya fue cerrado.
    pause
    exit /b 0
)

echo [2/2] Deteniendo ordenadamente los contenedores (docker compose stop)...
docker compose stop

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===============================================================================
    echo [CONFIRMACION DE PERSISTENCIA Y SEGURIDAD]
    echo Los contenedores han sido detenidos correctamente sin destruccion de recursos.
    echo.
    echo - Todos los datos en PostgreSQL permanecen intactos en sus volumenes locales.
    echo - Cuentas de clientes, catalogo, existencias, ventas y facturas se conservan.
    echo - No se ejecuto 'docker compose down -v', garantizando cero perdida de datos.
    echo ===============================================================================
    echo.
    echo Para volver a encender la plataforma inmediatamente, ejecuta: iniciar-noctis.bat
) else (
    echo.
    echo [ADVERTENCIA] Ocurrio un aviso o error al intentar detener los contenedores.
)

echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
exit /b 0
