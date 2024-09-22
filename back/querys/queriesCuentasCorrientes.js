module.exports = {
  getAllCuentas: `SELECT 
    cc.id, 
    cc.cliente_id, 
    c.nombre AS nombre_cliente, 
    cc.saldo_total, 
    cc.fecha_ultima_actualizacion
FROM 
    cuenta_corriente cc
JOIN 
    cliente c ON cc.cliente_id = c.id;
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
};
