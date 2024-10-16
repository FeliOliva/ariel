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
    const { ID, precio_monotributista, id_venta } = req.body;

    // Obtener el precio monotributista antiguo
    const ventaDetalle = await detalleVentaModel.getDetalleVentaById(ID);
    const precioAntiguo = ventaDetalle[0].precio_monotributista;

    // Calcular la diferencia de precios
    const diferenciaPrecio = precio_monotributista - precioAntiguo;

    // Actualizar el precio monotributista en detalle de venta
    await detalleVentaModel.updateDetalleVenta(ID, precio_monotributista);

    // Ajustar el total_con_descuento en la tabla de venta
    await detalleVentaModel.ajustarTotalConDescuento(id_venta, diferenciaPrecio);

    res.status(200).json({ message: "Detalle de venta actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de venta" });
  }
};



module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
};
