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
const updateDetalleVenta = async (
  ID,
  new_precio_monotributista,
  cantidad,
  sub_total,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesDetalleVenta.updateDetalleVenta;
    await conn.query(query, [new_precio_monotributista, cantidad, sub_total, ID]);
  } catch (err) {
    throw err;
  }
};

const getDetalleVenta = async (venta_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesDetalleVenta.getDetalleVenta;
    const [rows] = await conn.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getPorcentage = async (venta_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesDetalleVenta.getPorcentage;
    const [rows] = await conn.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateTotalesVenta = async (
  venta_id,
  total,
  totalConDescuento,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = `
      UPDATE venta
      SET total = ?, total_con_descuento = ?
      WHERE id = ?;
    `;
    await conn.query(query, [total, totalConDescuento, venta_id]);
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
