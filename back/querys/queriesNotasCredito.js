module.exports = {
  getAllNotascreditoByClienteId: `
    SELECT 
    nc.id AS notacredito_id,
    nc.nroNC,
    c.nombre AS cliente_nombre,
    c.apellido AS cliente_apellido, 
    c.farmacia AS cliente_farmacia,   
    nc.fecha AS notaCredito_fecha,
    nc.estado,
    SUM(dnc.subTotal) OVER(PARTITION BY nc.id) AS totalNC, -- Total de la nota de crédito
    dnc.id AS detalle_id,
    a.id AS articulo_id,
    a.nombre AS articulo_nombre,
    a.codigo_producto AS cod_articulo,
    l.nombre AS nombre_linea,
    sl.nombre AS nombre_sublinea,
    dnc.cantidad,
    dnc.fecha AS detalle_fecha,
    dnc.precio,
    dnc.subTotal
FROM notascredito nc
JOIN cliente c ON nc.cliente_id = c.id
JOIN detallenotacredito dnc ON nc.id = dnc.notacredito_id
JOIN articulo a ON dnc.articulo_id = a.id
JOIN linea l ON a.linea_id = l.id
JOIN sublinea sl ON a.sublinea_id = sl.id
WHERE nc.cliente_id = ?;
`,
  addNotaCredito: "INSERT INTO notascredito (cliente_id) VALUES (?)",
  getDetallesNotaCredito: `SELECT 
    dnc.id, 
    dnc.notacredito_id, 
    dnc.articulo_id, 
    a.nombre AS articulo_nombre,
    a.codigo_producto,
    a.precio_monotributista,
    a.linea_id,
    l.nombre AS linea_nombre,
    a.mediciones,
    dnc.cantidad, 
    dnc.fecha, 
    dnc.precio, 
    dnc.subTotal
FROM detallenotacredito dnc
JOIN articulo a ON dnc.articulo_id = a.id
JOIN linea l ON a.linea_id = l.id
WHERE dnc.notacredito_id = ?;`,
  addDetallesNotaCredito:
    "INSERT INTO detallenotacredito (notacredito_id, articulo_id, cantidad, precio) VALUES (?, ?, ?, ?)",
  updateStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
  dropNotaCredito: "DELETE FROM notascredito WHERE id = ?",
  dropDetallesNotaCredito:
    "DELETE FROM detallenotacredito WHERE notacredito_id = ?",
  getNotascreditoByZona: `SELECT 
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    c.apellido AS cliente_apellido,
    c.farmacia AS cliente_farmacia,
    c.zona_id AS cliente_zona,
    nc.id AS notacredito_id,
    nc.nroNC,
    nc.fecha,
    COALESCE(SUM(dnc.subTotal), 0) AS total
FROM 
    notascredito nc
JOIN 
    cliente c ON nc.cliente_id = c.id
LEFT JOIN 
    detallenotacredito dnc ON nc.id = dnc.notacredito_id
WHERE 
    c.zona_id = ?
    AND nc.estado = 1 
GROUP BY 
    nc.id, c.id
ORDER BY 
    total DESC;
    `,
  updateNotaCredito: `UPDATE notascredito SET fecha = ? WHERE id = ?`,
  getNotaCreditoById: `SELECT * FROM notascredito WHERE id = ?`,
};
