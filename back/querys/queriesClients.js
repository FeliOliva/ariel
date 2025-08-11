module.exports = {
  getAllClients: `SELECT 
  cliente.id, 
  cliente.nombre, 
  cliente.apellido,
  cliente.direccion, 
  cliente.estado, 
  cliente.email, 
  cliente.cuil, 
  cliente.zona_id,
  cliente.telefono, 
  cliente.localidad,
  cliente.instagram,
  cliente.farmacia,
  zona.nombre AS zona_nombre,
  tipo_cliente.id AS tipo_cliente_id,
  tipo_cliente.nombre_tipo AS nombre_tipo_cliente
FROM 
  cliente 
JOIN 
  zona ON cliente.zona_id = zona.id
JOIN
  tipo_cliente ON cliente.tipo_cliente = tipo_cliente.id
ORDER BY 
  cliente.id DESC;
`,
  addClient: `INSERT INTO cliente (farmacia, nombre, apellido, direccion, email, telefono, cuil, zona_id, tipo_cliente, localidad, instagram ) VALUES (?, ?, ?, ?, ?, ?, ?, ? ,?,?,?);`,
  dropClient: `UPDATE cliente SET estado = 0 WHERE ID = ?`,
  upClient: `UPDATE cliente SET estado = 1 WHERE ID = ?`,
  updateClients: `UPDATE cliente SET farmacia = ?, nombre = ?, apellido = ?, direccion = ?, email = ?, telefono = ?, cuil = ?, zona_id = ?, tipo_cliente = ?, localidad = ?, instagram = ? WHERE ID = ?`,
  getClientsByID: `SELECT 
  C.*, 
  Z.nombre AS nombreZona, 
  T.nombre_tipo AS nombre_tipo
FROM 
  cliente C 
LEFT JOIN 
  zona Z ON Z.id = C.zona_id 
LEFT JOIN 
  tipo_cliente T ON T.id = C.tipo_cliente 
WHERE 
  C.ID = ?;
`,
  getClientesByZona: `SELECT 
  cliente.id,
  cliente.nombre,
  cliente.apellido,
  cliente.direccion,
  cliente.estado,
  cliente.email,
  cliente.cuil,
  cliente.zona_id,
  cliente.telefono,
  cliente.localidad,
  cliente.instagram,
  cliente.farmacia,
  zona.nombre AS zona_nombre,
  tipo_cliente.id AS tipo_cliente_id,
  tipo_cliente.nombre_tipo AS nombre_tipo_cliente
FROM 
  cliente
JOIN 
  zona ON cliente.zona_id = zona.id
JOIN
  tipo_cliente ON cliente.tipo_cliente = tipo_cliente.id
WHERE 
  cliente.zona_id = ?
ORDER BY 
  cliente.id DESC;
`,
};
