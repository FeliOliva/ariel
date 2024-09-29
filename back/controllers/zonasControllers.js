const zonaModel = require("../models/zonaModel");

const getAllZonas = async (req, res) => {
  try {
    const zonas = await zonaModel.getAllZonas();
    res.json(zonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addZona = async (req, res) => {
  try {
    const { nombre } = req.body;
    const zona = await zonaModel.addZona(nombre);
    res.status(201).json({ message: "Zona agregada con exito", zona: zona });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropZona = async (req, res) => {
  try {
    const ID = req.params.ID;
    await zonaModel.dropZona(ID);
    res.status(200).json({ message: "Zona eliminada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const upZona = async (req, res) => {
  try {
    const ID = req.params.ID;
    await zonaModel.upZona(ID);
    res.status(200).json({ message: "Zona activada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateZona = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const zonas = await zonaModel.updateZona(nombre, ID);
    res.status(200).json({ message: "Zona actualizada con exito" });
    res.json(zonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getZonaByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const zonas = await zonaModel.getZonaByID(ID);
    res.json(zonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllZonas,
  addZona,
  dropZona,
  upZona,
  updateZona,
  getZonaByID,
};
