const productModel = require("../models/productModel");

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addProduct = async (req, res) => {
  try {
    const { nombre, cantidad, marca_id, categoria_id, precio } = req.body;
    await productModel.addProduct(
      nombre,
      cantidad,
      marca_id,
      categoria_id,
      precio
    );
    res.status(201).json({ message: "Producto agregado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el producto" });
  }
};
const dropProduct = async (req, res) => {
  try {
    const ID = req.params.ID;
    await productModel.dropProduct(ID);
    res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
const upProduct = async (req, res) => {
  try {
    const ID = req.params.ID;
    await productModel.upProduct(ID);
    res.status(200).json({ message: "Producto activado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar el producto" });
  }
};
const updateProducts = async (req, res) => {
  try {
    const { nombre, cantidad, marca_id, categoria_id,precio, ID } = req.body;
    const products = await productModel.updateProducts(nombre, cantidad, marca_id, categoria_id,precio, ID);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllProducts,
  addProduct,
  dropProduct,
  upProduct,
  updateProducts
};
