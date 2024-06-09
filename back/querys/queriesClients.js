module.exports = {
  getAllClients: `SELECT * FROM cliente;`,
  addClient: `INSERT INTO cliente (nombre, apellido, direccion, email, telefono) VALUES (?, ?, ?, ?, ?);`,
  dropClient: `UPDATE cliente SET estado = 'inactivo' WHERE ID = ?`,
  upClient: `UPDATE cliente SET estado = 'activo' WHERE ID = ?`,
  updateClients: `UPDATE cliente SET nombre = ?, apellido = ?, direccion = ?, email = ?, telefono = ? WHERE ID = ?`,
  getClientsByID: `SELECT * FROM cliente WHERE ID = ?;`,
};
