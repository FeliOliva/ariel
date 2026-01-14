@echo off
echo ========================================
echo    ARIEL PROJECT - INICIO COMPLETO
echo    (Descarga desde GitHub + Docker)
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
    echo ERROR: Esta carpeta no es un repositorio Git.
    echo Por favor clona el repositorio primero:
    echo   git clone https://github.com/FeliOliva/ariel.git
    echo   cd ariel
    echo   start-fresh.bat
    pause
    exit /b 1
)

echo [1/5] Actualizando código desde GitHub...
git pull
if %errorlevel% neq 0 (
    echo ERROR: No se pudo actualizar desde GitHub.
    echo Verifica tu conexión a internet y los permisos del repositorio.
    pause
    exit /b 1
)
echo.

echo [2/5] Deteniendo contenedores existentes...
docker-compose down
echo.

echo [3/5] Limpiando imágenes antiguas (opcional)...
docker-compose down --rmi local
echo.

echo [4/5] Construyendo imágenes desde cero...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir las imágenes.
    pause
    exit /b 1
)
echo.

echo [5/5] Iniciando servicios...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Fallo al iniciar los servicios.
    pause
    exit /b 1
)
echo.

echo Esperando a que los servicios estén listos...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo    ¡Proyecto iniciado correctamente!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Los cambios se reflejarán automáticamente (hot-reload)
echo.
echo Para ver los logs: docker-compose logs -f
echo Para detener: docker-compose down
echo Para actualizar: update-dev.bat
echo.
pause
