const db = require("../database");
const queriesProducts = require("../querys/queriesProducts");
const queries = require("../querys/queriesProducts");

const getAllProducts = async () => {
  try {
    const [rows] = await db.query(queriesProducts.getAllProducts);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addProduct = async (nombre, cantidad, marca_id, categoria_id, precio) => {
  try {
    const query = queries.addProduct;
    await db.query(query, [nombre, cantidad, marca_id, categoria_id, precio]);
  } catch (err) {
    throw err;
  }
};

const dropProduct = async (ID) => {
  try {
    const query = queries.dropProduct;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upProduct = async (ID) => {
  try {
    const query = queries.upProduct;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateProducts = async (
  nombre,
  cantidad,
  marca_id,
  categoria_id,
  precio,
  ID
) => {
  try {
    const query = queries.updateProducts;
    await db.query(query, [
      nombre,
      cantidad,
      marca_id,
      categoria_id,
      precio,
      ID,
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  dropProduct,
  upProduct,
  updateProducts,
};
