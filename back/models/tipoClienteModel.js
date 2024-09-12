const db = require("../database");
const queriesTipoCliente = require("../querys/queriesTipoCliente");

const getAllTipoCliente = async () => {
  try {
    const query = queriesTipoCliente.getAllTipoCliente;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addTipoCliente = async (nombre) => {
  try {
    const query = queriesTipoCliente.addTipoCliente;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const dropTipoCliente = async (ID) => {
  try {
    const query = queriesTipoCliente.dropTipoCliente;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upTipoCliente = async (ID) => {
  try {
    const query = queriesTipoCliente.upTipoCliente;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateTipoCliente = async (nombre, ID) => {
  try {
    const query = queriesTipoCliente.updateTipoCliente;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getTipoClienteByID = async (ID) => {
  try {
    const query = queriesTipoCliente.getTipoClienteByID;
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllTipoCliente,
  addTipoCliente,
  dropTipoCliente,
  upTipoCliente,
  updateTipoCliente,
  getTipoClienteByID,
};
