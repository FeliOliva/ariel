const cuentaCorrienteModel = require("../models/cuentaCorrienteModel");

const getAllCuentasCorrientesByCliente = async (req, res) => {
  try {
    const cliente_id = req.params.ID;
    const cuenta = await cuentaCorrienteModel.getAllCuentasCorrientesByCliente(
      cliente_id
    );
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const payByCuentaCorriente = async (req, res) => {
  const { monto, ID } = req.body;
  const total = await cuentaCorrienteModel.getTotalCuentaCorriente(ID);
  if (total < monto) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    await cuentaCorrienteModel.payByCuentaCorriente(monto, ID);
    res.status(200).json("Cuenta corriente pagada con exito");
  }
};
const payCuentaByTotal = async (req, res) => {
  const { monto, cliente_id } = req.body;
  const total = await cuentaCorrienteModel.getTotalPagoCuentaCorriente(
    cliente_id
  );
  if (total < monto) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    await cuentaCorrienteModel.payCuentaByTotal(monto, cliente_id);
    res.status(200).json("Cuenta corriente pagada con exito");
  }
};
const getCuentasByCliente = async (req, res) => {
  const cliente_id = req.params.ID;
  const cuenta = await cuentaCorrienteModel.getCuentasByCliente(cliente_id);
  res.json(cuenta);
};

module.exports = {
  getAllCuentasCorrientesByCliente,
  getCuentasByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
};
