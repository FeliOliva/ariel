module.exports = {
  getAllClients: `SELECT * FROM cliente;`,
  addClient: `INSERT INTO cliente (nombre, apellido, direccion, email, telefono) VALUES (?, ?, ?, ?, ?);`,
};
