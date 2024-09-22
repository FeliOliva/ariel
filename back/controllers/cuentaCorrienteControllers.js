const cuentaCorrienteModel = require("../models/cuentaCorrienteModel");

const getAllCuentas = async (req, res) => {
  const cuentas = await cuentaCorrienteModel.getAllCuentas();
  res.json(cuentas);
};
const payByCuentaCorriente = async (req, res) => {
  const { monto, ID } = req.body;
  const total = await getTotalCuentaCorriente(ID);
  if (total < monto) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    const pago = await cuentaCorrienteModel.payByCuentaCorriente(monto, ID);
    res.json(pago);
  }
};
const payCuentaByTotal = async (req, res) => {
  const { monto, cliente_id } = req.body;
  const total = await getTotalPagoCuentCorriente(cliente_id);
  if (total < monto) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    const pago = await cuentaCorrienteModel.payCuentaByTotal(monto, cliente_id);
    res.json(pago);
  }
};
const getCuentasByCliente = async (req, res) => {
  const cliente_id = req.params.ID;
  const cuenta = await cuentaCorrienteModel.getCuentasByCliente(cliente_id);
  res.json(cuenta);
};

module.exports = {
  getAllCuentas,
  getCuentasByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
};
