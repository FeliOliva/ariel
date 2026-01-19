const db = require("../database");

const getAllVendedores = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM vendedores");
    return rows;
  } catch (error) {
    throw error;
  }
};
const addVendedor = async (nombre) => {
  try {
    const query = "INSERT INTO vendedores (nombre) VALUES (?)";
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const getVendedorByID = async (ID) => {
  try {
    const query = "SELECT * FROM vendedores WHERE ID = ?";
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
const dropVendedor = async (ID) => {
  try {
    const query = "DROP FROM vendedores WHERE ID = ?";
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateVendedor = async (nombre, ID) => {
  try {
    const query = "UPDATE vendedores SET nombre = ? WHERE ID = ?";
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getPagosPorVendedor = async (vendedor_id, fecha_inicio, fecha_fin) => {
  try {
    const query = `
      SELECT 
          p.id AS pago_id,
          p.fecha_pago,
          p.monto,
          p.metodo_pago,
          c.nombre AS cliente_nombre,
          c.apellido AS cliente_apellido,
          c.farmacia AS cliente_farmacia,
          v.nombre AS vendedor_nombre
      FROM pagos p
      JOIN cliente c ON p.cliente_id = c.id
      LEFT JOIN vendedores v ON p.vendedor_id = v.id
      WHERE p.vendedor_id = ?
        AND p.fecha_pago >= ? AND p.fecha_pago < DATE_ADD(?, INTERVAL 1 DAY)

      UNION ALL

      SELECT 
          NULL AS pago_id,
          NULL AS fecha_pago,
          SUM(p.monto) AS monto,
          NULL AS metodo_pago,
          NULL AS cliente_nombre,
          NULL AS cliente_apellido,
          'TOTAL' AS cliente_farmacia,
          NULL AS vendedor_nombre
      FROM pagos p
      WHERE p.vendedor_id = ?
        AND p.fecha_pago >= ? AND p.fecha_pago < DATE_ADD(?, INTERVAL 1 DAY)
      ORDER BY fecha_pago IS NULL, fecha_pago;
    `;

    const [rows] = await db.query(query, [
      vendedor_id,
      fecha_inicio,
      fecha_fin,
      vendedor_id,
      fecha_inicio,
      fecha_fin,
    ]);

    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllVendedores,
  addVendedor,
  getVendedorByID,
  dropVendedor,
  updateVendedor,
  getPagosPorVendedor,
};
