module.exports = {
  getAllMarcas: `SELECT * FROM Marca;`,
  addMarca: `INSERT INTO Marca (nombre,descripcion) VALUES (?, ?);`,
  dropMarca: `UPDATE Marca SET estado = 'inactivo' WHERE ID = ?`,
  upMarca: `UPDATE Marca SET estado = 'activo' WHERE ID = ?`,
  updateMarca: `UPDATE Marca SET nombre = ?, descripcion = ? WHERE ID = ?`,
};
