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
const actualizarPagoEnVenta = async (venta_id, pago) => {
  try {
    await db.query(queriesCuentasCorrientes.actualizarPagoEnVenta, [pago, venta_id]);
  } catch (err) {
    throw err;
  }
};
const getVentaId = async (cuenta_id) => {
  try {
    const query = queriesCuentasCorrientes.getVentaId;
    const [rows] = await db.query(query, [cuenta_id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
const setEstadoCuentaCorriente = async (ID) => {
  try {
    const query = queriesCuentasCorrientes.setEstadoCuentaCorriente;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const actualizarMetodoPago = async (metodo_pago, venta_id) => {
  try {
    const query = queriesCuentasCorrientes.actualizarMetodoPago;
    const [rows] = await db.query(query, [metodo_pago, venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateLogPago = async (payLoad) => {
  try {
    const query = queriesCuentasCorrientes.updateLogPago;
    const [rows] = await db.query(query, [
      payLoad.cliente_id,
      payLoad.cuenta_corriente_id,
      payLoad.venta_id,
      payLoad.monto,
      payLoad.metodo_pago_id,
      payLoad.total_restante,
      payLoad.cheque_id,
      payLoad.estado_pago,
    ]);
    return rows;
  } catch (err) {
    throw err;
  }
}
module.exports = {
  getAllCuentasCorrientesByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
  getTotalCuentaCorriente,
  getTotalPagoCuentaCorriente,
  getCuentasByClienteOrdenadas,
  actualizarSaldoCuentaCorriente,
  actualizarPagoEnVenta,
  getVentaId,
  setEstadoCuentaCorriente,
  actualizarMetodoPago,
  updateLogPago
};
