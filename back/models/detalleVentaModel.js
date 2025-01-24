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
const updateDetalleVenta = async (ID, new_precio_monotributista, cantidad, sub_total) => {
  try {
    const query = queriesDetalleVenta.updateDetalleVenta;
    await db.query(query, [new_precio_monotributista, cantidad, sub_total, ID]);
  } catch (err) {
    throw err;
  }
};
const getDetalleVenta = async (venta_id) => {
  try {
    const query = queriesDetalleVenta.getDetalleVenta;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getPorcentage = async (venta_id) => {
  try {
    const query = queriesDetalleVenta.getPorcentage;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateTotalesVenta = async (venta_id, total, totalConDescuento) => {
  try {
    const query = `
      UPDATE venta
      SET total = ?, total_con_descuento = ?
      WHERE id = ?;
    `;
    await db.query(query, [total, totalConDescuento, venta_id]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
  getDetalleVenta,
  getPorcentage,
  updateTotalesVenta,
};
