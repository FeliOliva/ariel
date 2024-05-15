module.exports = {
  getAllZonas: `SELECT * FROM Zona;`,
  addZona: `INSERT INTO Zona (zona,descripcion) VALUES (?,?);`,
  dropZona: `UPDATE Zona SET estado = 'inactivo' WHERE ID = ?`,
  upZona: `UPDATE Zona SET estado = 'activo' WHERE ID = ?`,
  updateZona: `UPDATE Zona SET zona = ?,descripcion = ? WHERE ID = ?`,
};
