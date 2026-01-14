# 🔧 Guía para Reparar Backups MySQL/MariaDB

Esta guía contiene todos los pasos necesarios para corregir backups exportados desde MySQL 8.0+ y hacerlos compatibles con MariaDB.

## ⚠️ Problemas Comunes en Backups MySQL 8.0 → MariaDB

### 1. Collation Incompatible
**Error:** `ERROR 1273 (HY000): Unknown collation: 'utf8mb4_0900_ai_ci'`

**Solución:**
- Buscar y reemplazar todas las ocurrencias de `utf8mb4_0900_ai_ci` por `utf8mb4_unicode_ci`
- MySQL 8.0 usa collations que MariaDB no soporta

**Comando:**
```bash
# En el archivo .sql, buscar y reemplazar:
utf8mb4_0900_ai_ci → utf8mb4_unicode_ci
```

### 2. SQL_LOG_BIN (Requiere permisos SUPER)
**Error:** `ERROR 1227 (42000): Access denied; you need SUPER, BINLOG ADMIN privilege(s)`

**Líneas problemáticas:**
```sql
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
-- ... al final del archivo ...
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
```

**Solución:** Comentar todas las líneas relacionadas con SQL_LOG_BIN

**Reemplazar:**
```sql
-- SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
-- SET @@SESSION.SQL_LOG_BIN= 0;
-- Comentado porque requiere permisos SUPER/BINLOG ADMIN
```

Y al final del archivo:
```sql
-- SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
-- Comentado porque requiere permisos SUPER/BINLOG ADMIN
```

### 3. GTID_PURGED (Puede no estar habilitado en MariaDB)
**Error:** `ERROR 1227 (42000): Access denied` o errores de GTID

**Línea problemática:**
```sql
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'xxx-xxx-xxx:1-610';
```

**Solución:** Comentar la línea

**Reemplazar:**
```sql
-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'xxx-xxx-xxx:1-610';
-- Comentado porque MariaDB puede no tener GTID habilitado
```

### 4. DEFINER en Triggers/Procedures (Requiere permisos SET USER)
**Error:** `ERROR 1227 (42000): Access denied; you need SUPER, SET USER privilege(s)`

**Líneas problemáticas:**
```sql
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER ...
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE ...
```

**Solución:** Cambiar DEFINER al usuario que va a importar

**Reemplazar:**
```sql
DEFINER=`root`@`localhost` → DEFINER=`ariel_user`@`%`
```

O si el usuario es diferente, cambiar por:
```sql
DEFINER=`nombre_usuario`@`%`
```

## 📋 Checklist de Reparación

Antes de importar un backup, verificar:

- [ ] Reemplazar todas las `utf8mb4_0900_ai_ci` por `utf8mb4_unicode_ci`
- [ ] Comentar o eliminar líneas `SET @@SESSION.SQL_LOG_BIN`
- [ ] Comentar línea `SET @@GLOBAL.GTID_PURGED`
- [ ] Cambiar `DEFINER=`root`@`localhost`` por el usuario correcto
- [ ] Verificar que no hay otros `DEFINER` problemáticos

## 🔍 Comandos Útiles para Buscar Problemas

```bash
# Buscar collations incompatibles
grep -n "utf8mb4_0900_ai_ci" backup.sql

# Buscar SQL_LOG_BIN
grep -n "SQL_LOG_BIN" backup.sql

# Buscar GTID
grep -n "GTID_PURGED" backup.sql

# Buscar DEFINER
grep -n "DEFINER" backup.sql

# Buscar todos los problemas comunes
grep -E "utf8mb4_0900_ai_ci|SQL_LOG_BIN|GTID_PURGED|DEFINER.*root.*localhost" backup.sql
```

## 🔄 Proceso Completo de Reparación

### Paso 1: Buscar problemas
```bash
grep -E "utf8mb4_0900_ai_ci|SQL_LOG_BIN|GTID_PURGED|DEFINER.*root.*localhost" backup.sql
```

### Paso 2: Reemplazos necesarios

**En orden de prioridad:**

1. **Collations:**
   ```bash
   # Buscar y reemplazar en el editor
   utf8mb4_0900_ai_ci → utf8mb4_unicode_ci
   ```

2. **SQL_LOG_BIN:**
   - Comentar línea: `SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;`
   - Comentar línea: `SET @@SESSION.SQL_LOG_BIN= 0;`
   - Comentar línea final: `SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;`

3. **GTID_PURGED:**
   - Comentar línea: `SET @@GLOBAL.GTID_PURGED=...`

4. **DEFINER:**
   - Reemplazar: `DEFINER=`root`@`localhost`` → `DEFINER=`usuario`@`%``

### Paso 3: Verificar cambios
```bash
# Verificar que no quedan problemas
grep -E "utf8mb4_0900_ai_ci|^SET.*SQL_LOG_BIN|GTID_PURGED|DEFINER.*root.*localhost" backup.sql
# No debería mostrar nada (o solo líneas comentadas con --)
```

## 📝 Ejemplo de Archivo Corregido

### Antes:
```sql
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED='...';
/*!50017 DEFINER=`root`@`localhost`*/
```

### Después:
```sql
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- SET @@SESSION.SQL_LOG_BIN= 0;
-- SET @@GLOBAL.GTID_PURGED='...';
-- Comentado porque requiere permisos SUPER/BINLOG ADMIN
/*!50017 DEFINER=`ariel_user`@`%`*/
```

## 🚀 Importación Final

Una vez corregido el backup:

```bash
# 1. Subir al servidor
scp -P5273 backup.sql root@149.50.144.12:/root/

# 2. Importar
mysql -u ariel_user -p ariel2db < /root/backup.sql

# 3. Verificar
mysql -u ariel_user -p -e "USE ariel2db; SHOW TABLES;"
```

## ⚙️ Alternativa: Dar Permisos Adicionales

Si prefieres no modificar el backup, puedes dar permisos al usuario:

```sql
-- Conectarse como root
sudo mysql -u root -p

-- Dar permisos SET USER
GRANT SET USER ON *.* TO 'ariel_user'@'%';
FLUSH PRIVILEGES;
```

Pero **NO es recomendable** dar permisos SUPER por seguridad.

## 📚 Notas Adicionales

- Los backups de MySQL 8.0+ suelen tener estos problemas con MariaDB
- Es mejor corregir el backup que dar permisos excesivos al usuario
- Siempre verificar el backup antes de importar en producción
- Hacer un backup de la base de datos actual antes de importar uno nuevo
