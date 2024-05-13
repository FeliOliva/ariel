module.exports = {
  getAllProducts: `
SELECT 
  p.ID,
  p.nombre,
  p.cantidad,
  m.nombre AS nombre_marca,
  c.nombre AS nombre_categoria,
  p.precio,
  p.estado
FROM 
  Producto p
JOIN 
  Marca m ON p.marca_id = m.ID
JOIN 
  Categoria c ON p.categoria_id = c.ID
ORDER BY 
  p.ID;
`,
  addProduct: `INSERT INTO Producto (nombre, cantidad, marca_id, categoria_id, precio) VALUES (?, ?, ?, ?,?);`,
  dropProduct: `UPDATE Producto SET estado = 'inactivo' WHERE ID = ?;`,
  upProduct: `UPDATE Producto SET estado = 'activo' WHERE ID = ?;`,
  updateProducts: `UPDATE Producto SET nombre = ?, cantidad = ?, marca_id = ?, categoria_id = ?, precio = ? WHERE ID = ?;`,
};
