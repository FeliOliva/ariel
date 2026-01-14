@echo off
echo ========================================
echo    ACTUALIZAR PROYECTO (DESARROLLO)
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)

REM Verificar si es un repositorio Git
if not exist .git (
    echo ADVERTENCIA: No es un repositorio Git. Solo reiniciando servicios...
    goto :restart
)

REM Guardar el directorio actual
set "ROOT_DIR=%cd%"

echo [1/4] Bajando cambios desde GitHub...
git pull
if %errorlevel% neq 0 (
    echo ERROR: Fallo al hacer git pull
    echo Continuando con código local...
)
echo.

echo [2/4] Verificando si hay cambios en package.json...
REM Verificar si package.json cambió comparando con HEAD
git diff HEAD --name-only | findstr package.json >nul
if %errorlevel% equ 0 (
    echo Se detectaron cambios en dependencias. Reinstalando...
    cd /d "%ROOT_DIR%\back"
    docker-compose exec backend npm install 2>nul
    cd /d "%ROOT_DIR%\front"
    docker-compose exec frontend npm install 2>nul
    cd /d "%ROOT_DIR%"
) else (
    echo No hay cambios en dependencias.
)
echo.

:restart
echo [3/4] Reiniciando servicios para aplicar cambios...
docker-compose restart
echo.

echo [4/4] Verificando estado de los servicios...
timeout /t 2 /nobreak >nul
docker-compose ps
echo.

echo ========================================
echo    Actualización completada!
echo ========================================
echo.
echo Los cambios ya están aplicados (hot-reload activo)
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
