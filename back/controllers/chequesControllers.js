const chequesModel = require("../models/chequesModel");

const getAllCheques = async (req, res) => {
  try {
    const cheques = await chequesModel.getAllCheques();
    res.json(cheques);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addCheque = async (req, res) => {
  try {
    const { banco, nro_cheque, fecha_emision, fecha_cobro, importe, cliente_id, nro_pago } = req.body;
    const cheque = await chequesModel.addCheque({
      banco,
      nro_cheque,
      fecha_emision,
      fecha_cobro,
      importe,
      cliente_id,
      nro_pago,
    });
    res.status(201).json({ message: "Cheque agregado con éxito", cheque });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateCheque = async (req, res) => {
  try {
    const ID = req.params.ID;
    const { banco, nro_cheque, fecha_emision, fecha_cobro, importe } = req.body;
    await chequesModel.updateCheque({ ID, banco, nro_cheque, fecha_emision, fecha_cobro, importe });
    res.status(200).json({ message: "Cheque actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const dropCheque = async (req, res) => {
  try {
    const ID = req.params.ID;
    await chequesModel.dropCheque(ID);
    res.status(200).json({ message: "Cheque eliminado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const upCheque = async (req, res) => {
  try {
    const ID = req.params.ID;
    await chequesModel.upCheque(ID);
    res.status(200).json({ message: "Cheque activado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCheques = async (req, res) => {
  try {
    const { id, banco, nro_cheque, fecha_emision, fecha_cobro, importe } =
      req.body;
    console.log(req.body)
    const updatedCheque = await chequesModel.updateCheque({
      id,
      banco,
      nro_cheque,
      fecha_emision,
      fecha_cobro,
      importe,
    });
    res.status(200).json(updatedCheque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getChequeByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const cheque = await chequesModel.getChequeByID(ID);
    res.json(cheque[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getChequeByCliente = async (req, res) => {
  try {
    const cliente = req.params.cliente_id;
    const cheque = await chequesModel.getChequeByCliente(cliente);
    res.json(cheque);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllCheques,
  addCheque,
  dropCheque,
  upCheque,
  updateCheques,
  getChequeByID,
  updateCheque,
  getChequeByCliente,
};
