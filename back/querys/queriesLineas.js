module.exports = {
  getAllLineas: `select * from linea;`,
  addLinea: `INSERT INTO linea (nombre) VALUES (?);`,
  dropLinea: `UPDATE linea SET estado = 0 WHERE ID = ?;`,
  upLinea: `UPDATE linea SET estado = 1 WHERE ID = ?;`,
  updateLinea: `UPDATE linea SET nombre = ? WHERE ID = ?;`,
  getSublineaByLinea: `SELECT 
    subLinea.id, 
    subLinea.nombre, 
    subLinea.estado,  
    linea.nombre AS nombre_linea 
FROM 
    subLinea
JOIN 
    linea ON subLinea.linea_id = linea.id
WHERE 
    subLinea.linea_id = ?;
`,
  getLastLinea: `SELECT * FROM linea ORDER BY createdAt DESC LIMIT 1;`,
  getLineaByID: `SELECT * FROM linea WHERE ID = ?;`,
};
