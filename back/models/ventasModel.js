const db = require("../database");
const queriesVentas = require("../querys/queriesVentas");

const getAllVentas = async () => {
  try {
    const query = queriesVentas.getAllVentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addVenta = async (producto_id, cantidad, cliente_id, zona_id) => {
  try {
    const query = queriesVentas.addVenta;
    await db.query(query, [producto_id, cantidad, cliente_id, zona_id]);
  } catch (err) {
    throw err;
  }
};
const dropVenta = async (ID) => {
  try {
    const query = queriesVentas.dropVenta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upVenta = async (ID) => {
  try {
    const query = queriesVentas.upVenta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateVentas = async (producto_id, cantidad, cliente_id, zona_id, ID) => {
  try {
    const query = queriesVentas.updateVentas;
    await db.query(query, [producto_id, cantidad, cliente_id, zona_id, ID]);
  } catch (err) {
    throw err;
  }
};
const getVentasByClientes = async (cliente_id) => {
  try {
    const query = queriesVentas.getVentasByClientes;
    const [rows] = await db.query(query, [cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllVentas,
  addVenta,
  dropVenta,
  upVenta,
  updateVentas,
  getVentasByClientes,
};
