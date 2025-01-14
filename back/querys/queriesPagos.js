module.exports = {
  getAllPagos: `
    SELECT * 
    FROM pagos
    WHERE fecha_pago BETWEEN ? AND ?
  `,
  addPagos: `INSERT INTO pagos (nro_pago,cliente_id, monto, metodo_pago) VALUES (?, ?, ?, ?)`,
  getPagosByClienteId: `
    SELECT * 
    FROM pagos 
    WHERE cliente_id = ? 
      AND fecha_pago BETWEEN ? AND ?
  `,
  updatePago: `UPDATE pagos SET monto = ?, metodo_pago = ?, fecha_pago = NOW() WHERE ID = ?`
}