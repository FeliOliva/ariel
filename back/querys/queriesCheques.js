module.exports = {
  getAllCheques: `SELECT cheque.*, 
       CONCAT_WS(' - ', cliente.nombre, cliente.apellido, cliente.farmacia) AS nombre_cliente
FROM cheque
JOIN cliente ON cheque.cliente_id = cliente.id
ORDER BY cheque.id DESC;
`,
  addCheque: `
  INSERT INTO cheque (banco, nro_cheque, fecha_emision, fecha_cobro, importe, cliente_id, nro_pago) 
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
  dropCheque: "UPDATE cheque SET estado = 0 WHERE ID = ?;",
  upCheque: "UPDATE cheque SET estado = 1 WHERE ID = ?;",
  getChequeByID: "SELECT * FROM cheque WHERE ID = ?;",
  updateCheque: `
  UPDATE cheque SET banco = ?, nro_cheque = ?, fecha_emision = ?, fecha_cobro = ?, importe = ?
  WHERE id = ?;`,
  getChequeByCliente: "SELECT * FROM cheque WHERE cliente_id = ?;",
};
