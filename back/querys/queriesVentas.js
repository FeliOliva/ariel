module.exports = {
  getAllVentas: `SELECT 
  v.id,
  v.estado, 
  c.nombre AS nombre_cliente, 
  c.apellido AS apellido_cliente,
  c.farmacia,
  v.nroVenta,
  z.nombre AS nombre_zona,
  REPLACE(FORMAT(v.descuento, 0), ',', '.') AS descuento,  -- Reemplaza la coma por el punto
  REPLACE(FORMAT(v.total_con_descuento, 0), ',', '.') AS total_con_descuento,  -- Reemplaza la coma por el punto
  REPLACE(FORMAT(v.total, 0), ',', '.') AS total,  -- Reemplaza la coma por el punto
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
GROUP BY 
  v.id, 
  v.estado, 
  c.nombre, 
  c.apellido, 
  v.nroVenta, 
  z.nombre, 
  v.descuento, 
  v.total_con_descuento, 
  v.fecha_venta 
ORDER BY 
  v.id DESC;
    `,
  addVenta: `INSERT INTO venta (cliente_id, nroVenta, zona_id, descuento) VALUES (?, ?, ?, ?);`,
  addDetalleVenta: `INSERT INTO detalle_venta (venta_id, articulo_id, costo, cantidad, precio_monotributista,sub_total) VALUES (?, ?, ?, ?, ?, ?);`,
  dropVenta: `UPDATE Venta SET estado = 0 WHERE ID = ?;`,
  upVenta: `UPDATE Venta SET estado = 1 WHERE ID = ?;`,
  updateVentas: `UPDATE Ventas SET producto_id = ?, cantidad = ?, cliente_id = ?, zona_id = ? WHERE ID = ?;`,
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
    SUM(v.total_con_descuento) AS total_ventas
FROM 
    venta v
JOIN 
    cliente c ON v.cliente_id = c.id
WHERE 
    c.zona_id = ?
    AND DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?)
    AND v.estado = 1
GROUP BY 
    c.id, c.nombre, c.apellido, c.zona_id
ORDER BY 
    total_ventas DESC;
`,
  getVentasByProducto: `SELECT v.ID, p.nombre AS nombre_producto, c.nombre AS nombre_cliente, z.zona AS nombre_zona, v.cantidad AS cantidad, v.estado AS estado
  FROM Ventas v
  JOIN Producto p ON v.producto_id = p.ID
  JOIN Cliente c ON v.cliente_id = c.ID
  JOIN Zona z ON v.zona_id = z.ID
  WHERE p.ID = ?;`,
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
  addCuentaCorriente: `INSERT INTO cuenta_corriente (cliente_id, saldo_total, fecha_ultima_actualizacion,venta_id) VALUES (?, ?, NOW(), ?)`,
  getCuentaCorrienteByClienteId: `SELECT * FROM cuenta_corriente WHERE cliente_id = ?`,
  updateCuentaCorriente: `UPDATE cuenta_corriente SET saldo_total = ? WHERE cliente_id = ?`,
  addPagoCuentaCorriente: `INSERT INTO pagos_cuenta_corriente (cliente_id, monto_total, fecha_pago) VALUES (?, ?, NOW())`,
  getPagoCuentaCorrienteByClienteId: `SELECT * FROM pagos_cuenta_corriente WHERE cliente_id = ?`,
  updatePagoCuentaCorriente: `UPDATE pagos_cuenta_corriente SET monto_total = ? WHERE cliente_id = ?`,
  getSaldoTotalCuentaCorriente: `SELECT SUM(saldo_total) as saldo_acumulado FROM cuenta_corriente WHERE cliente_id = ?`,
  updateVentaTotal: `UPDATE venta SET total = ?, total_con_descuento = ? WHERE id = ?`,
  getResumenCliente: `SELECT 
    'Venta' AS tipo,
    v.id, 
    v.estado, 
    v.cliente_id, 
    v.nroVenta AS numero, 
    v.fecha_venta AS fecha, 
    v.total_con_descuento, 
    NULL AS monto, 
    NULL AS metodo_pago
FROM venta v
WHERE v.cliente_id = ?
AND v.estado = 1
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
    p.monto, 
    p.metodo_pago
FROM pagos p
WHERE p.cliente_id = ?
AND p.estado = 1
AND p.fecha_pago BETWEEN ? AND ?

UNION ALL

SELECT 
    'Nota de Crédito' AS tipo,
    nc.id, 
    nc.estado, 
    nc.cliente_id, 
    nc.nroNC AS numero, 
    nc.fecha, 
    NULL AS total_con_descuento, 
    NULL AS monto, 
    NULL AS metodo_pago
FROM notasCredito nc
WHERE nc.cliente_id = ? 
AND nc.estado = 1
AND nc.fecha BETWEEN ? AND ?

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
         AND DATE(fecha_venta) BETWEEN DATE(?) AND DATE(?)), 0, 'de_DE'
    ) AS total_ventas_formateado
  FROM venta v
  JOIN cliente c ON v.cliente_id = c.id
  JOIN zona z ON v.zona_id = z.id
  WHERE v.cliente_id = ?
    AND v.estado = 1
    AND DATE(v.fecha_venta) BETWEEN DATE(?) AND DATE(?);
`,
  getDetallesVenta: `SELECT articulo_id, cantidad FROM detalle_venta WHERE venta_id = ?;`,
  devolverStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
  restarStock: `UPDATE articulo SET stock = stock - ? WHERE id = ?;`,
};
