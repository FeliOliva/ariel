const db = require("../database");
const queriesCompras = require("../querys/queriesCompras");

const getAllCompras = async () => {
  try {
    const query = queriesCompras.getAllCompras;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addCompra = async (proveedor_id, nro_compra, total) => {
  try {
    const query = queriesCompras.addCompra;
    const [result] = await db.query(query, [proveedor_id, nro_compra, total]);
    return result.insertId; // Devuelve el ID de la compra recién insertada
  } catch (err) {
    throw err;
  }
};

const addDetalleCompra = async (compra_id, articulo_id, cantidad, costo) => {
  try {
    const query = queriesCompras.addDetalleCompra;
    await db.query(query, [compra_id, articulo_id, cantidad, costo]);
  } catch (err) {
    throw err;
  }
};
const updateStock = async (articulo_id, cantidad) => {
  try {
    const query = queriesCompras.updateStock;
    await db.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
  } catch (err) {
    throw err;
  }
};

const getComprasByProveedor = async (proveedor_id) => {
  try {
    const query = queriesCompras.getComprasByProveedor;
    const [rows] = await db.query(query, [proveedor_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getCompraByID = async (compra_id) => {
  try {
    const query = queriesCompras.getCompraByID;
    const [rows] = await db.query(query, [compra_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllCompras,
  addCompra,
  addDetalleCompra,
  updateStock,
  getComprasByProveedor,
  getCompraByID,
};
