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
const addCheque = async ({
  banco,
  nro_cheque,
  fecha_emision,
  fecha_cobro,
  importe,
  cliente_id,
}) => {
  try {
    const querys = queriesCheques.addCheque;
    await db.query(querys, [
      banco,
      nro_cheque,
      fecha_emision,
      fecha_cobro,
      importe,
      cliente_id,
    ]);
    const selectQuery = `
      SELECT * FROM cheque WHERE nro_cheque = ? AND banco = ? ORDER BY id DESC LIMIT 1;
    `;
    const [cheque] = await db.query(selectQuery, [nro_cheque, banco]);
    return cheque;
  } catch (err) {
    throw err;
  }
};
const updateCheque = async ({
  id,
  banco,
  nro_cheque,
  fecha_emision,
  fecha_cobro,
  importe,
}) => {
  try {
    // Convertir fecha al formato YYYY-MM-DD
    const formattedFechaEmision = fecha_emision.split("T")[0];
    const formattedFechaCobro = fecha_cobro.split("T")[0];

    const querys = queriesCheques.updateCheque;
    const [result] = await db.query(querys, [
      banco,
      nro_cheque,
      formattedFechaEmision,
      formattedFechaCobro,
      importe,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("El cheque con ese ID no existe o no se pudo actualizar");
    }

    return result;
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
const getChequeByCliente = async (cliente) => {
  try {
    const querys = queriesCheques.getChequeByCliente;
    const [rows] = await db.query(querys, [cliente]);
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
  updateCheque,
  getChequeByCliente,
};
