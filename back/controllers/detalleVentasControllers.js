const detalleVentaModel = require("../models/detalleVentaModel");

const getDetalleVentaById = async (req, res) => {
  try {
    const ID = req.params.id;
    const venta = await detalleVentaModel.getDetalleVentaById(ID);
    res.json(venta[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los detalles de venta" });
  }
};

const updateDetalleVenta = async (req, res) => {
  try {
    const { ID, new_precio_monotributista, venta_id } = req.body;

    // Actualizamos el precio del detalle
    await detalleVentaModel.updateDetalleVenta(ID, new_precio_monotributista);

    // Continuamos con el siguiente paso (recalcular el total)
    await recalcularTotales(venta_id);

    res.status(200).json({ message: "Detalle de venta actualizado y totales recalculados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de venta" });
  }
};
const recalcularTotales = async (venta_id) => {
  try {
    // Obtener todos los detalles de la venta
    const detalles = await detalleVentaModel.getDetalleVenta(venta_id);
    console.log("detalles de venta")
    console.log(detalles)
    // Inicializamos el total
    let total = 0;

    // Calculamos el total sumando precio * cantidad de cada detalle
    detalles.forEach(detalle => {
      total += detalle.precio_monotributista * detalle.cantidad;
    });
    console.log("total")
    console.log(total)
    // Obtener el porcentaje de descuento de la tabla venta
    const porcentajeDescuento = await detalleVentaModel.getPorcentage(venta_id);
    console.log("porcentaje de descuento")
    console.log(porcentajeDescuento)
    // Calcular el total con descuento
    const totalConDescuento = total - (total * (porcentajeDescuento[0].descuento / 100));
    console.log("total con descuento")
    console.log(totalConDescuento)
    // Actualizar los valores de total y total_con_descuento en la tabla venta
    await detalleVentaModel.updateTotalesVenta(venta_id, total, totalConDescuento);
  } catch (err) {
    throw err;
  }
};



module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
};
