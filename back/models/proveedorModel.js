const db = require("../database");
const queriesProveedor = require("../querys/queriesProveedores");

const getAllProveedores = async () => {
  try {
    const query = queriesProveedor.getAllProveedores;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addProveedor = async (nombre) => {
  try {
    const query = queriesProveedor.addProveedor;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};

const dropProveedor = async (ID) => {
  try {
    const query = queriesProveedor.dropProveedor;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upProveedor = async (ID) => {
  try {
    const query = queriesProveedor.upProveedor;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateProveedor = async (nombre, ID) => {
  try {
    const query = queriesProveedor.updateProveedor;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getProveedorByID = async (ID) => {
  try {
    const query = queriesProveedor.getProveedorByID;
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllProveedores,
  addProveedor,
  dropProveedor,
  upProveedor,
  updateProveedor,
  getProveedorByID,
};
