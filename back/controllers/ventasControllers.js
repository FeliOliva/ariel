const ventasModel = require("../models/ventasModel");

const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasModel.getAllVentas();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addVenta = async (req, res) => {
  try {
    const { producto_id, cantidad, cliente_id, zona_id } = req.body;
    await ventasModel.addVenta(producto_id, cantidad, cliente_id, zona_id);
    res.status(201).json({ message: "Venta agregada con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al agregar la venta" });
  }
};
const dropVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ventasModel.dropVenta(ID);
    res.status(200).json({ message: "Venta eliminada con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la venta" });
  }
};
const upVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ventasModel.upVenta(ID);
    res.status(200).json({ message: "Venta activada con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al activar la venta" });
  }
};
const updateVentas = async (req, res) => {
  try {
    const { producto_id, cantidad, cliente_id, zona_id, ID } = req.body;
    const ventas = await ventasModel.updateVentas(
      producto_id,
      cantidad,
      cliente_id,
      zona_id,
      ID
    );
    res.status(200).json({ message: "Venta actualizada" });
    res.json(ventas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
const getVentasByClientes = async (req, res) => {
  try {
    const cliente_id = req.params.ID;
    const ventas = await ventasModel.getVentasByClientes(cliente_id);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getVentasByZona = async (req, res) => {
  try {
    const zona_id = req.params.ID;
    const ventas = await ventasModel.getVentasByZona(zona_id);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getVentasByProducto = async (req, res) => {
  try {
    const producto_id = req.params.ID;
    const ventas = await ventasModel.getVentasByProducto(producto_id);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  getAllVentas,
  addVenta,
  dropVenta,
  upVenta,
  updateVentas,
  getVentasByClientes,
  getVentasByZona,
  getVentasByProducto,
};
