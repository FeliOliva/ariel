module.exports = {
  getAllVentas: `SELECT 
  v.id,
  v.estado, 
  c.nombre AS nombre_cliente, 
  c.apellido AS apellido_cliente,
  v.nroVenta,
  z.nombre AS nombre_zona,
  v.pago,
  v.fecha_venta,
  COALESCE(SUM(d.costo * d.cantidad), 0) AS total_costo,
  COALESCE(SUM(d.precio_monotributista * d.cantidad), 0) AS total_monotributista
FROM venta v
INNER JOIN cliente c ON v.cliente_id = c.id
INNER JOIN zona z ON v.zona_id = z.id
LEFT JOIN detalle_venta d ON v.id = d.venta_id
GROUP BY v.id, v.estado, c.nombre, v.nroVenta, z.nombre, v.pago
ORDER BY v.id DESC;

    `,
  addVenta: `INSERT INTO venta (cliente_id, nroVenta, zona_id, pago) VALUES (?, ?, ?, ?);`,
  addDetalleVenta: `INSERT INTO detalle_venta (venta_id, articulo_id, costo, cantidad, precio_monotributista) VALUES (?, ?, ?, ?, ?);`,
  dropVenta: `UPDATE Ventas SET estado = 'inactivo' WHERE ID = ?;`,
  upVenta: `UPDATE Ventas SET estado = 'activo' WHERE ID = ?;`,
  updateVentas: `UPDATE Ventas SET producto_id = ?, cantidad = ?, cliente_id = ?, zona_id = ? WHERE ID = ?;`,
  getVentasByClientes: `SELECT v.ID, p.nombre AS nombre_producto, c.nombre AS nombre_cliente, z.zona AS nombre_zona, v.cantidad AS cantidad, v.estado AS estado
  FROM Ventas v
  JOIN Producto p ON v.producto_id = p.ID
  JOIN Cliente c ON v.cliente_id = c.ID
  JOIN Zona z ON v.zona_id = z.ID
  WHERE c.ID = ?;`,
  getVentasByZona: `SELECT v.ID, p.nombre AS nombre_producto, c.nombre AS nombre_cliente, z.zona AS nombre_zona, v.cantidad AS cantidad, v.estado AS estado
  FROM Ventas v
  JOIN Producto p ON v.producto_id = p.ID
  JOIN Cliente c ON v.cliente_id = c.ID
  JOIN Zona z ON v.zona_id = z.ID
  WHERE z.ID = ?;`,
  getVentasByProducto: `SELECT v.ID, p.nombre AS nombre_producto, c.nombre AS nombre_cliente, z.zona AS nombre_zona, v.cantidad AS cantidad, v.estado AS estado
  FROM Ventas v
  JOIN Producto p ON v.producto_id = p.ID
  JOIN Cliente c ON v.cliente_id = c.ID
  JOIN Zona z ON v.zona_id = z.ID
  WHERE p.ID = ?;`,
  getVentaByID: `SELECT 
  dv.id, 
  dv.articulo_id, 
  a.nombre AS nombre_articulo, 
  a.codigo_producto AS cod_articulo,
  dv.venta_id, 
  v.nroVenta,  -- Número de venta
  dv.costo, 
  dv.cantidad, 
  dv.precio_monotributista, 
  dv.fecha, 
  CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente_completo, -- Nombre completo del cliente
  c.direccion, -- Dirección del cliente
  c.cuil, -- CUIL del cliente
  c.telefono, -- Teléfono del cliente
  c.email, 
  c.tipo_cliente,  -- ID del tipo de cliente
  tc.nombre_tipo AS nombre_tipo_cliente,  -- Nombre del tipo de cliente
  z.nombre AS nombre_zona,
  (dv.precio_monotributista * dv.cantidad) AS total_precio_monotributista, -- Importe de cada detalle
  (SELECT SUM(dv1.precio_monotributista * dv1.cantidad)
   FROM detalle_venta dv1 
   WHERE dv1.venta_id = dv.venta_id) AS total_importe -- Total de todos los detalles
FROM detalle_venta dv
INNER JOIN articulo a ON dv.articulo_id = a.id
INNER JOIN venta v ON dv.venta_id = v.id
INNER JOIN cliente c ON v.cliente_id = c.id
INNER JOIN zona z ON c.zona_id = z.id
INNER JOIN tipo_cliente tc ON c.tipo_cliente = tc.id  -- Unión con tipo_cliente
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
  updateVentaTotal: `UPDATE venta SET total = ? WHERE id = ?`,
};
