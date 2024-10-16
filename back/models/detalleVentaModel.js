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
const ajustarTotalConDescuento = async (id_venta, diferencia) => {
  try {
    const query = queriesDetalleVenta.ajustarTotalConDescuento;
    await db.query(query, [diferencia, id_venta]);
  } catch (err) {
    throw err;
  }
};





module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
  ajustarTotalConDescuento
};
