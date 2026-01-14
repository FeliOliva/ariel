#!/bin/bash
# Script para reparar backups MySQL 8.0+ para compatibilidad con MariaDB
# Uso: ./fix-backup.sh backup.sql

if [ -z "$1" ]; then
    echo "Uso: $0 <archivo_backup.sql>"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_FIXED="${BACKUP_FILE%.sql}_fixed.sql"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: El archivo $BACKUP_FILE no existe"
    exit 1
fi

echo "Reparando backup: $BACKUP_FILE"
echo "Archivo de salida: $BACKUP_FIXED"
echo ""

# Crear copia del archivo original
cp "$BACKUP_FILE" "$BACKUP_FIXED"

# 1. Reemplazar collations incompatibles
echo "[1/4] Reemplazando collations incompatibles..."
sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' "$BACKUP_FIXED"
echo "   ✓ Collations corregidas"

# 2. Comentar líneas SQL_LOG_BIN
echo "[2/4] Comentando líneas SQL_LOG_BIN..."
sed -i 's/^SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;/-- SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN; -- Comentado porque requiere permisos SUPER\/BINLOG ADMIN/' "$BACKUP_FIXED"
sed -i 's/^SET @@SESSION.SQL_LOG_BIN= 0;/-- SET @@SESSION.SQL_LOG_BIN= 0; -- Comentado porque requiere permisos SUPER\/BINLOG ADMIN/' "$BACKUP_FIXED"
sed -i 's/^SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;/-- SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN; -- Comentado porque requiere permisos SUPER\/BINLOG ADMIN/' "$BACKUP_FIXED"
echo "   ✓ SQL_LOG_BIN comentado"

# 3. Comentar GTID_PURGED
echo "[3/4] Comentando GTID_PURGED..."
sed -i 's/^SET @@GLOBAL.GTID_PURGED=/-- SET @@GLOBAL.GTID_PURGED=/g' "$BACKUP_FIXED"
sed -i '/^-- SET @@GLOBAL.GTID_PURGED=/a -- Comentado porque MariaDB puede no tener GTID habilitado' "$BACKUP_FIXED"
echo "   ✓ GTID_PURGED comentado"

# 4. Cambiar DEFINER (pedir usuario)
echo "[4/4] Cambiando DEFINER..."
read -p "   ¿Qué usuario usar para DEFINER? (default: ariel_user): " DB_USER
DB_USER=${DB_USER:-ariel_user}

sed -i "s/DEFINER=\`root\`@\`localhost\`/DEFINER=\`${DB_USER}\`@\`%\`/g" "$BACKUP_FIXED"
echo "   ✓ DEFINER cambiado a ${DB_USER}@%"

echo ""
echo "========================================="
echo "✓ Backup reparado exitosamente!"
echo "========================================="
echo ""
echo "Archivo original: $BACKUP_FILE"
echo "Archivo corregido: $BACKUP_FIXED"
echo ""
echo "Verificar cambios:"
echo "  grep -E 'utf8mb4_0900_ai_ci|^SET.*SQL_LOG_BIN|GTID_PURGED|DEFINER.*root.*localhost' $BACKUP_FIXED"
echo ""
echo "Importar con:"
echo "  mysql -u ${DB_USER} -p nombre_base_datos < $BACKUP_FIXED"
echo ""
