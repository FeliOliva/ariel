const db = require("../database");
const queriesMetodosPagos = require("../querys/queriesMetodosPagos");

const getAllMetodos = async () => {
  try {
    const query = queriesMetodosPagos.getAllMetodos;
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const addMetodo = async (metodo) => {
  try {
    const query = queriesMetodosPagos.addMetodo;
    const [rows] = await db.query(query, [metodo]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

const updateMetodo = async (ID, metodo) => {
  try {
    const query = queriesMetodosPagos.updateMetodo;
    const [rows] = await db.query(query, [metodo, ID]);
    return rows;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMetodos,
  addMetodo,
  updateMetodo,
};
