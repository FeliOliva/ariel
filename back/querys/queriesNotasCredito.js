module.exports = {
    getAllNotasCreditoByClienteId: `SELECT nc.*, 
       COALESCE(SUM(dnc.subTotal), 0) AS total
        FROM notasCredito nc
        LEFT JOIN detalleNotaCredito dnc ON nc.id = dnc.notaCredito_id
        WHERE nc.cliente_id = ?
        GROUP BY nc.id;`,
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
    AND nc.estado = 1  -- Solo notas de crédito activas
GROUP BY 
    nc.id, c.id
ORDER BY 
    total DESC;
    `,

}