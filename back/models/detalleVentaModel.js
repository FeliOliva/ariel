const db = require("../database");
const queriesDetalleVenta = require("../querys/queriesDetalleVentas");

const getAllDetalleVentas = async () => {
  try {
    const query = queriesDetalleVenta.getAllDetalleVentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addDetalleVenta = async (venta_id, producto_id, cantidad, precio) => {
  try {
    const query = queriesDetalleVenta.addDetalleVenta;
    await db.query(query, [venta_id, producto_id, cantidad, precio]);
  } catch (err) {
    throw err;
  }
};

const deleteDetalleVenta = async (ID) => {
  try {
    const query = queriesDetalleVenta.deleteDetalleVenta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const updateDetalleVenta = async (
  ID,
  venta_id,
  producto_id,
  cantidad,
  precio
) => {
  try {
    const query = queriesDetalleVenta.updateDetalleVenta;
    await db.query(query, [venta_id, producto_id, cantidad, precio, ID]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllDetalleVentas,
  addDetalleVenta,
  deleteDetalleVenta,
  updateDetalleVenta,
};
