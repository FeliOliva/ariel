const { response } = require("express");
const db = require("../database");
const queriesCuentasCorrientes = require("../querys/queriesCuentasCorrientes");

const getAllCuentasCorrientesByCliente = async (cliente_id) => {
  try {
    const query = queriesCuentasCorrientes.getAllCuentasCorrientesByCliente;
    const [rows] = await db.query(query, [cliente_id]);
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
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
const getTotalPagoCuentaCorriente = async (cliente_id) => {
  try {
    const query = queriesCuentasCorrientes.getTotalPagoCuentCorriente;
    const [rows] = await db.query(query, [cliente_id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

const getCuentasByClienteOrdenadas = async (cliente_id) => {
  try {
    const [rows] = await db.query(
      queriesCuentasCorrientes.getCuentasByClienteOrdenadas,
      [cliente_id]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

// Actualizar el saldo de una cuenta corriente
const actualizarSaldoCuentaCorriente = async (cuenta_id, nuevo_saldo) => {
  try {
    await db.query(queriesCuentasCorrientes.actualizarSaldoCuentaCorriente, [
      nuevo_saldo,
      cuenta_id,
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllCuentasCorrientesByCliente,
  getCuentasByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
  getTotalCuentaCorriente,
  getTotalPagoCuentaCorriente,
  getCuentasByClienteOrdenadas,
  actualizarSaldoCuentaCorriente,
};
