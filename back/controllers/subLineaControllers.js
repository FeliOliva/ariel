const subLineaModels = require("../models/subLineaModel");

const getAllSubLinea = async (req, res) => {
  try {
    const subLinea = await subLineaModels.getAllSubLinea();
    res.json(subLinea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addSubLinea = async (req, res) => {
  try {
    const { nombre, linea_id } = req.body;
    await subLineaModels.addSubLinea(nombre, linea_id);
    res.status(201).json({ message: "SubLinea agregada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropSubLinea = async (req, res) => {
  try {
    const ID = req.params.ID;
    await subLineaModels.dropSubLinea(ID);
    res.status(200).json({ message: "SubLinea eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la SubLinea" });
  }
};

const upSubLinea = async (req, res) => {
  try {
    const ID = req.params.ID;
    await subLineaModels.upSubLinea(ID);
    res.status(200).json({ message: "SubLinea activada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al activar la SubLinea" });
  }
};

const updateSubLinea = async (req, res) => {
  try {
    const { nombre, linea_id, ID } = req.body;
    const subLinea = await subLineaModels.updateSubLinea(nombre, linea_id, ID);
    res.status(200).json({ message: "SubLinea actualizada" });
    res.json(subLinea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getSublineaByLinea = async (req, res) => {
  try {
    const linea_id = req.params.linea_id;
    const subLinea = await subLineaModels.getSublineaByLinea(linea_id);
    res.json(subLinea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSubLinea,
  addSubLinea,
  dropSubLinea,
  upSubLinea,
  updateSubLinea,
  getSublineaByLinea,
};
