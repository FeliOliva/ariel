module.exports = {
  getAllSubLinea: `SELECT
  s.id,
  s.nombre,
  l.nombre AS linea_nombre,
  s.estado
  FROM subLinea s
  INNER JOIN linea l ON s.linea_id = l.id;`,
  addSubLinea: `INSERT INTO subLinea (nombre, linea_id) VALUES (?,?);`,
  addSubLineaByID: `INSERT INTO subLinea (nombre, linea_id) VALUES (?,?);`,
  getSublineaByID: `SELECT * FROM subLinea WHERE ID = ?;`,
  dropSubLinea: `UPDATE sublinea SET estado = 0 WHERE ID = ?`,
  upSubLinea: `UPDATE subLinea SET estado = 1 WHERE ID = ?`,
  updateSubLinea: `UPDATE subLinea SET nombre = ? WHERE ID = ?`,
  getSublineaByLinea: `SELECT id, nombre FROM linea WHERE id = (SELECT linea_id FROM subLinea WHERE id = ?);`,
};
