-- Script para eliminar proveedor_id de la tabla Compra
-- Ejecutar este script en tu base de datos MySQL/MariaDB

-- IMPORTANTE: Si tienes datos existentes y quieres mantenerlos, 
-- primero deberías hacer un backup de la tabla:
-- CREATE TABLE Compra_backup AS SELECT * FROM Compra;

-- Paso 1: Eliminar la restricción de clave foránea (foreign key)
-- Primero necesitamos obtener el nombre de la constraint
-- Si el nombre es diferente, ajusta el siguiente comando
ALTER TABLE Compra DROP FOREIGN KEY compra_ibfk_1;

-- Paso 2: Eliminar el índice asociado (si existe)
-- Algunas bases de datos crean un índice automáticamente para foreign keys
ALTER TABLE Compra DROP INDEX proveedor_id;

-- Paso 3: Eliminar la columna proveedor_id de la tabla Compra
ALTER TABLE Compra DROP COLUMN proveedor_id;

-- Si necesitas restaurar desde el backup:
-- INSERT INTO Compra SELECT * FROM Compra_backup;
