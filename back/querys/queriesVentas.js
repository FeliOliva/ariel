module.exports = {
  getAllVentas: `SELECT v.ID, p.nombre AS nombre_producto, c.nombre AS nombre_cliente, z.zona AS nombre_zona, v.cantidad AS cantidad, v.estado AS estado
  FROM Ventas v
  JOIN Producto p ON v.producto_id = p.ID
  JOIN Cliente c ON v.cliente_id = c.ID
  JOIN Zona z ON v.zona_id = z.ID
  ORDER BY v.ID;  
    `,
  addVenta: `INSERT INTO Ventas (producto_id, cantidad, cliente_id, zona_id) VALUES (?, ?, ?, ?);`,
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
};
