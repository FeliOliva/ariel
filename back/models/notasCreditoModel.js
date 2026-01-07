const db = require("../database");
const queriesNotasCredito = require("../querys/queriesNotasCredito");

const getAllNotasCreditoByClienteId = async (cliente_id) => {
  try {
    const query = queriesNotasCredito.getAllNotasCreditoByClienteId;
    const [rows] = await db.query(query, [cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addNotaCredito = async (cliente_id) => {
  try {
    const query = queriesNotasCredito.addNotaCredito;
    const [result] = await db.query(query, [cliente_id]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

const getDetallesNotaCredito = async (ID) => {
  try {
    const query = queriesNotasCredito.getDetallesNotaCredito;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addDetallesNotaCredito = async (
  notaCreditoId,
  articulo_id,
  cantidad,
  precio
) => {
  try {
    const query = queriesNotasCredito.addDetallesNotaCredito;
    await db.query(query, [notaCreditoId, articulo_id, cantidad, precio]);
  } catch (err) {
    throw err;
  }
};
const updateStock = async (articulo_id, cantidad) => {
  try {
    const query = queriesNotasCredito.updateStock;
    await db.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
  } catch (err) {
    throw err;
  }
};
const dropNotaCredito = async (ID) => {
  try {
    const query = queriesNotasCredito.dropDetallesNotaCredito;
    const query2 = queriesNotasCredito.dropNotaCredito;
    await db.query(query, [ID]);
    await db.query(query2, [ID]);
  } catch (err) {
    throw err;
  }
};
const getNotasCreditoByZona = async (zona_id, fecha_inicio, fecha_fin) => {
  try {
    const query = queriesNotasCredito.getNotasCreditoByZona;
    const [rows] = await db.query(query, [zona_id, fecha_inicio, fecha_fin]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateNotaCredito = async (fecha, ID) => {
  try {
    const query = queriesNotasCredito.updateNotaCredito;
    const [day, month, year] = fecha.split("/");
    const formattedFechaNC = `${year}-${month}-${day} 00:00:00`;
    await db.query(query, [formattedFechaNC, ID]);
  } catch (err) {
    throw err;
  }
}
const getNotaCreditoById = async (ID) => {
  try {
    const query = queriesNotasCredito.getNotaCreditoById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getAllNotasCreditoByClienteId,
  addNotaCredito,
  addDetallesNotaCredito,
  updateStock,
  dropNotaCredito,
  getNotasCreditoByZona,
  getDetallesNotaCredito,
  updateNotaCredito,
  getNotaCreditoById,
};
