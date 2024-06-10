module.exports = {
  getAllArticulos: `SELECT 
    a.id AS articulo_id,
    a.nombre AS articulo_nombre,
    a.stock AS articulo_stock,
    a.codigo_producto AS articulo_codigo,
    a.proveedor_id,
    a.precio_monotributista,
    a.costo AS articulo_costo,
    a.fecha_actualizacion_costo,
    a.fecha_actualizacion_pm,
    a.fecha_actualizacion_po,
    a.subLinea_id,
    a.estado,
    a.linea_id,
    l.nombre AS linea_nombre,
    s.nombre AS sublinea_nombre,
    p.nombre AS proveedor_nombre
FROM 
    articulo a
LEFT JOIN 
    linea l ON a.linea_id = l.id
LEFT JOIN 
    sublinea s ON a.subLinea_id = s.id
LEFT JOIN 
    proveedor p ON a.proveedor_id = p.id;
`,
  addArticulo: `INSERT INTO articulo (nombre, stock, codigo_producto, proveedor_id, precio_monotributista, costo, subLinea_id, linea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
  dropArticulo: `UPDATE articulo SET estado = 0 WHERE ID = ?;`,
  upArticulo: `UPDATE articulo SET estado = 1 WHERE ID = ?;`,
  updateArticulo: `UPDATE articulo SET nombre = ?, stock = ?, codigo_producto = ?, proveedor_id = ?, precio_monotributista = ?, costo = ?, subLinea_id = ? WHERE ID = ?;`,
};
