const ventasModel = require("../models/ventasModel");
const NodeCache = require("node-cache");

// Caché con TTL de 10 segundos (para actualización más rápida entre múltiples PCs)
const ventasCache = new NodeCache({ stdTTL: 10 });

// Función para invalidar caché
const invalidateVentasCache = () => {
  ventasCache.del("allVentas");
};

const getAllVentas = async (req, res) => {
  try {
    // Intentar obtener del caché
    const cachedVentas = ventasCache.get("allVentas");
    if (cachedVentas) {
      return res.json(cachedVentas);
    }

    // Si no hay caché, traer de la BD
    const ventas = await ventasModel.getAllVentas();

    // Guardar en caché
    ventasCache.set("allVentas", ventas);

    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ error: "Error al obtener todas las ventas" });
  }
};
const addVenta = async (req, res) => {
  try {
    const {
      cliente_id,
      nroVenta,
      zona_id,
      descuento,
      tipoDescuento, // 0 = descuento | 1 = aumento
      detalles,
    } = req.body;

    const lineas = (await ventasModel.getLineasStock()).map((l) => l.linea_id);

    // Si es aumento → descuento en DB = 0
    const descuentoDB = tipoDescuento === 1 ? 0 : descuento;

    // Crear venta
    const ventaId = await ventasModel.addVenta(
      cliente_id,
      nroVenta,
      zona_id,
      descuentoDB
    );

    let totalVenta = 0;

    // Procesar detalles
    for (const detalle of detalles) {
      if (lineas.includes(detalle.linea_id)) {
        await ventasModel.descontarStock(detalle.articulo_id, detalle.cantidad);
      }

      let precioUnitario = Number(detalle.precio_monotributista);

      // 🔹 AUMENTO → aplicar y redondear normal
      if (tipoDescuento === 1) {
        precioUnitario = Math.round(precioUnitario * (1 + descuento / 100));
      }

      let sub_total = detalle.isGift ? 0 : detalle.cantidad * precioUnitario;

      // 🔹 Siempre entero
      sub_total = Math.round(sub_total);

      totalVenta += sub_total;

      await ventasModel.addDetalleVenta(
        ventaId,
        detalle.articulo_id,
        detalle.costo,
        detalle.cantidad,
        precioUnitario,
        sub_total,
        tipoDescuento === 1 ? descuento : 0
      );

      await ventasModel.updateLogVenta(
        cliente_id,
        detalle.articulo_id,
        detalle.cantidad
      );
    }

    // ===============================
    // 🔥 CÁLCULO DE TOTAL CON DESCUENTO
    // ===============================

    let totalConDescuento = totalVenta;

    if (tipoDescuento === 0) {
      const descuentoMonto = totalVenta * (descuento / 100);

      // 🔹 REDONDEAR SIEMPRE HACIA ARRIBA
      const descuentoAplicado = Math.ceil(descuentoMonto);

      totalConDescuento = totalVenta - descuentoAplicado;
    }

    // 🔹 Evitar decimales ocultos
    totalConDescuento = Math.round(totalConDescuento);
    totalVenta = Math.round(totalVenta);

    // Guardar totales
    await ventasModel.updateVentaTotal(totalVenta, totalConDescuento, ventaId);

    // Invalidar caché de ventas
    invalidateVentasCache();

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

    // Invalidar caché de ventas
    invalidateVentasCache();

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
    const { fecha_venta, total, descuento, ID } = req.body;
    console.log("Datos recibidos para actualizar la venta:", req.body);
    const total_con_descuento = (total - total * (descuento / 100)).toFixed(3);
    console.log("Total con descuento:", total_con_descuento);

    await ventasModel.updateVentas(
      fecha_venta,
      descuento,
      total_con_descuento,
      ID
    );

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(200).json({ message: "Venta actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la venta:", error);
    res.status(500).json({ error: "Error al actualizar la venta" });
  }
};

const getVentasByZona = async (req, res) => {
  try {
    const { ID: zona_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;
    console.log("ID", zona_id);
    console.log("fechas", fecha_inicio, fecha_fin);
    if (!zona_id) {
      return res.status(400).json({ error: "ID de zona no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const ventas = await ventasModel.getVentasByZona(
      zona_id,
      fecha_inicio,
      fecha_fin
    );

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
          aumento_porcentaje: detalle.aumento_porcentaje,
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

const editarVenta = async (req, res) => {
  try {
    const { venta_id, articulo_id, cantidad, precio_monotributista, isGift } =
      req.body;

    console.log("Datos recibidos para editar la venta:", req.body);

    if (!venta_id || !articulo_id || !cantidad) {
      return res
        .status(400)
        .json({ error: "Datos incompletos para editar la venta" });
    }

    // normalizamos cantidad y precio a números (por si vienen como string)
    const cantidadNum = Number(cantidad);
    const precioNum =
      precio_monotributista !== undefined && precio_monotributista !== null
        ? Number(precio_monotributista)
        : null;

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    const result = await ventasModel.editarVenta(
      venta_id,
      articulo_id,
      cantidadNum,
      precioNum,
      Boolean(isGift)
    );

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(200).json({
      message: "Venta editada correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al editar la venta:", error);
    const status = error.status || 500;
    res
      .status(status)
      .json({ error: error.message || "Error al editar la venta" });
  }
};

const eliminarDetalleVenta = async (req, res) => {
  try {
    const { detalle_venta_id } = req.body;

    if (!detalle_venta_id) {
      return res
        .status(400)
        .json({ error: "Se requiere el id del detalle de venta" });
    }

    const result = await ventasModel.eliminarDetalleVenta(detalle_venta_id);

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(200).json({
      message: "Detalle eliminado y venta recalculada correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al eliminar el detalle:", error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || "Error interno" });
  }
};
const getVentasPorFecha = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }
    const ventas = await ventasModel.getVentasPorFecha(fecha_inicio, fecha_fin);
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener las ventas por fecha:", error);
    res.status(500).json({ error: "Error al obtener las ventas por fecha" });
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
  editarVenta,
  eliminarDetalleVenta,
  getVentasPorFecha,
};
