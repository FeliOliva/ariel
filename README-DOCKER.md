# 🐳 Guía de Docker - Proyecto Ariel

## 📋 Requisitos

**Solo necesitas:**
- ✅ Docker Desktop instalado y corriendo
- ✅ Git (si trabajas con repositorio)

**NO necesitas:**
- ❌ Node.js instalado localmente
- ❌ npm instalado localmente
- ❌ Nada más

## 🚀 Inicio Rápido

### Primera vez (clonar desde cero)

```bash
clone-and-start.bat
```

Este script:
1. ✅ Clona el repositorio desde GitHub: https://github.com/FeliOliva/ariel.git
2. ✅ Construye las imágenes de Docker
3. ✅ Inicia todos los servicios
4. ✅ Todo listo para trabajar

### Si ya tienes el proyecto clonado

```bash
start-fresh.bat
```

Este script:
1. ✅ Descarga los últimos cambios de GitHub
2. ✅ Construye las imágenes de Docker
3. ✅ Inicia todos los servicios
4. ✅ Todo listo para trabajar

### Desarrollo diario

```bash
start-dev.bat
```

Este script:
1. ✅ Intenta actualizar desde GitHub (si es repo Git)
2. ✅ Inicia los servicios (o los reinicia si ya estaban)
3. ✅ Hot-reload activo automáticamente

### Actualizar después de subir cambios a GitHub

```bash
update-dev.bat
```

Este script:
1. ✅ Descarga cambios desde GitHub
2. ✅ Reinstala dependencias si cambió `package.json`
3. ✅ Reinicia servicios
4. ✅ Los cambios se aplican automáticamente

## 🔄 Flujo de Trabajo Completo

### Escenario 1: Primera vez en una computadora nueva

```bash
clone-and-start.bat
```

Este script hace todo automáticamente:
1. ✅ Clona desde: https://github.com/FeliOliva/ariel.git
2. ✅ Configura Docker
3. ✅ Inicia servicios

### Escenario 2: Trabajas solo

1. **Desarrollas localmente** → Los cambios se reflejan automáticamente (hot-reload)
2. **Subes a GitHub**: `git add .`, `git commit -m "..."`, `git push`
3. **En otra computadora**: `start-dev.bat` o `update-dev.bat`

### Escenario 3: Trabajas en equipo

1. **Antes de empezar**: `update-dev.bat` (descarga cambios del equipo)
2. **Desarrollas**: Los cambios se reflejan automáticamente
3. **Subes cambios**: `git push`
4. **Compañero actualiza**: `update-dev.bat`

## 📝 Comandos Útiles

### Ver logs en tiempo real
```bash
logs.bat
# O manualmente:
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Detener servicios
```bash
docker-compose down
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Reinstalar dependencias
```bash
# Backend
docker-compose exec backend npm install

# Frontend
docker-compose exec frontend npm install
```

### Acceder a la consola de un contenedor
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

## 🎯 Preguntas Frecuentes

### ¿Los cambios de GitHub se aplican automáticamente?

**No automáticamente**, pero es muy fácil:
- Ejecuta `update-dev.bat` después de hacer `git pull`
- O simplemente `start-dev.bat` que incluye `git pull`

### ¿Necesito reconstruir después de cada cambio?

**NO**. Con hot-reload:
- ✅ Cambios de código → Se aplican automáticamente
- ✅ Cambios en `package.json` → Ejecuta `update-dev.bat`
- ✅ Cambios en Dockerfile → Ejecuta `start-dev.bat`

### ¿Qué pasa si subo cambios a GitHub?

1. Tus cambios están en GitHub
2. En otra computadora: ejecuta `update-dev.bat`
3. Los cambios se descargan y aplican automáticamente

### ¿Puedo trabajar sin Docker?

Sí, pero necesitarías:
- Node.js instalado
- npm instalado
- Configurar variables de entorno
- Instalar dependencias manualmente

**Con Docker**: Solo ejecutas `start-dev.bat` y listo.

## 🔧 Solución de Problemas

### Los cambios no se reflejan
```bash
# Reiniciar el servicio específico
docker-compose restart backend
docker-compose restart frontend
```

### Error de permisos en Windows
- Asegúrate de que Docker Desktop tenga acceso a las carpetas compartidas
- Settings → Resources → File Sharing → Agregar la carpeta del proyecto

### Puerto ya en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Detener contenedores
docker-compose down
```

### Limpiar todo y empezar de nuevo
```bash
# Detener y eliminar contenedores, redes, volúmenes
docker-compose down -v

# Eliminar imágenes
docker rmi ariel-backend ariel-frontend

# Limpiar sistema Docker
docker system prune -a

# Reconstruir desde cero
start-fresh.bat
```

### Git pull falla
```bash
# Si hay conflictos, resuélvelos primero
git status
git pull

# Luego ejecuta
start-dev.bat
```

## 🌐 URLs

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

## 📁 Estructura de Archivos

```
ariel/
├── docker-compose.yml          # Desarrollo (hot-reload)
├── docker-compose.prod.yml     # Producción
├── start-dev.bat               # Iniciar desarrollo (con git pull)
├── start-fresh.bat             # Inicio completo desde cero
├── start-prod.bat              # Iniciar producción
├── update-dev.bat              # Actualizar desde GitHub
├── logs.bat                    # Ver logs
├── back/
│   ├── Dockerfile              # Producción
│   ├── Dockerfile.dev          # Desarrollo
│   └── .dockerignore
└── front/
    ├── Dockerfile              # Producción
    ├── Dockerfile.dev          # Desarrollo
    └── .dockerignore
```

## 💡 Tips

1. **Primera vez**: Usa `start-fresh.bat` (descarga todo y construye)
2. **Día a día**: Usa `start-dev.bat` (rápido, con git pull opcional)
3. **Después de git push**: En otra PC usa `update-dev.bat`
4. **Cambios de código**: Se aplican automáticamente (hot-reload)
5. **Cambios de dependencias**: Ejecuta `update-dev.bat`
