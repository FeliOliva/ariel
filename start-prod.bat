@echo off
echo ========================================
echo    ARIEL PROJECT - MODO PRODUCCIÓN
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)

echo [1/4] Deteniendo contenedores existentes...
docker-compose -f docker-compose.prod.yml down
echo.

echo [2/4] Construyendo imágenes de producción...
docker-compose -f docker-compose.prod.yml build --no-cache
echo.

echo [3/4] Iniciando servicios en modo producción...
docker-compose -f docker-compose.prod.yml up -d
echo.

echo [4/4] Limpiando imágenes y contenedores no utilizados...
docker system prune -f
echo.

echo ========================================
echo    Deploy de producción completado!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Para ver los logs: docker-compose -f docker-compose.prod.yml logs -f
echo Para detener: docker-compose -f docker-compose.prod.yml down
echo.
pause
