module.exports = {
  getAllMetodos: `SELECT * FROM metodos_pago`,
  addMetodo: `INSERT INTO metodos_pago (metodo) VALUES (?)`,
  updateMetodo: `UPDATE metodos_pago SET metodo = ? WHERE ID = ?`,
};
