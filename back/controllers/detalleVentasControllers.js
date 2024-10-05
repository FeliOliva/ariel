const detalleVentaModel = require("../models/detalleVentaModel");

const getDetalleVentaById = async (req, res) => {
  try {
    const ID = req.params.ID;
    const venta = await detalleVentaModel.getDetalleVentaById(ID);
    res.json(venta[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los detalles de venta" });
  }
};

const updateDetalleVenta = async (req, res) => {
  try {
    const { ID, precio_monotributista } = req.body;
    await detalleVentaModel.updateDetalleVenta(ID, precio_monotributista);
    res
      .status(200)
      .json({ message: "Detalle de venta actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de venta" });
  }
};

module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
};
