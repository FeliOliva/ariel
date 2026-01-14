# 🗄️ Configuración de Base de Datos

El proyecto está configurado para usar **variables de entorno**, lo que permite cambiar fácilmente entre base de datos local y remota.

## 📋 Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
config-database.bat
```

Este script te guía paso a paso para configurar la base de datos.

### Opción 2: Manual

Edita el archivo `back/.env`:

```env
# Para base de datos LOCAL
DB_HOST=host.docker.internal
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ariel2db

# Para base de datos REMOTA (VPS)
DB_HOST=felipeoliva.site
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=ariel2db
```

## 🔄 Cambiar entre Local y Remota

### Base de Datos Local (Desarrollo)

```env
DB_HOST=host.docker.internal
DB_USER=root
DB_PASSWORD=154254693feli
DB_NAME=ariel2db
```

**Ventajas:**
- ✅ Más rápido
- ✅ No depende de internet
- ✅ Ideal para desarrollo

### Base de Datos Remota (VPS/Producción)

```env
DB_HOST=felipeoliva.site
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=ariel2db
```

**Ventajas:**
- ✅ Accesible desde cualquier lugar
- ✅ Datos centralizados
- ✅ Ideal para producción o trabajo en equipo

## 🔧 Configurar MySQL en VPS

### 1. Permitir conexiones remotas

En tu VPS, edita el archivo de configuración de MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Cambia:
```ini
bind-address = 127.0.0.1
```

Por:
```ini
bind-address = 0.0.0.0
```

O comenta la línea:
```ini
# bind-address = 127.0.0.1
```

### 2. Reiniciar MySQL

```bash
sudo systemctl restart mysql
```

### 3. Crear usuario con permisos remotos

```sql
-- Conectarte a MySQL
mysql -u root -p

-- Crear usuario (reemplaza 'tu_password' y 'tu_ip' o usa '%' para cualquier IP)
CREATE USER 'ariel_user'@'%' IDENTIFIED BY 'tu_password_seguro';

-- Dar permisos
GRANT ALL PRIVILEGES ON ariel2db.* TO 'ariel_user'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

### 4. Abrir puerto en firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3306/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

## 🔒 Seguridad

### Recomendaciones:

1. **Usa contraseñas seguras**
   ```env
   DB_PASSWORD=contraseña_super_segura_123
   ```

2. **No subas `.env` a GitHub**
   - El archivo `.env` ya está en `.gitignore`
   - Usa `.env.example` como plantilla

3. **Limita acceso por IP** (opcional)
   ```sql
   -- Solo permitir desde tu IP específica
   CREATE USER 'ariel_user'@'tu.ip.aqui' IDENTIFIED BY 'password';
   ```

4. **Usa SSL para conexiones remotas** (recomendado en producción)
   ```javascript
   // En database.js puedes agregar:
   ssl: {
     rejectUnauthorized: false
   }
   ```

## 🧪 Probar la Conexión

### Desde tu máquina local:

```bash
# Probar conexión a base de datos remota
mysql -h felipeoliva.site -u tu_usuario -p ariel2db
```

### Desde Docker:

```bash
# Entrar al contenedor
docker-compose exec backend sh

# Probar conexión
mysql -h felipeoliva.site -u tu_usuario -p ariel2db
```

## 📝 Variables de Entorno

| Variable | Descripción | Ejemplo Local | Ejemplo Remoto |
|----------|-------------|---------------|----------------|
| `DB_HOST` | Host de la base de datos | `host.docker.internal` | `felipeoliva.site` |
| `DB_USER` | Usuario MySQL | `root` | `ariel_user` |
| `DB_PASSWORD` | Contraseña MySQL | `tu_password` | `password_seguro` |
| `DB_NAME` | Nombre de la base de datos | `ariel2db` | `ariel2db` |
| `PORT` | Puerto del servidor backend | `3001` | `3001` |
| `NODE_ENV` | Entorno | `development` | `production` |

## 🔄 Aplicar Cambios

Después de modificar `back/.env`:

```bash
# Reiniciar solo el backend
docker-compose restart backend

# O reiniciar todo
docker-compose restart
```

## 🐛 Solución de Problemas

### Error: "Can't connect to MySQL server"

**Causas posibles:**
1. MySQL no permite conexiones remotas
2. Firewall bloquea el puerto 3306
3. Usuario no tiene permisos remotos
4. Host incorrecto

**Solución:**
```bash
# Verificar que MySQL escucha en todas las interfaces
sudo netstat -tlnp | grep 3306

# Verificar firewall
sudo ufw status

# Probar conexión manual
mysql -h felipeoliva.site -u usuario -p
```

### Error: "Access denied for user"

**Causa:** Usuario no tiene permisos o contraseña incorrecta

**Solución:**
```sql
-- Verificar usuario y permisos
SELECT user, host FROM mysql.user WHERE user='tu_usuario';
SHOW GRANTS FOR 'tu_usuario'@'%';
```

### Error: "Connection timeout"

**Causa:** Firewall o red bloqueando la conexión

**Solución:**
```bash
# Probar conectividad
ping felipeoliva.site
telnet felipeoliva.site 3306

# Verificar que el puerto esté abierto
sudo ufw allow 3306/tcp
```

## 📚 Archivos Relacionados

- `back/.env` - Configuración actual (no se sube a Git)
- `back/.env.example` - Plantilla de ejemplo
- `back/database.js` - Código de conexión
- `docker-compose.yml` - Carga variables desde `.env`

## 💡 Tips

1. **Desarrollo**: Usa base de datos local para mayor velocidad
2. **Producción**: Usa base de datos remota para acceso centralizado
3. **Backup**: Configura backups automáticos en tu VPS
4. **Monitoreo**: Considera usar herramientas como phpMyAdmin o MySQL Workbench
