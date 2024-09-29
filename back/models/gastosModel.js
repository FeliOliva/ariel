const db = require("../database");
const queriesGastos = require("../querys/queriesGastos");

const getAllGastos = async () => {
  try {
    const query = queriesGastos.getAllGastos;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addGasto = async (nombre, monto) => {
  try {
    const query = queriesGastos.addGasto;
    const [rows] = await db.query(query, [nombre, monto]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const dropGasto = async (ID) => {
  try {
    const query = queriesGastos.dropGasto;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const upGasto = async (ID) => {
  try {
    const query = queriesGastos.upGasto;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateGastos = async (nombre, monto, ID) => {
  try {
    const query = queriesGastos.updateGastos;
    const [rows] = await db.query(query, [nombre, monto, ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getGastoByID = async (ID) => {
  try {
    const query = queriesGastos.getGastoByID;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllGastos,
  addGasto,
  dropGasto,
  upGasto,
  updateGastos,
  getGastoByID,
};
