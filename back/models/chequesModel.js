const db = require("../database");
const queriesCheques = require("../querys/queriesCheques");

const getAllCheques = async () => {
  try {
    const querys = queriesCheques.getAllCheques;
    const [rows] = await db.query(querys);
    return rows;
  } catch (err) {
    throw err;
  }
};
// en chequesModel.js
const addCheque = async ({
  banco,
  nro_cheque,
  fecha_emision,
  fecha_cobro,
  importe,
}) => {
  try {
    const querys = queriesCheques.addCheque;
    await db.query(querys, [
      banco,
      nro_cheque,
      fecha_emision,
      fecha_cobro,
      importe,
    ]);
  } catch (err) {
    throw err;
  }
};

const dropCheque = async (ID) => {
  try {
    const querys = queriesCheques.dropCheque;
    const [rows] = await db.query(querys, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const upCheque = async (ID) => {
  try {
    const querys = queriesCheques.upCheque;
    const [rows] = await db.query(querys, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getChequeByID = async (ID) => {
  try {
    const querys = queriesCheques.getChequeByID;
    const [rows] = await db.query(querys, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllCheques,
  addCheque,
  dropCheque,
  upCheque,
  getChequeByID,
};
