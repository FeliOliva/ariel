@echo off
echo ========================================
echo    CLONAR Y CONFIGURAR PROYECTO ARIEL
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está corriendo. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)

REM Verificar si Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no está instalado.
    echo Por favor instala Git desde: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Obtener el nombre de la carpeta actual
set "CURRENT_DIR=%cd%"
set "PROJECT_NAME=ariel"

echo [1/4] Verificando si el repositorio ya existe...
if exist "%PROJECT_NAME%" (
    echo La carpeta '%PROJECT_NAME%' ya existe.
    echo.
    choice /C SN /M "¿Quieres eliminar la carpeta existente y clonar de nuevo? (S/N)"
    if errorlevel 2 goto :skip_clone
    if errorlevel 1 (
        echo Eliminando carpeta existente...
        rmdir /s /q "%PROJECT_NAME%" 2>nul
    )
)

:skip_clone
if not exist "%PROJECT_NAME%" (
    echo [2/4] Clonando repositorio desde GitHub...
    git clone https://github.com/FeliOliva/ariel.git
    if %errorlevel% neq 0 (
        echo ERROR: No se pudo clonar el repositorio.
        echo Verifica tu conexión a internet y los permisos del repositorio.
        pause
        exit /b 1
    )
    echo.
) else (
    echo [2/4] El repositorio ya existe. Actualizando...
    cd /d "%PROJECT_NAME%"
    git pull
    if %errorlevel% neq 0 (
        echo ADVERTENCIA: No se pudo actualizar. Continuando con código local...
    )
    cd /d "%CURRENT_DIR%"
    echo.
)

echo [3/4] Entrando a la carpeta del proyecto...
cd /d "%PROJECT_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo acceder a la carpeta del proyecto.
    pause
    exit /b 1
)
echo.

echo [4/4] Iniciando Docker...
call start-fresh.bat
