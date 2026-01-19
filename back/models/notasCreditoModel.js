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
const addNotaCredito = async (cliente_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesNotasCredito.addNotaCredito;
    const [result] = await conn.query(query, [cliente_id]);
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
  precio,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesNotasCredito.addDetallesNotaCredito;
    await conn.query(query, [notaCreditoId, articulo_id, cantidad, precio]);
  } catch (err) {
    throw err;
  }
};
const addDetallesNotaCreditoBatch = async (rows, connection = null) => {
  if (!rows || rows.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const query =
      "INSERT INTO detallenotacredito (notacredito_id, articulo_id, cantidad, precio) VALUES ?";
    await conn.query(query, [rows]);
  } catch (err) {
    throw err;
  }
};
const updateStock = async (articulo_id, cantidad, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesNotasCredito.updateStock;
    await conn.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
  } catch (err) {
    throw err;
  }
};
const updateStockBatch = async (updates, connection = null) => {
  if (!updates || updates.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const cases = updates.map(() => "WHEN ? THEN ?").join(" ");
    const ids = updates.map((u) => u.articulo_id);
    const params = [];
    updates.forEach((u) => {
      params.push(u.articulo_id, u.cantidad);
    });
    params.push(...ids);
    const query = `UPDATE articulo SET stock = stock + CASE id ${cases} ELSE 0 END WHERE id IN (${ids
      .map(() => "?")
      .join(",")})`;
    await conn.query(query, params);
  } catch (err) {
    throw err;
  }
};
const dropNotaCredito = async (ID, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesNotasCredito.dropDetallesNotaCredito;
    const query2 = queriesNotasCredito.dropNotaCredito;
    await conn.query(query, [ID]);
    await conn.query(query2, [ID]);
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
  addDetallesNotaCreditoBatch,
  updateStock,
  updateStockBatch,
  dropNotaCredito,
  getNotasCreditoByZona,
  getDetallesNotaCredito,
  updateNotaCredito,
  getNotaCreditoById,
};
