module.exports = {
  getAllProveedores: `SELECT * FROM proveedor ORDER BY id DESC;`,
  addProveedor: `INSERT INTO proveedor (nombre) VALUES (?);`,
  dropProveedor: `UPDATE proveedor SET estado = 0 WHERE ID = ?`,
  upProveedor: `UPDATE proveedor SET estado = 1 WHERE ID = ?`,
  updateProveedor: `UPDATE proveedor SET nombre = ? WHERE ID = ?`,
  getProveedorByID: `SELECT * FROM proveedor WHERE ID = ?;`,
};
