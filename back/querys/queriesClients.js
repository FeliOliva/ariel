module.exports = {
  getAllClients: `SELECT 
  cliente.id, 
  cliente.nombre, 
  cliente.apellido,
  cliente.direccion, 
  cliente.estado, 
  cliente.email, 
  cliente.cuil, 
  cliente.telefono, 
  zona.nombre AS zona_nombre,
  cliente.es_responsable_inscripto
FROM 
  cliente
JOIN 
  zona ON cliente.zona_id = zona.id
  ORDER BY cliente.id
`,
  addClient: `INSERT INTO cliente (nombre, apellido, direccion, email, telefono, cuil, zona_id, es_responsable_inscripto) VALUES (?, ?, ?, ?, ?, ?, ? ,?);`,
  dropClient: `UPDATE cliente SET estado = 0 WHERE ID = ?`,
  upClient: `UPDATE cliente SET estado = 1 WHERE ID = ?`,
  updateClients: `UPDATE cliente SET nombre = ?, apellido = ?, direccion = ?, email = ?, telefono = ?, cuil = ?, zona_id = ?, es_responsable_inscripto = ? WHERE ID = ?`,
  getClientsByID: `SELECT * FROM cliente WHERE ID = ?;`,
};
