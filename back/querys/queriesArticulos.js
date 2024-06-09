module.exports = {
  getAllArticulos: `SELECT 
  a.id AS id,
a.nombre AS articulo_nombre,
a.stock AS articulo_stock,
a.codigo_producto AS articulo_codigo,
p.nombre AS proveedor_nombre,
a.precio_monotributista AS precio_monotributista,
a.costo AS articulo_costo,
a.fecha_actualizacion_costo AS fecha_actualizacion_costo,
a.fecha_actualizacion_pm AS fecha_actualizacion_pm,
a.fecha_actualizacion_po AS fecha_actualizacion_po,
s.nombre AS sublinea_nombre,
l.nombre AS linea_nombre,
a.estado AS estado
FROM 
articulo a
INNER JOIN 
proveedor p ON a.proveedor_id = p.id
LEFT JOIN 
subLinea s ON a.subLinea_id = s.id
LEFT JOIN 
linea l ON s.linea_id = l.id;`,
  addArticulo: `INSERT INTO articulo (nombre, stock, codigo_producto, proveedor_id, precio_monotributista, costo, fecha_actualizacion_costo, fecha_actualizacion_pm, fecha_actualizacion_po, subLinea_id, linea_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?);`,
  dropArticulo: `UPDATE articulo SET estado = 0 WHERE ID = ?;`,
  upArticulo: `UPDATE articulo SET estado = 1 WHERE ID = ?;`,
  updateArticulo: `UPDATE articulo SET nombre = ?, stock = ?, codigo_producto = ?, proveedor_id = ?, precio_monotributista = ?, costo = ?, subLinea_id = ? WHERE ID = ?;`,
};
