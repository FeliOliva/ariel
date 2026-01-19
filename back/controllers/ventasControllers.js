const ventasModel = require("../models/ventasModel");
const clienteModel = require("../models/clienteModel");
const pagosModel = require("../models/pagosModel");
const notasCreditoModel = require("../models/notasCreditoModel");
const NodeCache = require("node-cache");
const db = require("../database");
const cierreCuentaModel = require("../models/cierreCuentaModel");

// Caché con TTL de 10 segundos (para actualización más rápida entre múltiples PCs)
const ventasCache = new NodeCache({ stdTTL: 10 });

// Fecha de corte por defecto (1 de enero de 2026)
const FECHA_CORTE_DEFAULT = "2026-01-01";

const parseMonto = (valor) => {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    const normalizado = valor.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalizado);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

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
  let connection = null;
  let inTransaction = false;
  try {
    const {
      cliente_id,
      nroVenta,
      zona_id,
      descuento,
      tipoDescuento, // 0 = descuento | 1 = aumento
      detalles,
    } = req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    const lineas = (await ventasModel.getLineasStock(connection)).map(
      (l) => l.linea_id
    );

    // Si es aumento → descuento en DB = 0
    const descuentoDB = tipoDescuento === 1 ? 0 : descuento;

    // Crear venta
    const ventaId = await ventasModel.addVenta(
      cliente_id,
      nroVenta,
      zona_id,
      descuentoDB,
      connection
    );

    let totalVenta = 0;
    const detalleRows = [];
    const logRows = [];
    const stockMap = new Map();

    // Procesar detalles (cálculo en memoria)
    for (const detalle of detalles) {
      if (lineas.includes(detalle.linea_id)) {
        const current = stockMap.get(detalle.articulo_id) || 0;
        stockMap.set(detalle.articulo_id, current + Number(detalle.cantidad));
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

      detalleRows.push([
        ventaId,
        detalle.articulo_id,
        detalle.costo,
        detalle.cantidad,
        precioUnitario,
        sub_total,
        tipoDescuento === 1 ? descuento : 0,
      ]);

      logRows.push([
        cliente_id,
        detalle.articulo_id,
        detalle.cantidad,
        new Date(),
      ]);
    }

    await ventasModel.addDetalleVentaBatch(detalleRows, connection);
    await ventasModel.updateLogVentaBatch(logRows, connection);

    if (stockMap.size > 0) {
      const updates = Array.from(stockMap.entries()).map(
        ([articulo_id, cantidad]) => ({
          articulo_id,
          cantidad: -cantidad,
        })
      );
      await ventasModel.updateStockBatch(updates, connection);
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
    await ventasModel.updateVentaTotal(
      totalVenta,
      totalConDescuento,
      ventaId,
      connection
    );

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(201).json({ message: "Venta agregada con éxito" });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de addVenta:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error("Error al agregar la venta:", error);
    res.status(500).json({ error: "Error al agregar la venta" });
  }
};

const dropVenta = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const ID = req.params.ID;
    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    await ventasModel.dropVenta(ID, connection);

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    // Invalidar caché de ventas
    invalidateVentasCache();

    res
      .status(200)
      .json({ message: "Venta deshabilitada con éxito y stock actualizado" });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de dropVenta:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error("Error al deshabilitar la venta:", error);
    res.status(500).json({ error: "Error al deshabilitar la venta" });
  }
};

const updateVentas = async (req, res) => {
  try {
    const { fecha_venta, total, descuento, ID } = req.body;
    const total_con_descuento = (total - total * (descuento / 100)).toFixed(3);

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
    
    // Convertir zona_id a número para asegurar el tipo correcto
    const zonaIdNum = parseInt(zona_id, 10);
    
    
    if (!zona_id || isNaN(zonaIdNum)) {
      return res.status(400).json({ error: "ID de zona no proporcionado o inválido" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const ventas = await ventasModel.getVentasByZona(
      zonaIdNum,
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

    const usarCierre =
      new Date(fecha_inicio) >= new Date(FECHA_CORTE_DEFAULT);

    let cierreData = null;
    let saldoInicial = 0;

    if (usarCierre) {
      cierreData = await cierreCuentaModel.getCierreCuentaByCliente(
        cliente_id,
        FECHA_CORTE_DEFAULT
      );
      if (cierreData) {
        saldoInicial = Number(cierreData.saldo_cierre) || 0;
      }
    }

    const movimientos = await ventasModel.getResumenCliente(
      cliente_id,
      fecha_Inicio_Hora,
      fecha_Final
    );

    let saldoAcumulado = usarCierre ? saldoInicial : 0;
    const items = movimientos.map((item) => {
      let monto = 0;
      if (item.total_con_descuento) {
        monto = parseMonto(item.total_con_descuento);
      } else if (item.monto) {
        monto = parseMonto(item.monto);
      }

      if (item.tipo === "Venta") {
        saldoAcumulado += monto;
      } else if (item.tipo === "Pago" || item.tipo === "Nota de Crédito") {
        saldoAcumulado -= monto;
      }

      if (Math.abs(saldoAcumulado) < 1) {
        saldoAcumulado = 0;
      }

      return {
        ...item,
        monto_numerico: monto,
        saldo_restante: saldoAcumulado,
      };
    });

    const saldoFinal = saldoAcumulado;

    if (usarCierre && cierreData) {
      items.push({
        id: `cierre-${cierreData.id}`,
        tipo: "Saldo Inicial",
        estado: 1,
        cliente_id: cierreData.cliente_id,
        numero: "-",
        fecha: cierreData.fecha_corte,
        total_con_descuento: null,
        monto: null,
        metodo_pago: null,
        vendedor_id: null,
        vendedor_nombre: null,
        monto_numerico: saldoInicial,
        saldo_restante: saldoInicial,
        esSaldoInicial: true,
      });
    }

    res.json({
      items,
      saldo_inicial: saldoInicial,
      saldo_final: saldoFinal,
      cierre: cierreData,
      usar_saldo_inicial: usarCierre,
      fecha_corte: FECHA_CORTE_DEFAULT,
    });
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

const getResumenCuentaZona = async (req, res) => {
  try {
    const { ID: zona_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!zona_id) {
      return res.status(400).json({ error: "ID de zona no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const zonaIdNum = Number(zona_id);
    if (Number.isNaN(zonaIdNum)) {
      return res.status(400).json({ error: "ID de zona inválido" });
    }

    const usarSaldoInicial =
      new Date(fecha_inicio) >= new Date(FECHA_CORTE_DEFAULT);

    const [
      clientes,
      ventas,
      pagos,
      notasCredito,
      cierres,
      saldoTotalCierre,
    ] = await Promise.all([
      clienteModel.getClientesByZona(zonaIdNum),
      ventasModel.getVentasByZona(zonaIdNum, fecha_inicio, fecha_fin),
      pagosModel.getPagosByZona_id(zonaIdNum, fecha_inicio, fecha_fin),
      notasCreditoModel.getNotasCreditoByZona(
        zonaIdNum,
        fecha_inicio,
        fecha_fin
      ),
      cierreCuentaModel.getCierresByZona(FECHA_CORTE_DEFAULT, zonaIdNum),
      cierreCuentaModel.getSaldoTotalCierreMasivo(FECHA_CORTE_DEFAULT),
    ]);

    const saldosInicialesPorCliente = {};
    (cierres || []).forEach((cierre) => {
      if (cierre && cierre.cliente_id) {
        saldosInicialesPorCliente[cierre.cliente_id] =
          Number(cierre.saldo_cierre) || 0;
      }
    });

    const ventasPorCliente = {};
    (ventas || []).forEach((venta) => {
      const clienteId = venta.cliente_id;
      ventasPorCliente[clienteId] =
        (ventasPorCliente[clienteId] || 0) + (Number(venta.total_ventas) || 0);
    });

    const pagosPorCliente = {};
    (pagos || []).forEach((pago) => {
      const clienteId = pago.cliente_id;
      pagosPorCliente[clienteId] =
        (pagosPorCliente[clienteId] || 0) + (Number(pago.total_pagos) || 0);
    });

    const notasCreditoPorCliente = {};
    (notasCredito || []).forEach((nc) => {
      const clienteId = nc.cliente_id;
      notasCreditoPorCliente[clienteId] =
        (notasCreditoPorCliente[clienteId] || 0) + (Number(nc.total) || 0);
    });

    const datos = (clientes || [])
      .filter((cliente) => cliente.estado === 1)
      .map((cliente) => {
        const clienteId = cliente.id;
        const totalVentas = ventasPorCliente[clienteId] || 0;
        const totalPagos = pagosPorCliente[clienteId] || 0;
        const totalNotasCredito = notasCreditoPorCliente[clienteId] || 0;
        const saldoInicialCliente = saldosInicialesPorCliente[clienteId] || 0;
        const saldo =
          totalVentas -
          totalPagos -
          totalNotasCredito +
          (usarSaldoInicial ? saldoInicialCliente : 0);

        return {
          cliente_id: clienteId,
          nombre: `${cliente.farmacia || ""} - ${cliente.nombre} ${
            cliente.apellido || ""
          }`.trim(),
          localidad: cliente.localidad || "",
          totalVentas,
          totalPagos,
          totalNotasCredito,
          saldoInicial: saldoInicialCliente,
          saldo,
        };
      });

    const totalVentas = datos.reduce((sum, d) => sum + d.totalVentas, 0);
    const totalPagos = datos.reduce((sum, d) => sum + d.totalPagos, 0);
    const totalNotasCredito = datos.reduce(
      (sum, d) => sum + d.totalNotasCredito,
      0
    );
    const totalSaldoInicial = datos.reduce(
      (sum, d) => sum + (d.saldoInicial || 0),
      0
    );
    const saldoGlobal =
      totalVentas -
      totalPagos -
      totalNotasCredito +
      (usarSaldoInicial ? totalSaldoInicial : 0);

    res.json({
      datos,
      totales: {
        totalVentas,
        totalPagos,
        totalNotasCredito,
        totalSaldoInicial,
        saldoGlobal,
      },
      usarSaldoInicial,
      fecha_corte: FECHA_CORTE_DEFAULT,
      saldo_total_cierre: Number(saldoTotalCierre) || 0,
    });
  } catch (error) {
    console.error("Error al obtener el resumen de cuentas por zona:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const editarVenta = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const { venta_id, articulo_id, cantidad, precio_monotributista, isGift } =
      req.body;


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

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    const result = await ventasModel.editarVenta(
      venta_id,
      articulo_id,
      cantidadNum,
      precioNum,
      Boolean(isGift),
      { connection, skipCierreRecalculo: true }
    );

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    const FECHA_CORTE_DEFAULT = "2026-01-01";
    if (result?.cierreRecalculoInfo?.cliente_id && result?.cierreRecalculoInfo?.fecha_venta) {
      const fechaVentaDate = new Date(result.cierreRecalculoInfo.fecha_venta);
      const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
      if (fechaVentaDate < fechaCorteDate) {
        try {
          await cierreCuentaModel.recalcularCierreCliente(
            result.cierreRecalculoInfo.cliente_id,
            FECHA_CORTE_DEFAULT
          );
        } catch (cierreErr) {
          console.error("Error al recalcular cierre de cuenta:", cierreErr);
        }
      }
    }

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(200).json({
      message: "Venta editada correctamente",
      data: result,
    });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de editarVenta:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error("Error al editar la venta:", error);
    const status = error.status || 500;
    res
      .status(status)
      .json({ error: error.message || "Error al editar la venta" });
  }
};

const eliminarDetalleVenta = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const { detalle_venta_id } = req.body;

    if (!detalle_venta_id) {
      return res
        .status(400)
        .json({ error: "Se requiere el id del detalle de venta" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    const result = await ventasModel.eliminarDetalleVenta(detalle_venta_id, {
      connection,
      skipCierreRecalculo: true,
    });

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    const FECHA_CORTE_DEFAULT = "2026-01-01";
    if (result?.cierreRecalculoInfo?.cliente_id && result?.cierreRecalculoInfo?.fecha_venta) {
      const fechaVentaDate = new Date(result.cierreRecalculoInfo.fecha_venta);
      const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
      if (fechaVentaDate < fechaCorteDate) {
        try {
          await cierreCuentaModel.recalcularCierreCliente(
            result.cierreRecalculoInfo.cliente_id,
            FECHA_CORTE_DEFAULT
          );
        } catch (cierreErr) {
          console.error("Error al recalcular cierre de cuenta:", cierreErr);
        }
      }
    }

    // Invalidar caché de ventas
    invalidateVentasCache();

    res.status(200).json({
      message: "Detalle eliminado y venta recalculada correctamente",
      data: result,
    });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de eliminarDetalleVenta:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
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
  getResumenCuentaZona,
  editarVenta,
  eliminarDetalleVenta,
  getVentasPorFecha,
};
