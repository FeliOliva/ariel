@echo off
echo ========================================
echo    CONFIGURAR BASE DE DATOS
echo ========================================
echo.
echo Este script te ayudará a configurar la conexión a la base de datos.
echo.
echo Opciones:
echo   1. Base de datos LOCAL (MySQL en tu máquina)
echo   2. Base de datos REMOTA (VPS/Cloud - felipeoliva.site)
echo.
choice /C 12 /M "Selecciona una opción"

if errorlevel 2 goto :remote
if errorlevel 1 goto :local

:local
echo.
echo Configurando para base de datos LOCAL...
(
echo # Configuración de Base de Datos - LOCAL
echo DB_HOST=host.docker.internal
echo DB_USER=root
echo DB_PASSWORD=154254693feli
echo DB_NAME=ariel2db
echo PORT=3001
echo NODE_ENV=development
) > back\.env
echo.
echo ✅ Configuración LOCAL aplicada en back\.env
echo.
echo Host: host.docker.internal
echo Usuario: root
echo Base de datos: ariel2db
echo.
goto :end

:remote
echo.
echo Configurando para base de datos REMOTA...
echo.
set /p DB_HOST="Ingresa el host (ej: felipeoliva.site o IP): "
set /p DB_USER="Ingresa el usuario MySQL: "
set /p DB_PASSWORD="Ingresa la contraseña MySQL: "
set /p DB_NAME="Ingresa el nombre de la base de datos (default: ariel2db): "
if "%DB_NAME%"=="" set DB_NAME=ariel2db

(
echo # Configuración de Base de Datos - REMOTA
echo DB_HOST=%DB_HOST%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_NAME=%DB_NAME%
echo PORT=3001
echo NODE_ENV=development
) > back\.env

echo.
echo ✅ Configuración REMOTA aplicada en back\.env
echo.
echo Host: %DB_HOST%
echo Usuario: %DB_USER%
echo Base de datos: %DB_NAME%
echo.
echo ⚠️  IMPORTANTE: Asegúrate de que:
echo    1. El puerto 3306 esté abierto en tu VPS
echo    2. MySQL permita conexiones remotas
echo    3. El usuario tenga permisos desde tu IP
echo.

:end
echo.
echo Para aplicar los cambios, reinicia los servicios:
echo   docker-compose restart backend
echo.
pause
