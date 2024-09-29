module.exports = {
  getAllGastos: "SELECT * FROM gasto;",
  addGasto: "INSERT INTO gasto (nombre, monto, fecha) VALUES (?, ?, NOW());",
  dropGasto: "UPDATE gasto SET estado = 0 WHERE ID = ?;",
  upGasto: "UPDATE gasto SET estado = 1 WHERE ID = ?;",
  updateGastos: "UPDATE gasto SET nombre = ?, monto = ? WHERE ID = ?;",
  getGastoByID: "SELECT * FROM gasto WHERE ID = ?;",
};
