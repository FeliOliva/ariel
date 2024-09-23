module.exports = {
  getAllGastos: "SELECT * FROM gastos;",
  addGasto: "INSERT INTO gastos (nombre, monto, fecha) VALUES (?, ?, NOW());",
  dropGasto: "UPDATE gastos SET estado = 0 WHERE ID = ?;",
  upGasto: "UPDATE gastos SET estado = 1 WHERE ID = ?;",
  updateGastos: "UPDATE gastos SET nombre = ?, monto = ? WHERE ID = ?;",
  getGastoByID: "SELECT * FROM gastos WHERE ID = ?;",
};
