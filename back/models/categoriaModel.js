const db = require("../database");
const queriesCategories = require("../querys/queriesCategories");

const getAllCategories = async () => {
  try {
    const [rows] = await db.query(queriesCategories.getAllCategories);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addCategory = async (nombre, subcategoria_id) => {
  try {
    const query = queriesCategories.addCategory;
    await db.query(query, [nombre, subcategoria_id]);
  } catch (err) {
    throw err;
  }
};
const upCategory = async (ID) => {
  try {
    const query = queriesCategories.upCategory;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const dropCategory = async (ID) => {
  try {
    const query = queriesCategories.dropCategory;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateCategories = async (nombre, subcategoria_id, ID) => {
  try {
    const query = queriesCategories.updateCategories;
    await db.query(query, [nombre, subcategoria_id, ID]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  dropCategory,
  upCategory,
  updateCategories,
};
