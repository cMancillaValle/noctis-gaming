@echo off
chcp 65001 >nul
title Noctis Gaming - Actualizacion y Recompilacion Selectiva
color 0E

:MENU
cls
echo ===============================================================================
echo               NOCTIS GAMING - RECOMPILACION Y ACTUALIZACION SELECTIVA
echo ===============================================================================
echo.
echo Selecciona el componente que deseas recompilar y actualizar:
echo.
echo   [1] Frontend (React + TypeScript + Vite + Nginx)
echo   [2] Clientes (clientes-service)
echo   [3] Productos (productos-service)
echo   [4] Inventario (inventario-service)
echo   [5] Ventas (ventas-service)
echo   [6] Facturación (facturacion-service)
echo   [7] Todos los servicios (Recompilar y reiniciar plataforma completa)
echo   [8] Salir sin cambios
echo.
echo ===============================================================================
set /p OPCION="Ingresa tu opción [1-8]: "

if "%OPCION%"=="1" goto ACTUALIZAR_FRONTEND
if "%OPCION%"=="2" goto ACTUALIZAR_CLIENTES
if "%OPCION%"=="3" goto ACTUALIZAR_PRODUCTOS
if "%OPCION%"=="4" goto ACTUALIZAR_INVENTARIO
if "%OPCION%"=="5" goto ACTUALIZAR_VENTAS
if "%OPCION%"=="6" goto ACTUALIZAR_FACTURACION
if "%OPCION%"=="7" goto ACTUALIZAR_TODOS
if "%OPCION%"=="8" goto SALIR

echo.
echo [OPCION INVALIDA] Por favor selecciona un numero entre 1 y 8.
timeout /t 2 >nul
goto MENU

:ACTUALIZAR_FRONTEND
set SERVICIO=frontend
set NOMBRE_DESC=Frontend (React + Nginx)
goto EJECUTAR_ACTUALIZACION

:ACTUALIZAR_CLIENTES
set SERVICIO=clientes-service
set NOMBRE_DESC=Microservicio de Clientes
goto EJECUTAR_ACTUALIZACION

:ACTUALIZAR_PRODUCTOS
set SERVICIO=productos-service
set NOMBRE_DESC=Microservicio de Productos
goto EJECUTAR_ACTUALIZACION

:ACTUALIZAR_INVENTARIO
set SERVICIO=inventario-service
set NOMBRE_DESC=Microservicio de Inventario
goto EJECUTAR_ACTUALIZACION

:ACTUALIZAR_VENTAS
set SERVICIO=ventas-service
set NOMBRE_DESC=Microservicio de Ventas
goto EJECUTAR_ACTUALIZACION

:ACTUALIZAR_FACTURACION
set SERVICIO=facturacion-service
set NOMBRE_DESC=Microservicio de Facturación
goto EJECUTAR_ACTUALIZACION

:EJECUTAR_ACTUALIZACION
cls
echo ===============================================================================
echo Actualizando: %NOMBRE_DESC% (%SERVICIO%)
echo ===============================================================================
echo.
echo [Paso 1/2] Recompilando imagen Docker para %SERVICIO%...
docker compose build %SERVICIO%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Fallo la compilacion de la imagen Docker para %SERVICIO%.
    pause
    goto MENU
)

echo.
echo [Paso 2/2] Recreando y reiniciando contenedor %SERVICIO%...
docker compose up -d --no-deps %SERVICIO%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Fallo al reiniciar el contenedor %SERVICIO%.
    pause
    goto MENU
)

echo.
echo ===============================================================================
echo [EXITO] %NOMBRE_DESC% ha sido actualizado y puesto en marcha correctamente.
echo ===============================================================================
echo.
echo Presiona cualquier tecla para volver al menu principal...
pause >nul
goto MENU

:ACTUALIZAR_TODOS
cls
echo ===============================================================================
echo Recompilando y Actualizando Todos los Servicios
echo ===============================================================================
echo.
echo [Paso 1/2] Recompilando todas las imagenes con Docker Compose...
docker compose build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Fallo la compilacion global de imagenes.
    pause
    goto MENU
)

echo.
echo [Paso 2/2] Recreando todos los contenedores...
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Fallo al reiniciar los contenedores globales.
    pause
    goto MENU
)

echo.
echo ===============================================================================
echo [EXITO] Toda la plataforma Noctis Gaming ha sido actualizada exitosamente.
echo ===============================================================================
echo.
echo Presiona cualquier tecla para volver al menu principal...
pause >nul
goto MENU

:SALIR
cls
echo Operacion finalizada sin cambios pendientes.
timeout /t 1 >nul
exit /b 0
