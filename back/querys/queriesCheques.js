module.exports = {
  getAllCheques: "SELECT * FROM cheque ORDER BY id DESC;",
  addCheque: `
  INSERT INTO cheque (banco, nro_cheque, fecha_emision, fecha_cobro, importe) 
  VALUES (?, ?, ?, ?, ?);
`,
  dropCheque: "UPDATE cheque SET estado = 0 WHERE ID = ?;",
  upCheque: "UPDATE cheque SET estado = 1 WHERE ID = ?;",
  getChequeByID: "SELECT * FROM cheque WHERE ID = ?;",
};
