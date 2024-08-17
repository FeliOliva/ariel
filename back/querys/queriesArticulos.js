module.exports = {
  getAllArticulos: `SELECT 
      a.id,
      a.nombre,
      a.stock,
      a.codigo_producto,
      a.proveedor_id,
      a.precio_monotributista,
      a.costo,
      a.subLinea_id,
      a.estado,
      a.linea_id,
      a.mediciones,
      a.fecha_ingreso,
      a.precio_oferta,
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
  addArticulo: `INSERT INTO articulo (nombre, mediciones, stock, codigo_producto, proveedor_id, precio_monotributista, costo, linea_id, subLinea_id, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());`,
  dropArticulo: `UPDATE articulo SET estado = 0 WHERE id = ?;`,
  upArticulo: `UPDATE articulo SET estado = 1 WHERE id = ?;`,
  updateArticulo: `UPDATE articulo SET nombre = ?, stock = ?, codigo_producto = ?, proveedor_id = ?, precio_monotributista = ?, costo = ?, subLinea_id = ?, linea_id = ?, mediciones = ?, fecha_ingreso = NOW() WHERE id = ?;`,
  getArticuloByID: `SELECT 
      a.id,
      a.nombre,
      a.stock,
      a.codigo_producto,
      a.proveedor_id,
      a.precio_monotributista,
      a.costo,
      a.subLinea_id,
      a.estado,
      a.linea_id,
      a.mediciones,
      a.fecha_ingreso,
      a.precio_oferta,
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
      proveedor p ON a.proveedor_id = p.id
  WHERE 
      a.id = ?;
  `,
  getArticulosByProveedorID: `SELECT 
      a.id,
      a.nombre,
      a.stock,
      a.codigo_producto,
      a.proveedor_id,
      a.precio_monotributista,
      a.costo,
      a.subLinea_id,
      a.estado,
      a.linea_id,
      a.mediciones,
      a.fecha_ingreso,
      a.precio_oferta,
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
      proveedor p ON a.proveedor_id = p.id
  WHERE proveedor_id = ?;`,
  getArticulosByLineaID: `SELECT * FROM articulo WHERE linea_id = ?;`,
  getArticulosBySubLineaID: `SELECT * FROM articulo WHERE subLinea_id = ?;`,
  increasePrices: `
        UPDATE articulo 
        SET 
          precio_monotributista = precio_monotributista * (1 + ? / 100),
          costo = costo * (1 + ? / 100)
        WHERE proveedor_id = ?;
      `,
  increasePrice: `
      UPDATE articulo
      SET 
        precio_monotributista = precio_monotributista * (1 + ? / 100),
        costo = costo * (1 + ? / 100)
      WHERE ID = ?;
    `,
  updateLogPrecios: `
      INSERT INTO precio_log (articulo_id, costo_nuevo, costo_antiguo, precio_monotributista_nuevo, precio_monotributista_antiguo, porcentaje) 
      VALUES (?, ?, ?, ?, ?, ?);
    `,
  logsPreciosById: `SELECT pl.*, a.nombre AS nombre_articulo
FROM precio_log pl
JOIN articulo a ON pl.articulo_id = a.id
WHERE pl.articulo_id = ?;
`,
  deshacerCambiosUpdate: `
UPDATE articulo 
SET costo = ?, precio_monotributista = ? 
WHERE id = ?;
`,
  deshacerCambiosDelete: `
DELETE FROM precio_log 
WHERE id = ?;
`,
};
