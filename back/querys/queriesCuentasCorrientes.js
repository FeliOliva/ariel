module.exports = {
  getAllCuentasCorrientesByCliente: `SELECT 
    cc.id, 
    cc.cliente_id, 
    c.nombre AS nombre_cliente, 
    cc.saldo_total, 
    cc.fecha_ultima_actualizacion,
    cc.venta_id,
    cc.estado
FROM 
    cuenta_corriente cc
JOIN 
    cliente c ON cc.cliente_id = c.id
    WHERE c.id = ?
ORDER BY 
    cc.id DESC;
`,
  getCuentaByID: `SELECT 
    cc.id, 
    cc.cliente_id, 
    c.nombre AS nombre_cliente, 
    cc.saldo_total, 
    cc.fecha_ultima_actualizacion
FROM 
    cuenta_corriente cc
JOIN 
    cliente c ON cc.cliente_id = c.id
WHERE c.id = ?;
`,
  payByCuentaCorriente: `UPDATE cuenta_corriente SET saldo_total = saldo_total - ? WHERE id = ?;`,
  payCuentaByTotal: `UPDATE pagos_cuenta_corriente SET monto_total = monto_total - ? WHERE cliente_id = ?;`,
  getTotalCuentaCorriente: `SELECT saldo_total FROM cuenta_corriente WHERE id = ?;`,
  getTotalPagoCuentCorriente: `SELECT monto_total FROM pagos_cuenta_corriente WHERE cliente_id = ?;`,
  getCuentasByClienteOrdenadas: `
    SELECT id, saldo_total, venta_id 
    FROM cuenta_corriente 
    WHERE cliente_id = ? 
    ORDER BY saldo_total ASC;
  `,
  actualizarSaldoCuentaCorriente: `
    UPDATE cuenta_corriente 
    SET saldo_total = ? 
    WHERE id = ?;
  `,
  actualizarMontoTotalPagos: `
    UPDATE pagos_cuenta_corriente 
    SET monto_total = monto_total - ? 
    WHERE cliente_id = ?;
  `,
  actualizarPagoEnVenta: `
    UPDATE venta 
    SET pago = ? 
    WHERE id = ?;
  `,
  getVentaId: `
    SELECT venta_id
    FROM cuenta_corriente 
    WHERE id = ?;
  `,
  setEstadoCuentaCorriente: `
    UPDATE cuenta_corriente 
    SET estado = 0
    WHERE id = ?;
  `,
  actualizarMetodoPago: `
    UPDATE venta 
    SET metodo_pago_id = ? 
    WHERE id = ?;
  `,
  updateLogPago: `
    INSERT INTO log_pago(cliente_id, cuenta_corriente_id, venta_id, monto, metodo_pago_id, total_restante, cheque_id, estado_pago) VALUES (?, ?, ?, ?, ?, ?, ?,?);
  `,
};
