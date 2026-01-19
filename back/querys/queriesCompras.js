module.exports = {
  getAllCompras: `SELECT 
  compra.id,
  compra.nro_compra,
  compra.total,
  compra.fecha_compra, 
  compra.estado,
  compra.porcentaje_aumento_global,
  compra.porcentaje_aumento_costo_global,
  compra.porcentaje_aumento_precio_global,
  COALESCE(MAX(dc.porcentaje_aumento), NULL) AS porcentaje_aumento_max,
  COALESCE(MIN(dc.porcentaje_aumento), NULL) AS porcentaje_aumento_min,
  COUNT(DISTINCT dc.porcentaje_aumento) AS porcentaje_aumento_distintos,
  COALESCE(AVG(CASE WHEN dc.porcentaje_aumento IS NOT NULL THEN dc.porcentaje_aumento END), NULL) AS porcentaje_aumento_promedio
FROM 
  compra
LEFT JOIN
  detalle_compra dc ON compra.id = dc.compra_id
GROUP BY compra.id, compra.nro_compra, compra.total, compra.fecha_compra, compra.estado, compra.porcentaje_aumento_global, compra.porcentaje_aumento_costo_global, compra.porcentaje_aumento_precio_global
ORDER BY compra.id DESC;
`,
  addCompra: `INSERT INTO compra (nro_compra, total, porcentaje_aumento_global, porcentaje_aumento_costo_global, porcentaje_aumento_precio_global) VALUES (?, ?, ?, ?, ?);`,
  getCompraByID: `
  SELECT 
    dc.id AS detalle_compra_id,
    dc.compra_id, 
    dc.articulo_id, 
    a.nombre AS nombre_articulo,
    l.nombre AS linea_articulo, -- Nombre de la línea
    sl.nombre AS sublinea_articulo, -- Nombre de la sublínea
    a.mediciones AS medicion_articulo,
    dc.costo, 
    dc.precio_monotributista,
    dc.cantidad, 
    dc.porcentaje_aumento_costo,
    dc.porcentaje_aumento_precio,
    (dc.costo * dc.cantidad) AS subtotal, 
    c.nro_compra, 
    c.fecha_compra, 
    c.total
FROM detalle_compra dc
INNER JOIN articulo a ON dc.articulo_id = a.id
LEFT JOIN linea l ON a.linea_id = l.id -- Unir con la tabla de líneas
LEFT JOIN sublinea sl ON a.sublinea_id = sl.id -- Cambié 'a.sublinea' a 'a.sublinea_id' (verifica que el nombre sea correcto)
INNER JOIN compra c ON dc.compra_id = c.id
WHERE dc.compra_id = ?;
`,
  getComprasByProveedor: `SELECT c.*, d.articulo_id, a.nombre AS articulo_nombre, d.cantidad, d.costo
FROM compra c
LEFT JOIN detalle_compra d ON c.id = d.compra_id
LEFT JOIN articulo a ON d.articulo_id = a.id
WHERE c.proveedor_id = ?;
`,
  addDetalleCompra: `INSERT INTO detalle_compra (compra_id, articulo_id, cantidad, costo, precio_monotributista, sub_total, porcentaje_aumento, porcentaje_aumento_costo, porcentaje_aumento_precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  updateStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
  updateDetalleCompra: `
      UPDATE detalle_compra
      SET costo = ?,
      precio_monotributista = ?,
      cantidad = ?,
      sub_total = ?,
      porcentaje_aumento_costo = ?,
      porcentaje_aumento_precio = ?
      WHERE id = ?;
    `,
  updateCostoArticulo: `UPDATE articulo SET costo = ?, precio_monotributista = ? WHERE id = ?;`,
  updateTotalesCompra: `
      UPDATE compra
      SET total = ?
      WHERE id = ?;
    `,
  getDetalleCompra: `SELECT dc.*, a.linea_id 
    FROM detalle_compra dc
    INNER JOIN articulo a ON dc.articulo_id = a.id
    WHERE dc.compra_id = ?;`,
  getDetalleCompraById: `
    select id, costo, cantidad, articulo_id, precio_monotributista, porcentaje_aumento_costo, porcentaje_aumento_precio from detalle_compra where ID = ?;
  `,
  dropCompra: `UPDATE compra set estado = 0 WHERE id = ?;`,
  upCompra: `UPDATE compra set estado = 1 WHERE id = ?;`,
  deleteDetalleCompra: `DELETE FROM detalle_compra WHERE compra_id = ?;`,
  deleteCompra: `DELETE FROM compra WHERE id = ?;`,
};
