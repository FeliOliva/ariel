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
const addVenta = async (cliente_id, nroVenta, zona_id, pago) => {
  try {
    const query = queriesVentas.addVenta;
    const [result] = await db.query(query, [
      cliente_id,
      nroVenta,
      zona_id,
      pago,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

const addDetalleVenta = async (
  venta_id,
  articulo_id,
  costo,
  cantidad,
  precio_monotributista
) => {
  try {
    const query = queriesVentas.addDetalleVenta;
    await db.query(query, [
      venta_id,
      articulo_id,
      costo,
      cantidad,
      precio_monotributista,
    ]);
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
const getVentasByZona = async (zona_id) => {
  try {
    const query = queriesVentas.getVentasByZona;
    const [rows] = await db.query(query, [zona_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getVentasByProducto = async (producto_id) => {
  try {
    const query = queriesVentas.getVentasByProducto;
    const [rows] = await db.query(query, [producto_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getVentaByID = async (venta_id) => {
  try {
    const query = queriesVentas.getVentaByID;
    const [rows] = await db.query(query, [venta_id]);
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
  getVentasByZona,
  getVentasByProducto,
  addDetalleVenta,
  getVentaByID,
};
