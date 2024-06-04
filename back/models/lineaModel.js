const db = require("../database");
const queriesLineas = require("../querys/queriesLineas");

const getAllLineas = async () => {
  try {
    const [rows] = await db.query(queriesLineas.getAllLineas);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addLinea = async (nombre) => {
  try {
    const query = queriesLineas.addLinea;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const dropLinea = async (ID) => {
  try {
    const query = queriesLineas.dropLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upLinea = async (ID) => {
  try {
    const query = queriesLineas.upLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateLinea = async (nombre, ID) => {
  try {
    const query = queriesLineas.updateLinea;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllLineas,
  addLinea,
  dropLinea,
  upLinea,
  updateLinea,
};
