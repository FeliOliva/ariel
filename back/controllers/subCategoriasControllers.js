const subcategoriaModels = require("../models/subCategoriasModel");

const getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await subcategoriaModels.getAllSubCategories();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addSubCategory = async (req, res) => {
  try {
    const { nombre } = req.body;
    await subcategoriaModels.addSubCategory(nombre);
    res.status(201).json({ message: "Subcategoria agregada con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropSubCategory = async (req, res) => {
  try {
    const ID = req.params.ID;
    await subcategoriaModels.dropSubCategory(ID);
    res.status(200).json({ message: "Subcategoria eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la subcategoria" });
  }
};

const upSubCategory = async (req, res) => {
  try {
    const ID = req.params.ID;
    await subcategoriaModels.upSubCategory(ID);
    res.status(200).json({ message: "Subcategoria activada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al activar la subcategoria" });
  }
};

const updateSubCategories = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const subcategory = await subcategoriaModels.updateSubCategories(
      nombre,
      ID
    );
    res.status(200).json({ message: "Subcategoria actualizada" });
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSubCategories,
  addSubCategory,
  dropSubCategory,
  upSubCategory,
  updateSubCategories,
};
