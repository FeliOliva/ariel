-- ============================================
-- QUERIES PARA REVISAR CIERRES DE CUENTA
-- ============================================

-- 1. SALDO TOTAL DEL CIERRE MASIVO (para fecha_corte específica)
-- Este es el que se muestra en el dashboard "Saldo Inicial (Cierre 2026)"
SELECT 
    COALESCE(SUM(saldo_cierre), 0) AS saldo_total,
    fecha_corte,
    COUNT(*) AS cantidad_clientes
FROM cierre_cuenta
WHERE fecha_corte = '2026-01-01'
GROUP BY fecha_corte;

-- 2. SALDO TOTAL POR FECHA DE CORTE (si hay múltiples fechas)
SELECT 
    fecha_corte,
    COALESCE(SUM(saldo_cierre), 0) AS saldo_total,
    COUNT(*) AS cantidad_clientes,
    MIN(fecha_cierre) AS primera_fecha_cierre,
    MAX(fecha_cierre) AS ultima_fecha_cierre
FROM cierre_cuenta
GROUP BY fecha_corte
ORDER BY fecha_corte DESC;

-- 3. DETALLE DE TODOS LOS CIERRES (con información del cliente)
SELECT 
    cc.id,
    cc.cliente_id,
    c.nombre,
    c.apellido,
    c.farmacia,
    z.nombre AS zona_nombre,
    cc.saldo_cierre,
    cc.fecha_corte,
    cc.fecha_cierre,
    cc.observaciones
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
LEFT JOIN zona z ON c.zona_id = z.id
WHERE cc.fecha_corte = '2026-01-01'
ORDER BY cc.saldo_cierre DESC;

-- 4. RESUMEN POR ZONA
SELECT 
    z.nombre AS zona_nombre,
    COUNT(*) AS cantidad_clientes,
    COALESCE(SUM(cc.saldo_cierre), 0) AS saldo_total_zona,
    COALESCE(AVG(cc.saldo_cierre), 0) AS saldo_promedio
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
LEFT JOIN zona z ON c.zona_id = z.id
WHERE cc.fecha_corte = '2026-01-01'
GROUP BY z.id, z.nombre
ORDER BY saldo_total_zona DESC;

-- 5. CLIENTES CON MAYOR SALDO EN EL CIERRE
SELECT 
    c.id AS cliente_id,
    c.nombre,
    c.apellido,
    c.farmacia,
    z.nombre AS zona_nombre,
    cc.saldo_cierre,
    cc.fecha_cierre
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
LEFT JOIN zona z ON c.zona_id = z.id
WHERE cc.fecha_corte = '2026-01-01'
ORDER BY cc.saldo_cierre DESC
LIMIT 20;

-- 6. CLIENTES CON SALDO NEGATIVO (a favor del cliente)
SELECT 
    c.id AS cliente_id,
    c.nombre,
    c.apellido,
    c.farmacia,
    z.nombre AS zona_nombre,
    cc.saldo_cierre,
    cc.fecha_cierre
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
LEFT JOIN zona z ON c.zona_id = z.id
WHERE cc.fecha_corte = '2026-01-01'
  AND cc.saldo_cierre < 0
ORDER BY cc.saldo_cierre ASC;

-- 7. VERIFICAR SI UN CLIENTE ESPECÍFICO TIENE CIERRE
-- Reemplazar ? con el ID del cliente
SELECT 
    cc.*,
    c.nombre,
    c.apellido,
    c.farmacia
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
WHERE cc.cliente_id = ?  -- Reemplazar con el ID del cliente
  AND cc.fecha_corte = '2026-01-01';

-- 8. COMPARAR SALDO DEL CIERRE VS SALDO CALCULADO EN TIEMPO REAL
-- Útil para verificar si hay discrepancias
SELECT 
    c.id AS cliente_id,
    c.nombre,
    c.apellido,
    c.farmacia,
    cc.saldo_cierre AS saldo_en_cierre,
    COALESCE(ventas.total_ventas, 0) AS total_ventas,
    COALESCE(pagos.total_pagos, 0) AS total_pagos,
    COALESCE(notas_credito.total_nc, 0) AS total_nc,
    (COALESCE(ventas.total_ventas, 0) - COALESCE(pagos.total_pagos, 0) - COALESCE(notas_credito.total_nc, 0)) AS saldo_calculado,
    (cc.saldo_cierre - (COALESCE(ventas.total_ventas, 0) - COALESCE(pagos.total_pagos, 0) - COALESCE(notas_credito.total_nc, 0))) AS diferencia
FROM cierre_cuenta cc
INNER JOIN cliente c ON cc.cliente_id = c.id
LEFT JOIN (
    SELECT cliente_id, SUM(total_con_descuento) AS total_ventas
    FROM venta
    WHERE estado = 1 AND fecha_venta < '2026-01-01'
    GROUP BY cliente_id
) AS ventas ON c.id = ventas.cliente_id
LEFT JOIN (
    SELECT cliente_id, SUM(monto) AS total_pagos
    FROM pagos
    WHERE estado = 1 AND fecha_pago < '2026-01-01'
    GROUP BY cliente_id
) AS pagos ON c.id = pagos.cliente_id
LEFT JOIN (
    SELECT nc.cliente_id, SUM(dnc.subTotal) AS total_nc
    FROM notascredito nc
    JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
    WHERE nc.estado = 1 AND nc.fecha < '2026-01-01'
    GROUP BY nc.cliente_id
) AS notas_credito ON c.id = notas_credito.cliente_id
WHERE cc.fecha_corte = '2026-01-01'
HAVING diferencia != 0  -- Solo mostrar si hay diferencia
ORDER BY ABS(diferencia) DESC;

-- 9. ESTADÍSTICAS GENERALES DEL CIERRE
SELECT 
    fecha_corte,
    COUNT(*) AS total_clientes_con_cierre,
    COUNT(CASE WHEN saldo_cierre > 0 THEN 1 END) AS clientes_con_saldo_positivo,
    COUNT(CASE WHEN saldo_cierre < 0 THEN 1 END) AS clientes_con_saldo_negativo,
    COUNT(CASE WHEN saldo_cierre = 0 THEN 1 END) AS clientes_con_saldo_cero,
    COALESCE(SUM(saldo_cierre), 0) AS saldo_total,
    COALESCE(SUM(CASE WHEN saldo_cierre > 0 THEN saldo_cierre ELSE 0 END), 0) AS saldo_total_positivo,
    COALESCE(SUM(CASE WHEN saldo_cierre < 0 THEN saldo_cierre ELSE 0 END), 0) AS saldo_total_negativo,
    COALESCE(AVG(saldo_cierre), 0) AS saldo_promedio,
    COALESCE(MAX(saldo_cierre), 0) AS saldo_maximo,
    COALESCE(MIN(saldo_cierre), 0) AS saldo_minimo
FROM cierre_cuenta
WHERE fecha_corte = '2026-01-01'
GROUP BY fecha_corte;
