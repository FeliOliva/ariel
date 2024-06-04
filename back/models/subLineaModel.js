const db = require("../database");
const queriesSubLinea = require("../querys/queriesSubLinea");

const getAllSubLinea = async () => {
  try {
    const [rows] = await db.query(queriesSubLinea.getAllSubLinea);
    return rows;
  } catch (error) {
    console.log(error);
  }
};
const addSubLinea = async (nombre, linea_id) => {
  try {
    const query = queriesSubLinea.addSubLinea;
    await db.query(query, [nombre, linea_id]);
  } catch (err) {
    throw err;
  }
};
const dropSubLinea = async (ID) => {
  try {
    const query = queriesSubLinea.dropSubLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upSubLinea = async (ID) => {
  try {
    const query = queriesSubLinea.upSubLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateSubLinea = async (nombre, linea_id, ID) => {
  try {
    const query = queriesSubLinea.updateSubLinea;
    await db.query(query, [nombre, linea_id, ID]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllSubLinea,
  addSubLinea,
  dropSubLinea,
  upSubLinea,
  updateSubLinea,
};
