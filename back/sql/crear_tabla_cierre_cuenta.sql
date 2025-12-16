-- Script para crear la tabla de cierre de cuentas corrientes
-- Ejecutar este script en la base de datos antes de usar la funcionalidad

CREATE TABLE IF NOT EXISTS cierre_cuenta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    saldo_cierre DECIMAL(15, 2) NOT NULL,
    fecha_cierre DATETIME NOT NULL,
    fecha_corte DATE NOT NULL DEFAULT '2026-01-01',
    observaciones VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cliente_fecha_corte (cliente_id, fecha_corte)
);

-- Índice para búsquedas rápidas por cliente
CREATE INDEX idx_cierre_cuenta_cliente ON cierre_cuenta(cliente_id);

-- Índice para búsquedas por fecha de corte
CREATE INDEX idx_cierre_cuenta_fecha_corte ON cierre_cuenta(fecha_corte);

