@echo off
echo ========================================
echo    ARIEL PROJECT - MODO DESARROLLO
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)

REM Verificar si es un repositorio Git y actualizar si es necesario
if exist .git (
    echo [0/4] Actualizando código desde GitHub...
    git pull
    if %errorlevel% neq 0 (
        echo ADVERTENCIA: No se pudo actualizar desde GitHub. Continuando con código local...
    )
    echo.
) else (
    echo [0/4] No es un repositorio Git. Usando código local...
    echo.
)

echo [1/4] Deteniendo contenedores existentes...
docker-compose down
echo.

echo [2/4] Construyendo imágenes (solo si es necesario)...
docker-compose build
echo.

echo [3/4] Iniciando servicios en modo desarrollo...
docker-compose up -d
echo.

echo [4/4] Esperando a que los servicios estén listos...
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo    Servicios iniciados correctamente!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Los cambios se reflejarán automáticamente (hot-reload)
echo.
echo Para ver los logs: docker-compose logs -f
echo Para detener: docker-compose down
echo Para actualizar desde GitHub: update-dev.bat
echo.
echo Repositorio: https://github.com/FeliOliva/ariel.git
echo.
pause
