const metodoPagoModel = require("../models/metodoPagoModel");

const getAllMetodosPago = async (req, res) => {
  try {
    const metodos = await metodoPagoModel.getAllMetodos();
    res.json(metodos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addMetodo = async (req, res) => {
  try {
    const { metodo } = req.body;
    const newMetodo = await metodoPagoModel.addMetodo(metodo);
    res.status(201).json(newMetodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMetodo = async (req, res) => {
  try {
    const { ID, metodo } = req.body;
    const updatedMetodo = await metodoPagoModel.updateMetodo(ID, metodo);
    res.status(200).json(updatedMetodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMetodosPago,
  addMetodo,
  updateMetodo,
};
