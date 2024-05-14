const marcaModel = require("../models/marcaModel");

const getAllMarcas = async (req, res) => {
  try {
    const marcas = await marcaModel.getAllMarcas();
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addMarca = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const descripcionValue = descripcion ?? "";
    await marcaModel.addMarca(nombre, descripcionValue);
    res.status(201).json({ message: "Marca agregada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropMarca = async (req, res) => {
  try {
    const ID = req.params.ID;
    await marcaModel.dropMarca(ID);
    res.status(200).json({ message: "Marca eliminada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const upMarca = async (req, res) => {
  try {
    const ID = req.params.ID;
    await marcaModel.upMarca(ID);
    res.status(200).json({ message: "Marca activada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateMarca = async (req, res) => {
  try {
    const { nombre, descripcion, ID } = req.body;
    const descripcionValue = descripcion ?? "";
    const marcas = await marcaModel.updateMarca(nombre, descripcionValue, ID);
    res.status(200).json({ message: "Marca actualizada con exito" });
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllMarcas,
  addMarca,
  dropMarca,
  upMarca,
  updateMarca,
};
