const db = require("../database");
const queriesVentas = require("../querys/queriesVentas");
const cierreCuentaModel = require("./cierreCuentaModel");

const getAllVentas = async () => {
  try {
    const query = queriesVentas.getAllVentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addVenta = async (
  cliente_id,
  nroVenta,
  zona_id,
  descuentoDB,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesVentas.addVenta;
    const [result] = await conn.query(query, [
      cliente_id,
      nroVenta,
      zona_id,
      descuentoDB,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

const checkStock = async (articulo_id, cantidad, connection = null) => {
  try {
    const conn = connection || db;
    const [rows] = await conn.query(queriesVentas.checkStock, [articulo_id]);
    if (rows.length === 0 || rows[0].stock < cantidad) {
      return {
        disponible: false,
        nombre: rows.length > 0 ? rows[0].nombre : "Desconocido",
      };
    }
    return { disponible: true };
  } catch (error) {
    throw new Error("Error al verificar el stock: " + error.message);
  }
};

const descontarStock = async (articulo_id, cantidad, connection = null) => {
  try {
    const conn = connection || db;
    await conn.query(queriesVentas.descontarStock, [cantidad, articulo_id]);
  } catch (error) {
    throw new Error("Error al descontar el stock: " + error.message);
  }
};

const updateLogVenta = async (
  cliente_id,
  articulo_id,
  cantidad,
  connection = null
) => {
  try {
    const conn = connection || db;
    await conn.query(queriesVentas.updateLogVenta, [
      cliente_id,
      articulo_id,
      cantidad,
    ]);
  } catch (error) {
    throw new Error("Error al registrar en el log de ventas: " + error.message);
  }
};

const updateLogVentaBatch = async (rows, connection = null) => {
  if (!rows || rows.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const query =
      "INSERT INTO stock_log(cliente_id, articulo_id, cantidad, fecha) VALUES ?";
    await conn.query(query, [rows]);
  } catch (error) {
    throw new Error(
      "Error al registrar en el log de ventas (batch): " + error.message
    );
  }
};
const addDetalleVenta = async (
  ventaId,
  articulo_id,
  costo,
  cantidad,
  precio_monotributista,
  sub_total,
  aumento_porcentaje,
  connection = null
) => {
  try {
    const conn = connection || db;
    await conn.query(queriesVentas.addDetalleVenta, [
      ventaId,
      articulo_id,
      costo,
      cantidad,
      precio_monotributista,
      sub_total,
      aumento_porcentaje,
    ]);
  } catch (error) {
    throw new Error("Error al agregar el detalle de venta: " + error.message);
  }
};

const addDetalleVentaBatch = async (rows, connection = null) => {
  if (!rows || rows.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const query = `INSERT INTO detalle_venta 
      (venta_id, articulo_id, costo, cantidad, precio_monotributista, sub_total, aumento_porcentaje) 
      VALUES ?`;
    await conn.query(query, [rows]);
  } catch (error) {
    throw new Error(
      "Error al agregar el detalle de venta (batch): " + error.message
    );
  }
};

const updateStockBatch = async (updates, connection = null) => {
  if (!updates || updates.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const cases = updates.map(() => "WHEN ? THEN ?").join(" ");
    const ids = updates.map((u) => u.articulo_id);
    const params = [];
    updates.forEach((u) => {
      params.push(u.articulo_id, u.cantidad);
    });
    params.push(...ids);
    const query = `UPDATE articulo SET stock = stock + CASE id ${cases} ELSE 0 END WHERE id IN (${ids
      .map(() => "?")
      .join(",")})`;
    await conn.query(query, params);
  } catch (error) {
    throw new Error(
      "Error al actualizar el stock en batch: " + error.message
    );
  }
};
const dropVenta = async (ID, connection = null) => {
  try {
    const conn = connection || db;
    // Obtener detalles de la venta antes de eliminarla
    const [detalles] = await conn.query(queriesVentas.getDetallesVenta, [ID]);

    // Devolver stock a los artículos vendidos
    if (detalles.length > 0) {
      const stockMap = new Map();
      for (const detalle of detalles) {
        const current = stockMap.get(detalle.articulo_id) || 0;
        stockMap.set(detalle.articulo_id, current + Number(detalle.cantidad));
      }
      const updates = Array.from(stockMap.entries()).map(([articulo_id, cantidad]) => ({
        articulo_id,
        cantidad,
      }));
      await updateStockBatch(updates, conn);
    }

    // Eliminar los detalles de la venta
    await conn.query(queriesVentas.dropDetallesVenta, [ID]);

    // Eliminar la venta
    await conn.query(queriesVentas.dropVenta, [ID]);
  } catch (err) {
    throw err;
  }
};

const updateVentas = async (
  fecha_venta,
  descuento,
  total_con_descuento,
  ID
) => {
  try {
    const query = queriesVentas.updateVentas;

    const formattedFechaVenta = new Date(fecha_venta)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Obtener información de la venta antes de actualizar
    const [ventaRows] = await db.query("SELECT cliente_id, fecha_venta FROM venta WHERE id = ?", [ID]);
    const cliente_id = ventaRows[0]?.cliente_id;

    await db.query(query, [
      formattedFechaVenta,
      total_con_descuento,
      descuento,
      ID,
    ]);

    // Recalcular cierre de cuenta si la venta está dentro del período del cierre
    // Fecha de corte por defecto: 2026-01-01
    const FECHA_CORTE_DEFAULT = "2026-01-01";
    const fechaVentaDate = new Date(formattedFechaVenta);
    const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
    
    // Si la venta es anterior a la fecha de corte, recalcular el cierre
    if (fechaVentaDate < fechaCorteDate && cliente_id) {
      try {
        await cierreCuentaModel.recalcularCierreCliente(cliente_id, FECHA_CORTE_DEFAULT);
      } catch (cierreErr) {
        // No fallar la actualización de la venta si falla el recálculo del cierre
        console.error("Error al recalcular cierre de cuenta:", cierreErr);
      }
    }
  } catch (err) {
    throw err;
  }
};

const getVentasByClientes = async (cliente_id) => {
  try {
    const query = queriesVentas.getVentasByClientes;
    const [rows] = await db.query(query, [cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentasByZona = async (zona_id, fecha_inicio, fecha_fin) => {
  try {
    const query = queriesVentas.getVentasByZona;
    const [rows] = await db.query(query, [zona_id, fecha_inicio, fecha_fin]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentasByProducto = async (producto_id) => {
  try {
    const query = queriesVentas.getVentasByProducto;
    const [rows] = await db.query(query, [producto_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentaByID = async (venta_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesVentas.getVentaByID;
    const [rows] = await conn.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getTotal = async (venta_id) => {
  try {
    const query = queriesVentas.getTotal;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateVentaTotal = async (
  total,
  total_con_descuento,
  ventaId,
  connection = null
) => {
  const conn = connection || db;
  const query = queriesVentas.updateVentaTotal;
  await conn.query(query, [total, total_con_descuento, ventaId]);
};

const getResumenCliente = async (cliente_id, fecha_inicio, fecha_fin) => {
  try {
    const query = queriesVentas.getResumenCliente;
    const [rows] = await db.query(query, [
      cliente_id,
      fecha_inicio,
      fecha_fin,
      cliente_id,
      fecha_inicio,
      fecha_fin,
      cliente_id,
      fecha_inicio,
      fecha_fin,
    ]);
    return rows;
  } catch (err) {
    console.error("Error en getResumenCliente:", err);
    throw err;
  }
};
const getVentasByClientesxFecha = async (
  cliente_id,
  fecha_inicio,
  fecha_fin
) => {
  try {
    const query = queriesVentas.getVentasByClientesxFecha;
    const [rows] = await db.query(query, [
      fecha_inicio,
      fecha_fin,
      cliente_id,
      fecha_inicio,
      fecha_fin,
    ]);
    return rows;
  } catch (err) {
    console.error("Error en getVentasByClientes:", err);
    throw err;
  }
};
const getResumenZonas = async (fecha_inicio, fecha_fin) => {
  try {
    const query = `
     SELECT 
    z.id AS zona_id,
    z.nombre AS nombre_zona,
    COALESCE(ventas.total_ventas, 0) AS total_ventas,
    COALESCE(pagos.total_pagos, 0) AS total_pagos,
    COALESCE(notas_credito.total_notas_credito, 0) AS total_notas_credito,
    COALESCE(saldo_inicial.saldo_inicial, 0) AS saldo_inicial
FROM zona z
LEFT JOIN (
    SELECT c.zona_id, SUM(v.total_con_descuento) AS total_ventas
    FROM venta v
    JOIN cliente c ON v.cliente_id = c.id
    WHERE v.estado = 1 AND c.estado = 1 AND v.fecha_venta >= ? AND v.fecha_venta < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY c.zona_id
) AS ventas ON z.id = ventas.zona_id
LEFT JOIN (
    SELECT c.zona_id, SUM(p.monto) AS total_pagos
    FROM pagos p
    JOIN cliente c ON p.cliente_id = c.id
    WHERE p.estado = 1 AND c.estado = 1 AND p.fecha_pago >= ? AND p.fecha_pago < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY c.zona_id
) AS pagos ON z.id = pagos.zona_id
LEFT JOIN (
    SELECT c.zona_id, SUM(dnc.subTotal) AS total_notas_credito
    FROM notascredito nc
    JOIN cliente c ON nc.cliente_id = c.id
    LEFT JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
    WHERE nc.estado = 1 AND c.estado = 1 AND nc.fecha >= ? AND nc.fecha < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY c.zona_id
) AS notas_credito ON z.id = notas_credito.zona_id
LEFT JOIN (
    SELECT c.zona_id, SUM(cc.saldo_cierre) AS saldo_inicial
    FROM cierre_cuenta cc
    JOIN cliente c ON cc.cliente_id = c.id
    WHERE cc.fecha_corte = '2026-01-01' AND c.estado = 1
    GROUP BY c.zona_id
) AS saldo_inicial ON z.id = saldo_inicial.zona_id
ORDER BY z.id;
    `;

    const [rows] = await db.query(query, [
      fecha_inicio,
      fecha_fin,
      fecha_inicio,
      fecha_fin,
      fecha_inicio,
      fecha_fin,
    ]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getLineasStock = async (connection = null) => {
  try {
    const conn = connection || db;
    const query = "select linea_id from lineas_stock";
    const [lineas] = await conn.query(query);
    return lineas;
  } catch (err) {
    throw err;
  }
};
const getArticuloById = async (articulo_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = "SELECT * FROM articulo WHERE id = ?";
    const [rows] = await conn.query(query, [articulo_id]);
    if (rows.length === 0) {
      throw new Error("Artículo no encontrado");
    }
    return rows[0];
  } catch (err) {
    throw new Error("Error al obtener el artículo: " + err.message);
  }
};

const editarVenta = async (
  ventaId,
  articulo_id,
  cantidad,
  precio_monotributista, // viene del front
  isGift = false,
  options = {}
) => {
  try {
    const { connection = null, skipCierreRecalculo = false } = options;
    const conn = connection || db;
    // 1. Obtener líneas controladas
    const lineas = await getLineasStock(conn);
    const lineasControladas = lineas.map((l) => l.linea_id);

    // 2. Verificar si el artículo pertenece a esas líneas
    const articulo = await getArticuloById(articulo_id, conn);
    const controlaStock = lineasControladas.includes(articulo.linea_id);

    if (controlaStock) {
      const stockCheck = await checkStock(articulo_id, cantidad, conn);
      if (!stockCheck.disponible) {
        const err = new Error(
          `No hay suficiente stock para el artículo ${stockCheck.nombre}`
        );
        err.status = 400;
        throw err;
      }
    }

    // 3. Obtener información de la venta directamente de la tabla venta
    const [ventaRows] = await conn.query(
      "SELECT id, cliente_id, fecha_venta, descuento, total, total_con_descuento FROM venta WHERE id = ?",
      [ventaId]
    );
    if (!ventaRows || ventaRows.length === 0) {
      throw new Error("Venta no encontrada");
    }
    const venta = ventaRows[0];

    // 4. Precio base y precio final
    const precioBaseArticulo = Number(articulo.precio_monotributista) || 0;

    // 👉 FORZAMOS a usar SIEMPRE el precio que viene del front
    const precioFinalCrudo =
      precio_monotributista !== null && precio_monotributista !== undefined
        ? Number(precio_monotributista)
        : precioBaseArticulo;

    if (isNaN(precioFinalCrudo)) {
      throw new Error("Precio final inválido");
    }

    const precioFinal = precioFinalCrudo;

    // 5. Subtotal (si es regalo, sub_total = 0)
    const subTotal = isGift ? 0 : precioFinal * cantidad;

    const insertDetalleQuery = `
      INSERT INTO detalle_venta 
      (articulo_id, venta_id, costo, cantidad, precio_monotributista, fecha, sub_total)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `;
    await conn.query(insertDetalleQuery, [
      articulo_id,
      ventaId,
      articulo.costo ?? 0,
      cantidad,
      precioFinal, // 👈 acá usamos SIEMPRE el del front
      subTotal,
    ]);

    // 7. Recalcular totales de la venta
    const [detalles] = await conn.query(
      "SELECT sub_total FROM detalle_venta WHERE venta_id = ?",
      [ventaId]
    );
    const total = detalles.reduce((acc, d) => acc + Number(d.sub_total), 0);

    const totalConDescuento =
      total - total * (Number(venta.descuento) / 100);

    const updateVentaQuery = `
      UPDATE venta 
      SET total = ?, total_con_descuento = ?
      WHERE id = ?
    `;
    await conn.query(updateVentaQuery, [total, totalConDescuento, ventaId]);

    // Recalcular cierre de cuenta si la venta está dentro del período del cierre
    const FECHA_CORTE_DEFAULT = "2026-01-01";
    const fechaVentaDate = new Date(venta.fecha_venta);
    const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
    
    
    if (!skipCierreRecalculo && fechaVentaDate < fechaCorteDate && venta.cliente_id) {
      try {
        const resultado = await cierreCuentaModel.recalcularCierreCliente(venta.cliente_id, FECHA_CORTE_DEFAULT);
      } catch (cierreErr) {
        console.error("[editarVenta] Error al recalcular cierre de cuenta:", cierreErr);
      }
    } else {
    }

    // 8. Descontar stock si corresponde
    if (controlaStock) {
      await descontarStock(articulo_id, cantidad, conn);
    }

    // 9. Log
    await updateLogVenta(ventaId, articulo_id, cantidad, conn);

    // 10. Devolver la venta actualizada
    const ventaFinal = await getVentaByID(ventaId, conn);
    const [detallesFinal] = await conn.query(
      "SELECT * FROM detalle_venta WHERE venta_id = ?",
      [ventaId]
    );

    return {
      venta: ventaFinal[0],
      detalles: detallesFinal,
      cierreRecalculoInfo: {
        cliente_id: venta.cliente_id,
        fecha_venta: venta.fecha_venta,
      },
    };
  } catch (error) {
    console.error("Error al editar la venta:", error);
    throw error;
  }
};

const eliminarDetalleVenta = async (detalleVentaId, options = {}) => {
  try {
    const { connection = null, skipCierreRecalculo = false } = options;
    const conn = connection || db;
    // 1. Buscar el detalle antes de eliminarlo
    const [detalleRows] = await conn.query(
      "SELECT * FROM detalle_venta WHERE id = ?",
      [detalleVentaId]
    );
    if (detalleRows.length === 0) {
      const err = new Error("Detalle de venta no encontrado");
      err.status = 404;
      throw err;
    }
    const detalle = detalleRows[0];
    const ventaId = detalle.venta_id;

    // 2. Eliminar el detalle
    await conn.query("DELETE FROM detalle_venta WHERE id = ?", [detalleVentaId]);

    // 3. Recalcular totales de la venta
    const [detalles] = await conn.query(
      "SELECT sub_total FROM detalle_venta WHERE venta_id = ?",
      [ventaId]
    );

    let total = 0;
    if (detalles.length > 0) {
      total = detalles.reduce((acc, d) => acc + Number(d.sub_total), 0);
    }

    // obtener descuento de la venta
    const [ventaRows] = await conn.query(
      "SELECT descuento, total_con_descuento FROM venta WHERE id = ?",
      [ventaId]
    );
    const descuento = ventaRows[0]?.descuento || 0;
    const totalAnterior = Number(ventaRows[0]?.total_con_descuento || 0);

    const totalConDescuento = total - total * (Number(descuento) / 100);


    // 4. Actualizar la venta
    await conn.query(
      "UPDATE venta SET total = ?, total_con_descuento = ? WHERE id = ?",
      [total, totalConDescuento, ventaId]
    );

    // Recalcular cierre de cuenta si la venta está dentro del período del cierre
    const FECHA_CORTE_DEFAULT = "2026-01-01";
    const [ventaInfo] = await conn.query("SELECT cliente_id, fecha_venta FROM venta WHERE id = ?", [ventaId]);
    if (!skipCierreRecalculo && ventaInfo.length > 0) {
      const fechaVentaDate = new Date(ventaInfo[0].fecha_venta);
      const fechaCorteDate = new Date(FECHA_CORTE_DEFAULT);
      
      
      if (fechaVentaDate < fechaCorteDate && ventaInfo[0].cliente_id) {
        try {
          const resultado = await cierreCuentaModel.recalcularCierreCliente(ventaInfo[0].cliente_id, FECHA_CORTE_DEFAULT);
        } catch (cierreErr) {
          console.error("[eliminarDetalleVenta] Error al recalcular cierre de cuenta:", cierreErr);
        }
      } else {
      }
    }

    // 5. Si controlaba stock, devolver stock con SQL directo
    const lineas = await getLineasStock(conn);
    const lineasControladas = lineas.map((l) => l.linea_id);

    const articulo = await getArticuloById(detalle.articulo_id, conn);
    if (lineasControladas.includes(articulo.linea_id)) {
      await conn.query("UPDATE articulo SET stock = stock + ? WHERE id = ?", [
        detalle.cantidad,
        detalle.articulo_id,
      ]);
    }

    // 6. Devolver venta actualizada
    const [ventaFinal] = await conn.query("SELECT * FROM venta WHERE id = ?", [
      ventaId,
    ]);
    const [detallesFinal] = await conn.query(
      "SELECT * FROM detalle_venta WHERE venta_id = ?",
      [ventaId]
    );

    return {
      venta: ventaFinal[0],
      detalles: detallesFinal,
      cierreRecalculoInfo: ventaInfo?.[0]
        ? { cliente_id: ventaInfo[0].cliente_id, fecha_venta: ventaInfo[0].fecha_venta }
        : null,
    };
  } catch (err) {
    throw err;
  }
};
const getVentasPorFecha = async (fecha_inicio, fecha_fin) => {
  try {
    const query = queriesVentas.getVentasPorFecha;
    const [rows] = await db.query(query, [fecha_inicio, fecha_fin]);
    return rows;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllVentas,
  addVenta,
  checkStock,
  descontarStock,
  updateLogVenta,
  updateLogVentaBatch,
  addDetalleVenta,
  addDetalleVentaBatch,
  dropVenta,
  updateVentas,
  getVentasByClientes,
  getVentasByZona,
  getVentasByProducto,
  getVentaByID,
  getTotal,
  updateVentaTotal,
  getVentasByClientesxFecha,
  getResumenZonas,
  getLineasStock,
  getResumenCliente,
  editarVenta,
  eliminarDetalleVenta,
  getVentasPorFecha,
  updateStockBatch,
};
