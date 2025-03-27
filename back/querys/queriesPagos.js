module.exports = {
  getAllPagos: `
    SELECT * 
    FROM pagos
    WHERE fecha_pago BETWEEN ? AND ?
  `,
  addPagos: `INSERT INTO pagos (nro_pago,cliente_id, monto, metodo_pago) VALUES (?, ?, ?, ?)`,
  getPagoById: `SELECT * FROM pagos WHERE ID = ?`,
  getPagosByClienteId: `
    SELECT * 
    FROM pagos 
    WHERE cliente_id = ? 
      AND fecha_pago BETWEEN ? AND ?
  `,
  updatePago: `UPDATE pagos SET monto = ?, fecha_pago = ? WHERE ID = ?`,
  getPagosByZona_id: `SELECT 
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    c.apellido AS cliente_apellido,
    c.farmacia AS cliente_farmacia,
    c.zona_id AS cliente_zona,
    SUM(p.monto) AS total_pagos
FROM 
    pagos p
JOIN 
    cliente c ON p.cliente_id = c.id
WHERE 
    c.zona_id = ?
    AND DATE(p.fecha_pago) BETWEEN DATE(?) AND DATE(?)
GROUP BY 
    c.id, c.nombre, c.apellido, c.zona_id
ORDER BY 
    total_pagos DESC;
`,
  upPago: "update pagos set estado = 1 where id = ?",
  dropPago: "update pagos set estado = 0 where id = ?",
};
