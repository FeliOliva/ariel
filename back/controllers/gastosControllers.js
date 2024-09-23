const gastosModel = require("../models/gastosModel");

const getAllGastos = async (req, res) => {
  try {
    const gastos = await gastosModel.getAllGastos();
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addGasto = async (req, res) => {
  try {
    const { nombre, monto } = req.body;
    const gasto = await gastosModel.addGasto(nombre, monto);
    res.status(201).json({ message: "Gasto agregado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropGasto = async (req, res) => {
  try {
    const ID = req.params.ID;
    await gastosModel.dropGasto(ID);
    res.status(200).json({ message: "Gasto eliminado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const upGasto = async (req, res) => {
  try {
    const ID = req.params.ID;
    await gastosModel.upGasto(ID);
    res.status(200).json({ message: "Gasto activado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGastos = async (req, res) => {
  try {
    const { nombre, monto, ID } = req.body;
    const gasto = await gastosModel.updateGastos(ID, nombre, monto);
    res.status(200).json({ message: "Gasto actualizado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getGastoByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const gasto = await gastosModel.getGastoByID(ID);
    res.json(gasto[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllGastos,
  addGasto,
  dropGasto,
  upGasto,
  updateGastos,
  getGastoByID,
};
