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
const addSubLineaByID = async (nombre, linea_id) => {
  try {
    const query = queriesSubLinea.addSubLineaByID;
    await db.query(query, [nombre, linea_id]);
  } catch (err) {
    throw err;
  }
};
const getSublineaByID = async (ID) => {
  try {
    const query = queriesSubLinea.getSublineaByID;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const dropSubLinea = async (subLinea_id, linea_id) => {
  try {
    const query = queriesSubLinea.dropSubLinea;
    await db.query(query, [subLinea_id, linea_id]);
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
const updateSubLinea = async (nombre, ID) => {
  try {
    const query = queriesSubLinea.updateSubLinea;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getLineaBySublinea = async (subLineaId) => {
  try {
    const query = queriesSubLinea.getSublineaByLinea;
    const [rows] = await db.query(query, [subLineaId]);
    return rows[0];
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
  getLineaBySublinea,
  addSubLineaByID,
  getSublineaByID,
};
