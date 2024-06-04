module.exports = {
  getAllLineas: `select * from linea;`,
  addLinea: `INSERT INTO linea (nombre) VALUES (?);`,
  dropLinea: `UPDATE linea SET estado = 0 WHERE ID = ?;`,
  upLinea: `UPDATE linea SET estado = 1 WHERE ID = ?;`,
  updateLinea: `UPDATE linea SET nombre = ? WHERE ID = ?;`,
};
