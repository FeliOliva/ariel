module.exports = {
  getAllSubLinea: `SELECT
  s.id AS subLinea_id,
  s.nombre AS subLinea_nombre,
  l.nombre AS linea_nombre,
  s.estado AS subLinea_estado
  FROM subLinea s
  INNER JOIN linea l ON s.linea_id = l.id;`,
  addSubLinea: `INSERT INTO subLinea (nombre, linea_id) VALUES (?,?);`,
  dropSubLinea: `UPDATE subLinea SET estado = 0 WHERE ID = ?`,
  upSubLinea: `UPDATE subLinea SET estado = 1 WHERE ID = ?`,
  updateSubLinea: `UPDATE subLinea SET nombre = ?, linea_id = ? WHERE ID = ?`,
};
