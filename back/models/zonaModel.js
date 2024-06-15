const db = require("../database");
const queriesZonas = require("../querys/queriesZonas");

const getAllZonas = async () => {
  try {
    const query = queriesZonas.getAllZonas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addZona = async (nombre) => {
  try {
    const query = queriesZonas.addZona;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const dropZona = async (ID) => {
  try {
    const query = queriesZonas.dropZona;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upZona = async (ID) => {
  try {
    const query = queriesZonas.upZona;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateZona = async (nombre, ID) => {
  try {
    const query = queriesZonas.updateZona;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getZonaByID = async (ID) => {
  try {
    const query = queriesZonas.getZonaByID;
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllZonas,
  addZona,
  dropZona,
  upZona,
  updateZona,
  getZonaByID,
};
