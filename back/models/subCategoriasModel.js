const db = require("../database");
const queriesSubCategories = require("../querys/queriesSubCategories");

const getAllSubCategories = async () => {
  try {
    const [rows] = await db.query(queriesSubCategories.getAllSubCategories);
    return rows;
  } catch (error) {
    console.log(error);
  }
};
const addSubCategory = async (nombre) => {
  try {
    const query = queriesSubCategories.addSubCategory;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const dropSubCategory = async (ID) => {
  try {
    const query = queriesSubCategories.dropSubCategory;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upSubCategory = async (ID) => {
  try {
    const query = queriesSubCategories.upSubCategory;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateSubCategories = async (nombre, ID) => {
  try {
    const query = queriesSubCategories.updateSubCategories;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllSubCategories,
  addSubCategory,
  dropSubCategory,
  upSubCategory,
  updateSubCategories,
};
