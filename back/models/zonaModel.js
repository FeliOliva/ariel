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
const addZona = async (zona, descripcion) => {
  try {
    const descripcionValue = descripcion ?? "";
    const query = queriesZonas.addZona;
    await db.query(query, [zona, descripcionValue]);
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
const updateZona = async (zona, descripcion, ID) => {
  try {
    const descripcionValue = descripcion ?? "";
    const query = queriesZonas.updateZona;
    await db.query(query, [zona, descripcionValue, ID]);
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
};
