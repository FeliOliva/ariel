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
const ajustarTotalConDescuento = async (id_venta, totalConDescuento) => {
  try {
    const query = queriesDetalleVenta.ajustarTotalConDescuento;
    await db.query(query, [totalConDescuento, id_venta]);
  } catch (err) {
    throw err;
  }
};
const getVenta = async (id_venta) => {
  try {
    const query = queriesDetalleVenta.getVenta;
    const [rows] = await db.query(query, [id_venta]);
    return rows;
  } catch (err) {
    throw err;
  }
}
const updateTotales = async (id_venta, newTotal, newTotalConDescuento) => {
  try {
    const query = queriesDetalleVenta.updateTotales;
    await db.query(query, [newTotal, newTotalConDescuento, id_venta]);
  } catch (err) {
    throw err;
  }
}



module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
  ajustarTotalConDescuento,
  getVenta,
  updateTotales
};
