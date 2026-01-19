module.exports = {
  // Query optimizada: sin LEFT JOIN con detalle_venta ni GROUP BY
  // Esto mejora significativamente el rendimiento con muchos registros
  getAllVentas: `SELECT 
  v.id,
  v.estado, 
  c.nombre AS nombre_cliente, 
  c.apellido AS apellido_cliente,
  c.farmacia,
  c.id AS cliente_id,
  v.nroVenta,
  z.nombre AS nombre_zona,
  v.descuento,
  v.total_con_descuento,
  v.total,
  v.fecha_venta
FROM 
  venta v
INNER JOIN 
  cliente c ON v.cliente_id = c.id
INNER JOIN 
  zona z ON v.zona_id = z.id
ORDER BY 
  v.id DESC;
    `,
  addVenta: `INSERT INTO venta (cliente_id, nroVenta, zona_id, descuento) VALUES (?, ?, ?, ?);`,
  addDetalleVenta: `INSERT INTO detalle_venta (venta_id, articulo_id, costo, cantidad, precio_monotributista,sub_total, aumento_porcentaje) VALUES (?, ?, ?, ?, ?, ?, ?);`,
  updateVentas: `UPDATE venta SET fecha_venta = ?, total_con_descuento = ?, descuento = ? WHERE ID = ?;`,
  getVentasByClientes: `SELECT 
    v.id, 
    v.estado, 
    v.cliente_id, 
    v.nroVenta, 
    v.zona_id, 
    v.fecha_venta,
    FORMAT(v.total, 0, 'de_DE') AS total,
    v.descuento, 
    FORMAT(v.total_con_descuento, 0, 'de_DE') AS total_con_descuento, 
    c.nombre AS nombre_cliente, 
    c.apellido AS apellido_cliente, 
    c.farmacia AS farmacia, 
    z.nombre AS nombre_zona,
    FORMAT(
        (SELECT SUM(total_con_descuento) 
         FROM venta 
         WHERE cliente_id = v.cliente_id), 0, 'de_DE'
    ) AS total_ventas_formateado
FROM venta v
JOIN cliente c ON v.cliente_id = c.id
JOIN zona z ON v.zona_id = z.id
WHERE v.cliente_id = ?;`,
  getVentasByZona: `SELECT 
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    c.apellido AS cliente_apellido,
    c.farmacia AS cliente_farmacia,
    c.zona_id AS cliente_zona,
    c.localidad AS cliente_localidad,
    SUM(v.total_con_descuento) AS total_ventas
FROM 
    venta v
JOIN 
    cliente c ON v.cliente_id = c.id
WHERE 
    c.zona_id = ?
    AND c.estado = 1
    AND v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)
    AND v.estado = 1
GROUP BY 
    c.id, c.nombre, c.apellido, c.zona_id
ORDER BY 
    total_ventas DESC;
`,
  getVentasByProducto: `SELECT 
    v.id AS venta_id,
    a.nombre AS nombre_producto,
    c.nombre AS nombre_cliente,
    z.nombre AS nombre_zona,
    dv.cantidad AS cantidad,
    v.estado AS estado
  FROM detalle_venta dv
  JOIN venta v ON dv.venta_id = v.id
  JOIN articulo a ON dv.articulo_id = a.id
  JOIN cliente c ON v.cliente_id = c.id
  JOIN zona z ON v.zona_id = z.id
  WHERE dv.articulo_id = ?;`,
  getVentaByID: `
 SELECT 
  dv.id AS id_dv, 
  dv.articulo_id, 
  a.nombre AS nombre_articulo, 
  a.codigo_producto AS cod_articulo,
  a.mediciones,
  dv.venta_id, 
  v.nroVenta,  -- Número de venta
  v.id AS id_venta,
  REPLACE(FORMAT(ROUND(v.total, 0), 0), ',', '.') AS total_venta, -- Total de la venta formateado
  ROUND(v.descuento, 0) AS descuento, -- Porcentaje de descuento redondeado sin decimales
  REPLACE(FORMAT(ROUND(v.total_con_descuento, 0), 0), ',', '.') AS total_con_descuento, -- Total con descuento formateado
  REPLACE(FORMAT(ROUND(dv.costo, 0), 0), ',', '.') AS costo, -- Costo redondeado y formateado
  dv.cantidad AS cantidad, -- Cantidad sin modificar
  REPLACE(FORMAT(ROUND(dv.precio_monotributista, 0), 0), ',', '.') AS precio_monotributista, -- Precio redondeado y formateado
  dv.fecha, 
  dv.aumento_porcentaje, -- Porcentaje de aumento
  REPLACE(FORMAT(ROUND(dv.sub_total, 0), 0), ',', '.') AS sub_total, -- Subtotal redondeado y formateado
  CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente_completo, -- Nombre completo del cliente
  c.direccion, -- Dirección del cliente
  c.cuil, -- CUIL del cliente
  c.telefono, -- Teléfono del cliente
  c.email, 
  c.farmacia,
  c.localidad,
  c.tipo_cliente,  -- ID del tipo de cliente
  tc.nombre_tipo AS nombre_tipo_cliente,  -- Nombre del tipo de cliente
  z.nombre AS nombre_zona,
  l.nombre AS nombre_linea,  -- Nombre de la línea
  sl.nombre AS nombre_sublinea 
FROM detalle_venta dv
INNER JOIN articulo a ON dv.articulo_id = a.id
INNER JOIN venta v ON dv.venta_id = v.id
INNER JOIN cliente c ON v.cliente_id = c.id
INNER JOIN zona z ON c.zona_id = z.id
INNER JOIN tipo_cliente tc ON c.tipo_cliente = tc.id  -- Unión con tipo_cliente
INNER JOIN linea l ON a.linea_id = l.id  -- Unión con línea
INNER JOIN sublinea sl ON a.subLinea_id = sl.id  -- Unión con sublínea
WHERE dv.venta_id = ?;
  `,
  checkStock: "SELECT stock, nombre FROM articulo WHERE id = ?",
  descontarStock: "UPDATE articulo SET stock = stock - ? WHERE id = ?",
  updateLogVenta:
    "INSERT INTO stock_log(cliente_id, articulo_id, cantidad, fecha) VALUES (?, ?, ?, NOW())",
  getTotal: `select total, cliente_id from venta where id = ?`,
  updateVentaTotal: `UPDATE venta SET total = ?, total_con_descuento = ? WHERE id = ?`,
  getResumenCliente: `SELECT 
    'Venta' AS tipo,
    v.id, 
    v.estado, 
    v.cliente_id, 
    v.nroVenta AS numero, 
    v.fecha_venta AS fecha, 
    FORMAT(v.total_con_descuento, 2, 'de_DE') AS total_con_descuento, 
    NULL AS monto, 
    NULL AS metodo_pago,
    NULL AS vendedor_id,
    NULL AS vendedor_nombre
FROM venta v
WHERE v.cliente_id = ?
AND v.fecha_venta BETWEEN ? AND ?

UNION ALL

SELECT 
    'Pago' AS tipo,
    p.id, 
    p.estado, 
    p.cliente_id, 
    p.nro_pago AS numero, 
    p.fecha_pago AS fecha, 
    NULL AS total_con_descuento, 
    FORMAT(p.monto, 2, 'de_DE') AS monto, 
    p.metodo_pago,
    vend.id AS vendedor_id,
    vend.nombre AS vendedor_nombre
FROM pagos p
LEFT JOIN vendedores vend ON p.vendedor_id = vend.id
WHERE p.cliente_id = ?
AND p.fecha_pago BETWEEN ? AND ?

UNION ALL

SELECT 
    'Nota de Crédito' AS tipo,
    nc.id, 
    nc.estado, 
    nc.cliente_id, 
    nc.nroNC AS numero, 
    nc.fecha, 
    FORMAT(SUM(dnc.subTotal), 2, 'de_DE') AS total_con_descuento, 
    NULL AS monto, 
    NULL AS metodo_pago,
    NULL AS vendedor_id,
    NULL AS vendedor_nombre
FROM notascredito nc
JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
WHERE nc.cliente_id = ? 
AND nc.fecha BETWEEN ? AND ?
GROUP BY nc.id, nc.estado, nc.cliente_id, nc.nroNC, nc.fecha

ORDER BY fecha;
`,
  getVentasByClientesxFecha: `
  SELECT 
    v.id, 
    v.estado, 
    v.cliente_id, 
    v.nroVenta, 
    v.zona_id, 
    DATE_FORMAT(v.fecha_venta, '%Y-%m-%d %H:%i:%s') AS fecha_venta,
    FORMAT(v.total, 0, 'de_DE') AS total_formateado,
    v.descuento, 
    FORMAT(v.total_con_descuento, 0, 'de_DE') AS total_con_descuento_formateado, 
    c.nombre AS nombre_cliente, 
    c.apellido AS apellido_cliente, 
    c.farmacia AS farmacia, 
    z.nombre AS nombre_zona,
    FORMAT(
        (SELECT SUM(total_con_descuento) 
         FROM venta 
         WHERE cliente_id = v.cliente_id
         AND estado = 1  
         AND fecha_venta >= ? AND fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)), 0, 'de_DE'
    ) AS total_ventas_formateado
  FROM venta v
  JOIN cliente c ON v.cliente_id = c.id
  JOIN zona z ON v.zona_id = z.id
  WHERE v.cliente_id = ?
    AND v.estado = 1
    AND v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY);
`,
  getDetallesVenta: `SELECT articulo_id, cantidad FROM detalle_venta WHERE venta_id = ?;`,
  devolverStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
  dropDetallesVenta: `DELETE FROM detalle_venta WHERE venta_id = ?;`,
  dropVenta: `DELETE FROM venta WHERE id = ?;`,
  getVentasPorFecha: `SELECT 
    v.id,
    v.estado,
    c.nombre AS nombre_cliente,
    c.apellido AS apellido_cliente,
    c.farmacia,
    v.nroVenta,
    z.nombre AS nombre_zona,
    v.descuento,
    v.total_con_descuento,
    v.total,
    v.fecha_venta,
    COALESCE(SUM(d.costo * d.cantidad), 0) AS total_costo
FROM 
    venta v
INNER JOIN 
    cliente c ON v.cliente_id = c.id
INNER JOIN
    zona z ON v.zona_id = z.id
LEFT JOIN 
    detalle_venta d ON v.id = d.venta_id
WHERE 
    v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)
GROUP BY
    v.id, 
    v.estado, 
    c.nombre,
    c.apellido, 
    v.nroVenta, 
    z.nombre,
    v.descuento, 
    v.total_con_descuento,
    v.total,
    v.fecha_venta
ORDER BY 
    v.id DESC;`,
};
