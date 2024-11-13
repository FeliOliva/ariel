module.exports = {
  // Consulta para obtener el historial de pago solo por `venta_id`
  findByVentaID: `
      SELECT lp.*, c.nombre, c.apellido, mp.metodo, v.nroVenta, ch.nro_cheque
      FROM log_pago AS lp
      JOIN cliente AS c ON lp.cliente_id = c.id
      JOIN metodos_pago AS mp ON lp.metodo_pago_id = mp.id
      JOIN venta AS v ON lp.venta_id = v.id
      LEFT JOIN cheque AS ch ON lp.cheque_id = ch.id
      WHERE lp.venta_id = ?;
    `,
  // Consulta para obtener el historial de pago por `venta_id` y `cliente_id`
  findByVentaAndCliente: `
      SELECT * FROM log_pago 
      WHERE venta_id = ? AND cliente_id = ?;
    `,
};
