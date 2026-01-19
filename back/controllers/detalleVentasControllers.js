const detalleVentaModel = require("../models/detalleVentaModel");
const ventasModel = require("../models/ventasModel");
const cierreCuentaModel = require("../models/cierreCuentaModel");
const db = require("../database");

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
  let connection = null;
  let inTransaction = false;
  try {
    const { ID, new_precio_monotributista, cantidad, venta_id } = req.body;

    const precioFinal = Number(new_precio_monotributista);
    const cantidadNum = Number(cantidad);

    if (isNaN(precioFinal) || precioFinal < 0) {
      return res.status(400).json({ error: "Precio inválido" });
    }
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    const sub_total = precioFinal * cantidadNum;

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    await detalleVentaModel.updateDetalleVenta(
      ID,
      precioFinal,
      cantidadNum,
      sub_total,
      connection
    );

    await recalcularTotales(venta_id, connection);

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    // Recalcular cierre de cuenta si la venta está dentro del período del cierre
    const FECHA_CORTE_DEFAULT = "2026-01-01";
    try {
      const venta = await ventasModel.getVentaByID(venta_id);
      if (venta && venta.length > 0 && venta[0].cliente_id) {
        const fechaVentaDate = new Date(venta[0].fecha_venta);
        const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
        
        if (fechaVentaDate < fechaCorteDate) {
          await cierreCuentaModel.recalcularCierreCliente(venta[0].cliente_id, FECHA_CORTE_DEFAULT);
        }
      }
    } catch (cierreErr) {
      console.error("Error al recalcular cierre de cuenta:", cierreErr);
    }

    res.status(200).json({
      message:
        "Detalle de venta actualizado y totales recalculados correctamente",
    });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de updateDetalleVenta:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error("Error en updateDetalleVenta:", error);
    res.status(500).json({ error: "Error al actualizar el detalle de venta" });
  }
};

const recalcularTotales = async (venta_id, connection = null) => {
  try {
    // Obtener todos los detalles de la venta
    const detalles = await detalleVentaModel.getDetalleVenta(
      venta_id,
      connection
    );
    // Inicializamos el total
    let total = 0;

    // Calculamos el total sumando precio * cantidad de cada detalle
    detalles.forEach((detalle) => {
      if (detalle.sub_total === 0) {
        total += detalle.sub_total;
      } else {
        total += detalle.precio_monotributista * detalle.cantidad;
      }
    });
    // Obtener el porcentaje de descuento de la tabla venta
    const porcentajeDescuento = await detalleVentaModel.getPorcentage(
      venta_id,
      connection
    );
    // Calcular el total con descuento
    const totalConDescuento =
      total - total * (porcentajeDescuento[0].descuento / 100);
    // Actualizar los valores de total y total_con_descuento en la tabla venta
    await detalleVentaModel.updateTotalesVenta(
      venta_id,
      total,
      totalConDescuento,
      connection
    );
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
};
