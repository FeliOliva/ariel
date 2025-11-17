module.exports = {
  getAllZonas: `SELECT 
z.id,
z.nombre as nombreZona,
z.estado
 FROM zona z
ORDER BY z.id DESC;
;`,
  addZona: `INSERT INTO zona (nombre) VALUES (?);`,
  dropZona: `UPDATE zona SET estado = 0 WHERE ID = ?`,
  upZona: `UPDATE zona SET estado = 1 WHERE ID = ?`,
  updateZona: `UPDATE zona SET nombre = ?  WHERE ID = ?`,
  getZonaByID: `SELECT * FROM zona WHERE ID = ?;`,
};
