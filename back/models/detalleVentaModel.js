const db = require("../database");
const queriesDetalleVenta = require("../querys/queriesDetalleVentas");

const getDetalleVentaById = async (ID) => {
  try {
    const query = queriesDetalleVenta.getDetalleVentaById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateDetalleVenta = async (ID, producto_id) => {
  try {
    const query = queriesDetalleVenta.updateDetalleVenta;
    await db.query(query, [producto_id, ID]);
  } catch (err) {
    throw err;
  }
};
const getTotalVenta = async (ID) => {
  try {
    const query = queriesDetalleVenta.getTotalVenta;
    const rows = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
const updateTotalVenta = async (ID, total) => {
  try {
    const query = queriesDetalleVenta.updateTotalVenta;
    await db.query(query, [total, ID]);
  } catch (err) {
    throw err;
  }
};
const calcularTotalVenta = async (ID) => {
  try {
    const query = `
      SELECT total
      FROM venta 
      WHERE  = ?;
    `;
    const [rows] = await db.query(query, [ID]);
    return rows[0].total;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
  getTotalVenta,
  updateTotalVenta,
  calcularTotalVenta,
};
