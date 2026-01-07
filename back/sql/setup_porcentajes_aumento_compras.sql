-- Script consolidado para agregar todas las columnas de porcentajes de aumento
-- Este script agrega todas las columnas necesarias para soportar:
-- 1. Porcentajes globales (compatibilidad y nuevos separados)
-- 2. Porcentajes individuales por producto (compatibilidad y nuevos separados)
-- Ejecutar este script una sola vez para configurar todas las columnas
-- Si alguna columna ya existe, el script fallará en esa línea pero continuará con las demás

DELIMITER //

CREATE PROCEDURE AddPorcentajesAumentoColumns()
BEGIN
    -- ============================================
    -- TABLA: compra
    -- ============================================
    
    -- Porcentaje global único (compatibilidad con sistema anterior)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'compra'
                   AND COLUMN_NAME = 'porcentaje_aumento_global') THEN
        ALTER TABLE compra 
        ADD COLUMN porcentaje_aumento_global DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento global aplicado a la compra (compatibilidad)';
    END IF;
    
    -- Porcentajes globales separados (nuevo sistema)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'compra'
                   AND COLUMN_NAME = 'porcentaje_aumento_costo_global') THEN
        ALTER TABLE compra 
        ADD COLUMN porcentaje_aumento_costo_global DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento global aplicado al costo';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'compra'
                   AND COLUMN_NAME = 'porcentaje_aumento_precio_global') THEN
        ALTER TABLE compra 
        ADD COLUMN porcentaje_aumento_precio_global DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento global aplicado al precio monotributista';
    END IF;
    
    -- ============================================
    -- TABLA: detalle_compra
    -- ============================================
    
    -- Porcentaje individual único (compatibilidad con sistema anterior)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'detalle_compra'
                   AND COLUMN_NAME = 'porcentaje_aumento') THEN
        ALTER TABLE detalle_compra 
        ADD COLUMN porcentaje_aumento DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento aplicado al producto (compatibilidad)';
    END IF;
    
    -- Porcentajes individuales separados (nuevo sistema)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'detalle_compra'
                   AND COLUMN_NAME = 'porcentaje_aumento_costo') THEN
        ALTER TABLE detalle_compra 
        ADD COLUMN porcentaje_aumento_costo DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento individual aplicado al costo del producto';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'detalle_compra'
                   AND COLUMN_NAME = 'porcentaje_aumento_precio') THEN
        ALTER TABLE detalle_compra 
        ADD COLUMN porcentaje_aumento_precio DECIMAL(5,2) NULL DEFAULT NULL 
        COMMENT 'Porcentaje de aumento individual aplicado al precio monotributista del producto';
    END IF;
END //

DELIMITER ;

-- Ejecutar el procedimiento
CALL AddPorcentajesAumentoColumns();

-- Eliminar el procedimiento después de usarlo
DROP PROCEDURE IF EXISTS AddPorcentajesAumentoColumns;

-- ============================================
-- NOTAS:
-- ============================================
-- - Las columnas con "_global" o sin sufijo son para compatibilidad
-- - Las columnas con "_costo" y "_precio" son las nuevas, recomendadas para uso futuro
-- - Todos los campos son NULL por defecto para mantener compatibilidad con registros existentes
-- - Este script es seguro de ejecutar múltiples veces (no duplicará columnas)

