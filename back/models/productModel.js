const db = require("../database");
const queriesProducts = require("../querys/queriesProducts");

const getAllProducts = async () => {
  try {
    const query = queriesProducts.getAllProducts;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addProduct = async (nombre, cantidad, marca_id, categoria_id, precio) => {
  try {
    const query = queriesProducts.addProduct;
    await db.query(query, [nombre, cantidad, marca_id, categoria_id, precio]);
  } catch (err) {
    throw err;
  }
};

const dropProduct = async (ID) => {
  try {
    const query = queriesProducts.dropProduct;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upProduct = async (ID) => {
  try {
    const query = queriesProducts.upProduct;
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
    const query = queriesProducts.updateProducts;
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
