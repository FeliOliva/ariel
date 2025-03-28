const ventasModel = require("../models/ventasModel");

const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasModel.getAllVentas();
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ error: "Error al obtener todas las ventas" });
  }
};
const addVenta = async (req, res) => {
  try {
    const { cliente_id, nroVenta, zona_id, descuento, detalles } = req.body;

    const lineas = (await ventasModel.getLineasStock()).map((l) => l.linea_id);
    console.log("lineas", lineas);
    // Crear la venta
    const ventaId = await ventasModel.addVenta(
      cliente_id,
      nroVenta,
      zona_id,
      descuento
    );
    let totalVenta = 0;
    let sub_total = 0;
    // Agregar detalles de la venta y sumar subtotales
    for (const detalle of detalles) {
      if (lineas.includes(detalle.linea_id)) {
        // // Descontar el stock del artículo
        await ventasModel.descontarStock(detalle.articulo_id, detalle.cantidad);
        console.log("entroo");
      }
      if (detalle.isGift === true) {
        sub_total = 0;
        console.log(sub_total);
      } else {
        sub_total = Math.round(
          detalle.cantidad * detalle.precio_monotributista
        );
        console.log(sub_total);
      }
      Math.round((totalVenta += sub_total));
      console.log(totalVenta);

      // Agregar el detalle de la venta
      await ventasModel.addDetalleVenta(
        ventaId,
        detalle.articulo_id,
        detalle.costo,
        detalle.cantidad,
        detalle.precio_monotributista,
        sub_total
      );

      // Registrar el cambio en el log de stock
      await ventasModel.updateLogVenta(
        cliente_id,
        detalle.articulo_id,
        detalle.cantidad
      );
    }

    const totalConDescuento = Math.round(
      totalVenta - totalVenta * (descuento / 100)
    );
    // Actualizar la venta con el total y el total con descuento
    await ventasModel.updateVentaTotal(totalVenta, totalConDescuento, ventaId);
    res.status(201).json({ message: "Venta agregada con éxito" });
  } catch (error) {
    console.error("Error al agregar la venta:", error);
    res.status(500).json({ error: "Error al agregar la venta" });
  }
};

const dropVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ventasModel.dropVenta(ID);
    res
      .status(200)
      .json({ message: "Venta deshabilitada con éxito y stock actualizado" });
  } catch (error) {
    console.error("Error al deshabilitar la venta:", error);
    res.status(500).json({ error: "Error al deshabilitar la venta" });
  }
};

const updateVentas = async (req, res) => {
  try {
    const { producto_id, cantidad, cliente_id, zona_id, ID } = req.body;
    await ventasModel.updateVentas(
      producto_id,
      cantidad,
      cliente_id,
      zona_id,
      ID
    );
    res.status(200).json({ message: "Venta actualizada" });
  } catch (error) {
    console.error("Error al actualizar la venta:", error);
    res.status(500).json({ error: "Error al actualizar la venta" });
  }
};

const getVentasByZona = async (req, res) => {
  try {
    const { ID: zona_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query; // Obtener las fechas del query string
    console.log("ID desde el back:", zona_id);

    // Validar los parámetros requeridos
    if (!zona_id) {
      return res.status(400).json({ error: "ID de zona no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }
    // Llamar al modelo con los parámetros
    const ventas = await ventasModel.getVentasByZona(
      zona_id,
      fecha_inicio,
      fecha_fin
    );

    console.log("Ventas obtenidas:", ventas);

    // Manejar el caso de que no existan ventas
    if (!ventas || ventas.length === 0) {
      return res.json([]); // Devuelve un array vacío
    }

    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener las ventas por zona:", error);
    res.status(500).json({ error: "Error al obtener las ventas por zona" });
  }
};

const getVentasByProducto = async (req, res) => {
  try {
    const producto_id = req.params.ID;
    const ventas = await ventasModel.getVentasByProducto(producto_id);
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener las ventas por producto:", error);
    res.status(500).json({ error: "Error al obtener las ventas por producto" });
  }
};

const getVentasByClientes = async (req, res) => {
  try {
    const cliente_id = req.params.ID;
    const ventas = await ventasModel.getVentasByClientes(cliente_id);
    res.json(ventas);
    console.log(ventas);
  } catch (error) {
    console.error("Error al obtener las ventas por cliente:", error);
    res.status(500).json({ error: "Error al obtener las ventas por cliente" });
  }
};
const getVentaByID = async (req, res) => {
  try {
    const venta_id = req.params.ID;
    const detalleVentas = await ventasModel.getVentaByID(venta_id);
    if (detalleVentas.length <= 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    } else {
      let data = {
        nombre_cliente: detalleVentas[0].nombre_cliente_completo,
        nroVenta: detalleVentas[0].nroVenta,
        fecha: detalleVentas[0].fecha,
        zona_nombre: detalleVentas[0].nombre_zona,
        direccion: detalleVentas[0].direccion,
        nombre_tipo_cliente: detalleVentas[0].nombre_tipo_cliente,
        total_importe: detalleVentas[0].total_venta,
        descuento: detalleVentas[0].descuento,
        total_con_descuento: detalleVentas[0].total_con_descuento,
        venta_id: detalleVentas[0].id_venta,
        farmacia: detalleVentas[0].farmacia,
        localidad: detalleVentas[0].localidad,
        detalles: detalleVentas.map((detalle) => ({
          articulo_id: detalle.articulo_id,
          nombre:
            detalle.nombre_articulo +
            " " +
            detalle.mediciones +
            " " +
            detalle.nombre_linea +
            " " +
            detalle.nombre_sublinea,
          cantidad: detalle.cantidad,
          cod_articulo: detalle.cod_articulo,
          precio_monotributista: detalle.precio_monotributista,
          sub_total: detalle.sub_total,
          detalle_venta_id: detalle.id_dv,
        })),
      };
      res.json(data);
    }
  } catch (error) {
    console.error("Error al obtener la venta por ID:", error);
    res.status(500).json({ error: "Error al obtener la venta por ID" });
  }
};
const getResumenCliente = async (req, res) => {
  try {
    const { ID: cliente_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;
    // Validar los parámetros requeridos
    if (!cliente_id) {
      return res.status(400).json({ error: "ID de cliente no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }
    const fecha_Inicio_Hora = fecha_inicio + " 00:00:00";
    const fecha_Final = fecha_fin + " 23:59:59";
    const data = await ventasModel.getResumenCliente(
      cliente_id,
      fecha_Inicio_Hora,
      fecha_Final
    );
    res.json(data);
  } catch (error) {
    console.error("Error al obtener el resumen del cliente:", error);
    res.status(500).json({ error: "Error al obtener el resumen del cliente" });
  }
};
const getVentasByClientesxFecha = async (req, res) => {
  try {
    const { ID: cliente_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    // Validar los parámetros requeridos
    if (!cliente_id) {
      return res.status(400).json({ error: "ID de cliente no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    // Llamar al modelo con los parámetros
    const ventas = await ventasModel.getVentasByClientesxFecha(
      cliente_id,
      fecha_inicio,
      fecha_fin
    );

    console.log("Ventas obtenidas:", ventas);

    // Manejar el caso de que no existan ventas
    if (!ventas || ventas.length === 0) {
      return res.json([]); // Devuelve un array vacío
    }

    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener ventas" });
  }
};
const getResumenZonas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    console.log("Fecha inicio:", fecha_inicio);
    console.log("Fecha fin:", fecha_fin);

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const resumen = await ventasModel.getResumenZonas(fecha_inicio, fecha_fin);

    if (!resumen || resumen.length === 0) {
      return res.json([]); // Retornar un array vacío si no hay datos
    }

    res.json(resumen);
  } catch (error) {
    console.error("Error al obtener el resumen de zonas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getAllVentas,
  addVenta,
  dropVenta,
  updateVentas,
  getVentasByClientes,
  getVentasByZona,
  getVentasByProducto,
  getVentaByID,
  getVentasByClientesxFecha,
  getResumenZonas,
  getResumenCliente,
};
