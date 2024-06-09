const db = require("../database");
const queriesArticulos = require("../querys/queriesArticulos");

const getAllArticulos = async () => {
  try {
    const query = queriesArticulos.getAllArticulos;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addArticulo = async (
  nombre,
  stock,
  codigo_producto,
  proveedor_id,
  precio_monotributista,
  costo,
  subLinea_id,
  linea_id
) => {
  try {
    const query = queriesArticulos.addArticulo;
    await db.query(query, [
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      linea_id,
    ]);
  } catch (err) {
    throw err;
  }
};

const dropArticulo = async (ID) => {
  try {
    const query = queriesArticulos.dropArticulo;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upArticulo = async (ID) => {
  try {
    const query = queriesArticulos.upArticulo;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateArticulo = async (
  nombre,
  stock,
  codigo_producto,
  proveedor_id,
  precio_monotributista,
  costo,
  subLinea_id,
  ID
) => {
  try {
    const query = queriesArticulos.updateArticulo;
    await db.query(query, [
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      ID,
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllArticulos,
  addArticulo,
  dropArticulo,
  upArticulo,
  updateArticulo,
};
