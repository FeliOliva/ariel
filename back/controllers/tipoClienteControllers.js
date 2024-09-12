const tipoClienteModel = require("../models/tipoClienteModel");

const getAllTipoCliente = async (req, res) => {
  try {
    const tipoCliente = await tipoClienteModel.getAllTipoCliente();
    res.json(tipoCliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addTipoCliente = async (req, res) => {
  try {
    const { nombre } = req.body;
    await tipoClienteModel.addTipoCliente(nombre);
    res.status(201).json({ message: "Tipo de cliente agregada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropTipoCliente = async (req, res) => {
  try {
    const ID = req.params.ID;
    await tipoClienteModel.dropTipoCliente(ID);
    res.status(200).json({ message: "Tipo de cliente eliminada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const upTipoCliente = async (req, res) => {
  try {
    const ID = req.params.ID;
    await tipoClienteModel.upTipoCliente(ID);
    res.status(200).json({ message: "Tipo de cliente activada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateTipoCliente = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const tipoCliente = await tipoClienteModel.updateTipoCliente(nombre, ID);
    res.status(200).json({ message: "Tipo de cliente actualizada con exito" });
    res.json(tipoCliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getTipoClienteByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const tipoCliente = await tipoClienteModel.getTipoClienteByID(ID);
    res.json(tipoCliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllTipoCliente,
  addTipoCliente,
  dropTipoCliente,
  upTipoCliente,
  updateTipoCliente,
  getTipoClienteByID,
};
