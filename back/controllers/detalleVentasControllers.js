const detalleVentaModel = require("../models/detalleVentaModel");

const getAllDetalleVentas = async (req, res) => {
  try {
    const detalleVentas = await detalleVentaModel.getAllDetalleVentas();
    res.json(detalleVentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los detalles de venta" });
  }
};

const addDetalleVenta = async (req, res) => {
  try {
    const { venta_id, producto_id, cantidad, precio } = req.body;
    await detalleVentaModel.addDetalleVenta(
      venta_id,
      producto_id,
      cantidad,
      precio
    );
    res.status(201).json({ message: "Detalle de venta agregado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el detalle de venta" });
  }
};

const deleteDetalleVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await detalleVentaModel.deleteDetalleVenta(ID);
    res.status(200).json({ message: "Detalle de venta eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el detalle de venta" });
  }
};

const updateDetalleVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    const { venta_id, producto_id, cantidad, precio } = req.body;
    await detalleVentaModel.updateDetalleVenta(
      ID,
      venta_id,
      producto_id,
      cantidad,
      precio
    );
    res
      .status(200)
      .json({ message: "Detalle de venta actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de venta" });
  }
};

module.exports = {
  getAllDetalleVentas,
  addDetalleVenta,
  deleteDetalleVenta,
  updateDetalleVenta,
};
