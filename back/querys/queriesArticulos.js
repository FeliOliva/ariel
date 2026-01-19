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
      proveedor p ON a.proveedor_id = p.id
    ORDER BY 
        a.fecha_ingreso DESC;
  `,
  addArticulo: `INSERT INTO articulo (nombre, mediciones, stock, codigo_producto, proveedor_id, precio_monotributista, costo, linea_id, subLinea_id, fecha_ingreso, precio_oferta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?);`,
  dropArticulo: `UPDATE articulo SET estado = 0 WHERE id = ?;`,
  upArticulo: `UPDATE articulo SET estado = 1 WHERE id = ?;`,
  updateArticulo: `UPDATE articulo SET nombre = ?, stock = ?, codigo_producto = ?, proveedor_id = ?, precio_monotributista = ?, costo = ?, subLinea_id = ?, linea_id = ?, mediciones = ?, fecha_ingreso = NOW(), precio_oferta = ? WHERE id = ?;`,
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
  WHERE 
      a.proveedor_id = ? 
      AND a.estado = 1;`,
  getArticulosByLineaID: `SELECT 
    a.nombre AS articulo_nombre,
    a.mediciones AS articulo_medicion,
    a.estado AS estado,
    l.nombre AS linea_nombre,
    sl.nombre AS sublinea_nombre,
    a.id AS articulo_id,
    a.stock,
    a.codigo_producto,
    a.costo,
    a.linea_id,
    a.precio_monotributista,
    a.precio_oferta
FROM 
    articulo a
LEFT JOIN 
    linea l ON a.linea_id = l.id
LEFT JOIN 
    subLinea sl ON a.subLinea_id = sl.id
WHERE 
    a.estado = 1 AND l.estado = 1 AND sl.estado = 1 AND a.linea_id = ?
ORDER BY 
    l.nombre ASC, 
    sl.nombre ASC,
    a.nombre ASC; `,
  getArticulosBySubLineaID: `SELECT * FROM articulo WHERE subLinea_id = ?;`,
  increasePrices: `
        UPDATE articulo 
        SET 
            precio_monotributista = ROUND(precio_monotributista * (1 + ? / 100), 0)
        WHERE linea_id = ?;
      `,
  decreasePrices: `
        UPDATE articulo 
        SET 
            precio_monotributista = ROUND(precio_monotributista * (1 - ? / 100), 0)
        WHERE linea_id = ?;
      `,
  increasePrice: `
      UPDATE articulo
      SET 
        precio_monotributista = ROUND(precio_monotributista * (1 + ? / 100), 0)
      WHERE ID = ?;
    `,
  decreasePrice: `
      UPDATE articulo
      SET 
        precio_monotributista = ROUND(precio_monotributista * (1 - ? / 100), 0)
      WHERE ID = ?;
    `,
  updateLogPrecios: `
      INSERT INTO precio_log (articulo_id, precio_monotributista_nuevo, precio_monotributista_antiguo, porcentaje) 
      VALUES (?, ?, ?, ?);
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
  getArticulosOrdenados: `
  SELECT 
    a.nombre AS articulo_nombre,
    a.mediciones AS articulo_medicion,
    a.estado AS estado,
    l.nombre AS linea_nombre,
    sl.nombre AS sublinea_nombre,
    a.id AS articulo_id,
    a.stock,
    a.codigo_producto,
    a.costo,
    a.linea_id,
    a.precio_monotributista,
    a.precio_oferta
FROM 
    articulo a
LEFT JOIN 
    linea l ON a.linea_id = l.id
LEFT JOIN 
    subLinea sl ON a.subLinea_id = sl.id
WHERE 
    l.estado = 1 AND sl.estado = 1 
ORDER BY 
    l.nombre ASC, 
    sl.nombre ASC,
    a.nombre ASC; 
`,
  getArticulosVendidosPorLinea: `
SELECT 
  a.codigo_producto AS codigo_articulo,
  CONCAT(a.nombre, ' - ', sl.nombre, ' - ', a.mediciones) AS nombre_completo,
  a.stock,
  ROUND(COALESCE(AVG(dv.precio_monotributista), a.precio_monotributista), 2) AS precio_monotributista,
  ROUND(COALESCE(AVG(dv.costo), a.costo), 2) AS costo,
  COALESCE(SUM(dv.cantidad), 0) AS unidades_vendidas,
  ROUND(COALESCE(SUM(dv.precio_monotributista * dv.cantidad), 0), 2) AS subtotal,
  ROUND(COALESCE(SUM((dv.precio_monotributista - dv.costo) * dv.cantidad), 0), 2) AS ganancia
FROM articulo a
LEFT JOIN sublinea sl ON a.subLinea_id = sl.id
LEFT JOIN detalle_venta dv ON a.id = dv.articulo_id
LEFT JOIN venta v ON dv.venta_id = v.id
WHERE a.linea_id = ? 
  AND a.estado = 1 
  AND sl.estado = 1
  AND (dv.id IS NULL OR (v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY) AND v.estado = 1))
GROUP BY a.id, a.codigo_producto, a.nombre, sl.nombre, a.mediciones, a.stock, a.precio_monotributista, a.costo
ORDER BY unidades_vendidas DESC;
`,
  getEvolucionGananciaPorLinea: `
SELECT 
  DATE(v.fecha_venta) AS fecha,
  a.id AS articulo_id,
  a.codigo_producto AS codigo_articulo,
  CONCAT(a.nombre, ' - ', sl.nombre, ' - ', a.mediciones) AS nombre_completo,
  ROUND(AVG(dv.precio_monotributista), 2) AS precio_promedio,
  ROUND(AVG(dv.costo), 2) AS costo_promedio,
  ROUND(AVG(dv.precio_monotributista - dv.costo), 2) AS diferencia_promedio,
  SUM(dv.cantidad) AS cantidad_vendida,
  ROUND(SUM(dv.precio_monotributista * dv.cantidad), 2) AS total_vendido,
  ROUND(SUM((dv.precio_monotributista - dv.costo) * dv.cantidad), 2) AS ganancia
FROM articulo a
LEFT JOIN sublinea sl ON a.subLinea_id = sl.id
INNER JOIN detalle_venta dv ON a.id = dv.articulo_id
INNER JOIN venta v ON dv.venta_id = v.id
WHERE a.linea_id = ? 
  AND a.estado = 1 
  AND sl.estado = 1
  AND v.estado = 1
  AND v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)
GROUP BY DATE(v.fecha_venta), a.id, a.codigo_producto, a.nombre, sl.nombre, a.mediciones
ORDER BY fecha ASC, nombre_completo ASC;
`,
  getVentasConGananciaFiltradas: `
SELECT 
  DATE(v.fecha_venta) AS fecha,
  SUM(dv.cantidad) AS cantidad_vendida,
  ROUND(SUM(dv.precio_monotributista * dv.cantidad), 2) AS total_vendido,
  ROUND(SUM((dv.precio_monotributista - dv.costo) * dv.cantidad), 2) AS ganancia,
  ROUND(AVG(dv.precio_monotributista), 2) AS precio_promedio,
  ROUND(AVG(dv.costo), 2) AS costo_promedio,
  ROUND(AVG(dv.precio_monotributista - dv.costo), 2) AS diferencia_promedio
FROM detalle_venta dv
INNER JOIN articulo a ON dv.articulo_id = a.id
INNER JOIN venta v ON dv.venta_id = v.id
INNER JOIN cliente c ON v.cliente_id = c.id
LEFT JOIN linea l ON a.linea_id = l.id
LEFT JOIN sublinea sl ON a.subLinea_id = sl.id
LEFT JOIN proveedor p ON a.proveedor_id = p.id
WHERE v.estado = 1
  AND c.estado = 1
  AND v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)
  AND (? IS NULL OR a.id = ?)
  AND (? IS NULL OR a.linea_id = ?)
  AND (? IS NULL OR a.subLinea_id = ?)
  AND (? IS NULL OR a.proveedor_id = ?)
GROUP BY DATE(v.fecha_venta)
ORDER BY fecha ASC;
`,
};
