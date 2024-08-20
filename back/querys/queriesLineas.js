module.exports = {
  getAllLineas: `select * from linea;`,
  addLinea: `INSERT INTO linea (nombre) VALUES (?);`,
  dropLinea: `UPDATE linea SET estado = 0 WHERE ID = ?;`,
  upLinea: `UPDATE linea SET estado = 1 WHERE ID = ?;`,
  updateLinea: `UPDATE linea SET nombre = ? WHERE ID = ?;`,
  getSublineaByLinea: `SELECT id, nombre FROM subLinea WHERE linea_id = ?;`,
  getLastLinea: `SELECT * FROM linea ORDER BY createdAt DESC LIMIT 1;`,
};
