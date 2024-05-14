const db = require("../database");
const queriesMarcas = require("../querys/queriesMarcas");

const getAllMarcas = async () => {
  try {
    const query = queriesMarcas.getAllMarcas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addMarca = async (nombre, descripcion) => {
  try {
    const descripcionValue = descripcion ?? "";
    const query = queriesMarcas.addMarca;
    await db.query(query, [nombre, descripcionValue]);
  } catch (err) {
    throw err;
  }
};
const dropMarca = async (ID) => {
  try {
    const query = queriesMarcas.dropMarca;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upMarca = async (ID) => {
  try {
    const query = queriesMarcas.upMarca;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateMarca = async (nombre, descripcion, ID) => {
  try {
    const descripcionValue = descripcion ?? "";
    const query = queriesMarcas.updateMarca;
    await db.query(query, [nombre, descripcionValue, ID]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllMarcas,
  addMarca,
  dropMarca,
  upMarca,
  updateMarca,
};
