module.exports = {
  getAllVentas: `SELECT 
  v.id,
  c.nombre AS nombre_cliente,
  v.nroVenta,
  v.estado,
  v.pago,
  dv.articulo_id,
  dv.costo,
  dv.cantidad,
  dv.precio_monotributista
FROM 
  venta v
JOIN 
  cliente c ON v.cliente_id = c.id
JOIN 
  detalle_venta dv ON v.id = dv.venta_id
ORDER BY 
  v.id; 
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
  getVentaByID: `SELECT dv.id, dv.articulo_id, a.nombre AS nombre_articulo, dv.venta_id, dv.costo, dv.cantidad, dv.precio_monotributista, dv.fecha, c.nombre AS nombre_cliente
  FROM detalle_venta dv
  INNER JOIN articulo a ON dv.articulo_id = a.id
  INNER JOIN venta v ON dv.venta_id = v.id
  INNER JOIN cliente c ON v.cliente_id = c.id
  WHERE dv.venta_id = ?;
  `,
};
