const db = require("../database");
const queriesCuentasCorrientes = require("../querys/queriesCuentasCorrientes");

const getAllCuentas = async () => {
  try {
    const query = queriesCuentasCorrientes.getAllCuentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const payByCuentaCorriente = async (monto, ID) => {
  try {
    const query = queriesCuentasCorrientes.payByCuentaCorriente;
    const [rows] = await db.query(query, [monto, ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const payCuentaByTotal = async (monto, cliente_id) => {
  try {
    const query = queriesCuentasCorrientes.payCuentaByTotal;
    const [rows] = await db.query(query, [monto, cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getCuentasByCliente = async (cliente_id) => {
  try {
    const query = queriesCuentasCorrientes.getCuentasByCliente;
    const [rows] = await db.query(query, [cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getTotalCuentaCorriente = async (ID) => {
  try {
    const query = queriesCuentasCorrientes.getTotalCuentaCorriente;
    const total = await db.query(query, [ID]);
    return total;
  } catch (err) {
    throw err;
  }
};
const getTotalPagoCuentCorriente = async (cliente_id) => {
  try {
    const query = queriesCuentasCorrientes.getTotalPagoCuentCorriente;
    const total = await db.query(query, [cliente_id]);
    return total;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllCuentas,
  getCuentasByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
  getTotalCuentaCorriente,
  getTotalPagoCuentCorriente,
};
