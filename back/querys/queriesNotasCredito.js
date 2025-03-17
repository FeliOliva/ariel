module.exports = {
    getAllNotasCreditoByClienteId: `
    SELECT 
    nc.id AS notaCredito_id,
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
FROM notasCredito nc
JOIN cliente c ON nc.cliente_id = c.id
JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
JOIN articulo a ON dnc.articulo_id = a.id
JOIN linea l ON a.linea_id = l.id
JOIN sublinea sl ON a.sublinea_id = sl.id
WHERE nc.cliente_id = ?;
`,
    addNotaCredito: "INSERT INTO notasCredito (cliente_id) VALUES (?)",
    addDetallesNotaCredito: "INSERT INTO detalleNotaCredito (notaCredito_id, articulo_id, cantidad, precio) VALUES (?, ?, ?, ?)",
    updateStock: `UPDATE articulo SET stock = stock + ? WHERE id = ?;`,
    dropNotaCredito: "UPDATE notasCredito SET estado = 0 WHERE id = ?",
    upNotaCredito: "UPDATE notasCredito SET estado = 1 WHERE id = ?",
    getNotasCreditoByZona: `SELECT 
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    c.apellido AS cliente_apellido,
    c.farmacia AS cliente_farmacia,
    c.zona_id AS cliente_zona,
    nc.id AS notaCredito_id,
    nc.nroNC,
    nc.fecha,
    COALESCE(SUM(dnc.subTotal), 0) AS total
FROM 
    notasCredito nc
JOIN 
    cliente c ON nc.cliente_id = c.id
LEFT JOIN 
    detalleNotaCredito dnc ON nc.id = dnc.notaCredito_id
WHERE 
    c.zona_id = ?
    AND nc.estado = 1 
GROUP BY 
    nc.id, c.id
ORDER BY 
    total DESC;
    `,

}