module.exports = {
  getAllTipoCliente: `SELECT * FROM Tipo_Cliente;`,
  addTipoCliente: `INSERT INTO Tipo_Cliente (nombre) VALUES (?);`,
  dropTipoCliente: `UPDATE Tipo_Cliente SET estado = 0 WHERE ID = ?`,
  upTipoCliente: `UPDATE Tipo_Cliente SET estado = 1 WHERE ID = ?`,
  updateTipoCliente: `UPDATE Tipo_Cliente SET nombre = ?  WHERE ID = ?`,
  getTipoClienteByID: `SELECT * FROM Tipo_Cliente WHERE ID = ?;`,
};
