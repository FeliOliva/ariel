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
    const cantidad = ventaDetalle[0].cantidad;
    const totalPrecioAntiguo = precioAntiguo * cantidad;

    // Obtener los datos de la venta
    const venta = await detalleVentaModel.getVenta(id_venta);

    // Actualizar los totales sin el precio antiguo
    let newTotal = venta[0].total - totalPrecioAntiguo;
    let newTotalConDescuento = newTotal * (1 - venta[0].descuento / 100);

    // Actualizar el detalle de venta con el nuevo precio
    await detalleVentaModel.updateDetalleVenta(ID, precio_monotributista);

    // Recalcular los totales con el nuevo precio
    const totalPrecioNuevo = precio_monotributista * cantidad;
    newTotal += totalPrecioNuevo;
    newTotalConDescuento = newTotal * (1 - venta[0].descuento / 100);

    // Actualizar los totales en la tabla venta
    await detalleVentaModel.updateTotales(id_venta, newTotal, newTotalConDescuento);

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
