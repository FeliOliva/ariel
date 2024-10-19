module.exports = {
  getAllCompras: `SELECT 
  Compra.id,
  Compra.proveedor_id,
  Proveedor.nombre AS proveedor_nombre,
  Compra.nro_compra,
  Compra.total,
  Compra.fecha_compra, 
  Compra.estado
FROM 
  Compra
INNER JOIN 
  Proveedor ON Compra.proveedor_id = Proveedor.id
ORDER BY Compra.id DESC;
`,
  addCompra: `INSERT INTO Compra (proveedor_id, nro_compra, total) VALUES (?, ?, ?);`,
  getCompraByID: `
  SELECT 
	dc.id AS detalle_compra_id,
    dc.compra_id, 
    dc.articulo_id, 
    a.nombre AS nombre_articulo, 
    dc.costo, 
    dc.cantidad, 
    (dc.costo * dc.cantidad) AS subtotal, 
    c.nro_compra, 
    c.fecha_compra, 
    c.total, 
    p.nombre AS proveedor
  FROM detalle_compra dc
  INNER JOIN articulo a ON dc.articulo_id = a.id
  INNER JOIN compra c ON dc.compra_id = c.id
  INNER JOIN proveedor p ON c.proveedor_id = p.id
  WHERE dc.compra_id = ?;
`,
  getComprasByProveedor: `SELECT c.*, d.articulo_id, a.nombre AS articulo_nombre, d.cantidad, d.costo
FROM Compra c
LEFT JOIN detalle_compra d ON c.id = d.compra_id
LEFT JOIN articulo a ON d.articulo_id = a.id
WHERE c.proveedor_id = ?;
`,
  addDetalleCompra: `INSERT INTO detalle_compra (compra_id, articulo_id, cantidad, costo, sub_total) VALUES (?, ?, ?, ?, ?);`,
  updateStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
  updateDetalleCompra: `
      UPDATE detalle_compra
      SET costo = ?,
      sub_total = ?
      WHERE id = ?;
    `,
  updateCostoArticulo: `UPDATE articulo SET costo = ? WHERE id = ?;`,
  updateTotalesCompra: `
      UPDATE compra
      SET total = ?
      WHERE id = ?;
    `,
  getDetalleCompra: "SELECT * FROM detalle_compra WHERE compra_id = ?;"

};
