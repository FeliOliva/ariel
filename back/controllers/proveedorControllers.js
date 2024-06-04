const proveedorModel = require("../models/proveedorModel");

const getAllProveedores = async (req, res) => {
  try {
    const proveedor = await proveedorModel.getAllProveedores();
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addProveedor = async (req, res) => {
  try {
    const { nombre } = req.body;
    await proveedorModel.addProveedor(nombre);
    res.status(201).json({ message: "Proveedoredor agregado con exito" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el proveedor" });
  }
};
const dropProveedor = async (req, res) => {
  try {
    const { ID } = req.params;
    await proveedorModel.dropProveedor(ID);
    res.status(200).json({ message: "Proveedoredor eliminado con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el proveedor" });
  }
};
const upProveedor = async (req, res) => {
  try {
    const { ID } = req.params;
    await proveedorModel.upProveedor(ID);
    res.status(200).json({ message: "Proveedoredor activado con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al activar el proveedor" });
  }
};
const updateProveedor = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const proveedor = await proveedorModel.updateProveedor(nombre, ID);
    res.status(200).json({ message: "Proveedoredor actualizado con exito" });
    res.json(proveedor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllProveedores,
  addProveedor,
  dropProveedor,
  upProveedor,
  updateProveedor,
};
