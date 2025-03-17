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

const addDetalleCompra = async (
  compra_id,
  articulo_id,
  cantidad,
  costo,
  precio_monotributista,
  sub_total
) => {
  try {
    const query = queriesCompras.addDetalleCompra;
    await db.query(query, [
      compra_id,
      articulo_id,
      cantidad,
      costo,
      precio_monotributista,
      sub_total,
    ]);
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
const updateTotalCompra = async (compra_id, total) => {
  try {
    const query = queriesCompras.updateTotalesCompra;
    await db.query(query, [total, compra_id]);
  } catch (err) {
    throw err;
  }
};
const updateDetalleCompra = async (
  ID,
  new_costo,
  new_precio_monotributista,
  cantidad,
  sub_total
) => {
  try {
    console.log(new_costo, new_precio_monotributista, sub_total, cantidad, ID);
    const query = queriesCompras.updateDetalleCompra;
    await db.query(query, [
      new_costo,
      new_precio_monotributista,
      cantidad,
      sub_total,
      ID,
    ]);
  } catch (err) {
    throw err;
  }
};
const updateCostoArticulo = async (
  articulo_id,
  new_costo,
  new_precio_monotributista
) => {
  try {
    const query = queriesCompras.updateCostoArticulo;
    await db.query(query, [new_costo, new_precio_monotributista, articulo_id]);
  } catch (err) {
    throw err;
  }
};
const getDetalleCompra = async (compra_id) => {
  try {
    const query = queriesCompras.getDetalleCompra;
    const [rows] = await db.query(query, [compra_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getDetalleCompraById = async (ID) => {
  try {
    const query = queriesCompras.getDetalleCompraById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const dropCompra = async (compra_id) => {
  try {
    const query = queriesCompras.dropCompra;
    await db.query(query, [compra_id]);
  } catch (err) {
    throw err;
  }
};
const upCompra = async (compra_id) => {
  try {
    const query = queriesCompras.upCompra;
    await db.query(query, [compra_id]);
  } catch (err) {
    throw err;
  }
};
const getLineasStock = async () => {
  try {
    const query = "select linea_id from lineas_stock"
    const [lineas] = await db.query(query)
    return lineas
  } catch (err) {
    throw err
  }
}
module.exports = {
  getAllCompras,
  addCompra,
  addDetalleCompra,
  updateStock,
  getComprasByProveedor,
  getCompraByID,
  updateTotalCompra,
  updateDetalleCompra,
  updateCostoArticulo,
  getDetalleCompra,
  getDetalleCompraById,
  dropCompra,
  upCompra,
  getLineasStock
};
