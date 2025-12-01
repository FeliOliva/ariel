@echo off
echo ========================================
echo         DEPLOY ARIEL PROJECT
echo ========================================
echo.

REM Guardar el directorio actual
set "ROOT_DIR=%cd%"

echo [1/3] Bajando cambios de Git...
git pull
if %errorlevel% neq 0 (
    echo ERROR: Fallo al hacer git pull
    pause
    exit /b 1
)
echo.

echo [2/3] Reconstruyendo Backend...
cd /d "%ROOT_DIR%\back"
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al levantar el backend
    pause
    exit /b 1
)
echo.

echo [3/3] Reconstruyendo Frontend...
cd /d "%ROOT_DIR%\front"
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al levantar el frontend
    pause
    exit /b 1
)
echo.

REM Volver al directorio original
cd /d "%ROOT_DIR%"

echo ========================================
echo    ¡Deploy completado exitosamente!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause