module.exports = {
  getAllTipoCliente: `SELECT * FROM tipo_cliente;`,
  addTipoCliente: `INSERT INTO tipo_cliente (nombre) VALUES (?);`,
  dropTipoCliente: `UPDATE tipo_cliente SET estado = 0 WHERE ID = ?`,
  upTipoCliente: `UPDATE tipo_cliente SET estado = 1 WHERE ID = ?`,
  updateTipoCliente: `UPDATE tipo_cliente SET nombre = ?  WHERE ID = ?`,
  getTipoClienteByID: `SELECT * FROM tipo_cliente WHERE ID = ?;`,
};
