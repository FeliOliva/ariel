const articuloModel = require("../models/articuloModel");

const getAllArticulos = async (req, res) => {
  try {
    const articulos = await articuloModel.getAllArticulos();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addArticulo = async (req, res) => {
  try {
    const {
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
    } = req.body;
    await articuloModel.addArticulo(
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id
    );
    res.status(201).json({ message: "Articulo agregado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el articulo" });
  }
};

const dropArticulo = async (req, res) => {
  try {
    const ID = req.params.ID;
    await articuloModel.dropArticulo(ID);
    res.status(200).json({ message: "Articulo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el Articulo" });
  }
};
const upArticulo = async (req, res) => {
  try {
    const ID = req.params.ID;
    await articuloModel.upArticulo(ID);
    res.status(200).json({ message: "Articulo activado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar el Articulo" });
  }
};
const updateArticulo = async (req, res) => {
  try {
    const {
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      ID,
    } = req.body;
    const products = await articuloModel.updateArticulo(
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      ID
    );
    res.status(200).json({ message: "Articulo actualizado correctamente" });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllArticulos,
  addArticulo,
  dropArticulo,
  upArticulo,
  updateArticulo,
};
