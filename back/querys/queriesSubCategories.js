module.exports = {
  getAllSubCategories: `SELECT * FROM Subcategoria;`,
  addSubCategory: `INSERT INTO Subcategoria (nombre) VALUES (?);`,
  dropSubCategory: `UPDATE Subcategoria SET estado = 'inactivo' WHERE ID = ?`,
  upSubCategory: `UPDATE Subcategoria SET estado = 'activo' WHERE ID = ?`,
  updateSubCategories: `UPDATE Subcategoria SET nombre = ? WHERE ID = ?`,
};
