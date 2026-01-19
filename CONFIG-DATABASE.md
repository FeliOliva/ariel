# 🗄️ Configuración de Base de Datos - Guía Rápida

## ✅ Respuesta Rápida

**SÍ, el sistema está configurado para usar base de datos remota.** Solo necesitas cambiar el archivo `back/.env`.

> Nota MariaDB:
> Si usás MariaDB, usá el archivo `backup_con_indices.sql` ya adaptado para collation compatible.

## 🚀 Configuración en 3 Pasos

### Paso 1: Crear archivo .env

```bash
# Copia el ejemplo
copy back\env.example.txt back\.env
```

### Paso 2: Editar back/.env

Abre `back/.env` y cambia:

```env
# Para base de datos REMOTA (tu VPS)
DB_HOST=felipeoliva.site
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=ariel2db
PORT=3001
NODE_ENV=development
```

### Paso 3: Reiniciar Docker

```bash
docker-compose restart backend
```

**¡Listo!** Ya está conectado a tu VPS.

## 🎯 Script Automático

O usa el script que crea el archivo automáticamente:

```bash
config-database.bat
```

Este script te pregunta si quieres usar base de datos local o remota y crea el archivo `.env` por ti.

## 📝 Ejemplo Completo

### Para tu VPS (felipeoliva.site):

```env
DB_HOST=felipeoliva.site
DB_USER=ariel_user
DB_PASSWORD=mi_password_seguro_123
DB_NAME=ariel2db
PORT=3001
NODE_ENV=development
```

### Para base de datos local:

```env
DB_HOST=host.docker.internal
DB_USER=root
DB_PASSWORD=154254693feli
DB_NAME=ariel2db
PORT=3001
NODE_ENV=development
```

## ⚙️ Configuración en VPS

Antes de usar tu VPS, asegúrate de:

1. **MariaDB/MySQL permite conexiones remotas**
2. **Puerto 3306 abierto en firewall**
3. **Usuario con permisos remotos**

## 🛠️ MariaDB (compatibilidad del SQL)
Si MariaDB rechaza el dump original por collation (`utf8mb4_0900_ai_ci`), usá el
`backup_con_indices.sql` ya adaptado a `utf8mb4_unicode_ci`.

Ver `README-DATABASE.md` para instrucciones detalladas.

## 🔄 Cambiar entre Local y Remota

Solo edita `back/.env` y reinicia:

```bash
docker-compose restart backend
```

Los cambios se aplican inmediatamente.
