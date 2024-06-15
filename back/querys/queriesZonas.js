module.exports = {
  getAllZonas: `SELECT * FROM Zona;`,
  addZona: `INSERT INTO Zona (nombre) VALUES (?);`,
  dropZona: `UPDATE Zona SET estado = 0 WHERE ID = ?`,
  upZona: `UPDATE Zona SET estado = 1 WHERE ID = ?`,
  updateZona: `UPDATE Zona SET nombre = ?  WHERE ID = ?`,
  getZonaByID: `SELECT * FROM Zona WHERE ID = ?;`,
};
