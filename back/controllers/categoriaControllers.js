const categoriaModels = require("../models/categoriaModel");

const getAllCategories = async (req, res) => {
  try {
    const categorias = await categoriaModels.getAllCategories();
    res.json(categorias);
  } catch (error) {
    res.status(201).json({ message: "Categoria agregada con exito" });
  }
};
const addCategory = async (req, res) => {
  try {
    const { nombre, subcategoria_id } = req.body;
    await categoriaModels.addCategory(nombre, subcategoria_id);
    res.status(201).json({ message: "Categoría agregada con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al agregar la categoria" });
  }
};
const dropCategory = async (req, res) => {
  try {
    const ID = req.params.ID;
    await categoriaModels.dropCategory(ID);
    res.status(200).json({ message: "Categoría eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar la categoria" });
  }
};
const upCategory = async (req, res) => {
  try {
    const ID = req.params.ID;
    await categoriaModels.upCategory(ID);
    res.status(200).json({ message: "Categoría activada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al activar la categoria" });
  }
};
const updateCategories = async (req, res) => {
  try {
    const { nombre, subcategoria_id, ID } = req.body;
    const categorias = await categoriaModels.updateCategories(
      nombre,
      subcategoria_id,
      ID
    );
    res.status(200).json({ message: "Categoría actualizada" });
    res.json(categorias);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al modificar la categoria" });
  }
};
module.exports = {
  getAllCategories,
  addCategory,
  dropCategory,
  upCategory,
  updateCategories,
};
