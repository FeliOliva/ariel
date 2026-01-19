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
const addSubLineaByID = async (req, res) => {
  try {
    const { subLinea_id, linea_id } = req.body;
    const sublinea = await subLineaModels.getSublineaByID(subLinea_id);
    const nombre = sublinea.nombre;

    await subLineaModels.addSubLinea(nombre, linea_id);

    res.status(201).json({ message: "SubLinea agregada con éxito" });
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
    res.status(500).json({ error: "Error al eliminar la SubLinea" });
  }
};

const upSubLinea = async (req, res) => {
  try {
    const ID = req.params.ID;
    await subLineaModels.upSubLinea(ID);
    res.status(200).json({ message: "SubLinea activada" });
  } catch (error) {
    res.status(500).json({ error: "Error al activar la SubLinea" });
  }
};

const updateSubLinea = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const subLinea = await subLineaModels.updateSubLinea(nombre, ID);
    res.status(200).json({ message: "SubLinea actualizada" });
    res.json(subLinea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getLineaBySublinea = async (req, res) => {
  try {
    const { linea_id } = req.params; // Cambiado de subLineaId a linea_id
    const linea = await subLineaModels.getLineaBySublinea(linea_id); // Cambiado de subLineaId a linea_id
    res.json(linea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getSublineaByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const sublinea = await subLineaModels.getSublineaByID(ID);
    res.json(sublinea[0]);
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
  getLineaBySublinea,
  addSubLineaByID,
  getSublineaByID,
};
