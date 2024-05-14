module.exports = {
  getAllCategories: `SELECT Categoria.ID, 
  Categoria.nombre AS Categoria, 
  Subcategoria.nombre AS subcategoria, 
  Categoria.estado
FROM Categoria
INNER JOIN Subcategoria ON Categoria.subcategoria_id = Subcategoria.ID;
`,
  addCategory: `INSERT INTO Categoria (nombre, subcategoria_id) VALUES (?, ?);`,
  dropCategory: `UPDATE Categoria SET estado = 'inactivo' WHERE ID = ?;`,
  upCategory: `UPDATE Categoria SET estado = 'activo' WHERE ID = ?;`,
  updateCategories: `UPDATE Categoria SET nombre = ?, subcategoria_id = ? WHERE ID = ?;`,
};
