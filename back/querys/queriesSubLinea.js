module.exports = {
  getAllSubLinea: `SELECT
  s.id,
  s.nombre,
  l.nombre AS linea_nombre,
  s.estado
  FROM sublinea s
  INNER JOIN linea l ON s.linea_id = l.id;`,
  addSubLinea: `INSERT INTO sublinea (nombre, linea_id) VALUES (?,?);`,
  addSubLineaByID: `INSERT INTO sublinea (nombre, linea_id) VALUES (?,?);`,
  getSublineaByID: `SELECT * FROM sublinea WHERE ID = ?;`,
  dropSubLinea: `UPDATE sublinea SET estado = 0 WHERE ID = ?`,
  upSubLinea: `UPDATE sublinea SET estado = 1 WHERE ID = ?`,
  updateSubLinea: `UPDATE sublinea SET nombre = ? WHERE ID = ?`,
  getSublineaByLinea: `SELECT id, nombre FROM linea WHERE id = (SELECT linea_id FROM sublinea WHERE id = ?);`,
};
