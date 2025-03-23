const db = require("../database");
const queriesVentas = require("../querys/queriesVentas");

const getAllVentas = async () => {
  try {
    const query = queriesVentas.getAllVentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addVenta = async (cliente_id, nroVenta, zona_id, descuento) => {
  try {
    const query = queriesVentas.addVenta;
    const [result] = await db.query(query, [
      cliente_id,
      nroVenta,
      zona_id,
      descuento,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

const checkStock = async (articulo_id, cantidad) => {
  try {
    const [rows] = await db.query(queriesVentas.checkStock, [articulo_id]);
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

const descontarStock = async (articulo_id, cantidad) => {
  try {
    await db.query(queriesVentas.descontarStock, [cantidad, articulo_id]);
  } catch (error) {
    throw new Error("Error al descontar el stock: " + error.message);
  }
};

const updateLogVenta = async (cliente_id, articulo_id, cantidad) => {
  try {
    await db.query(queriesVentas.updateLogVenta, [
      cliente_id,
      articulo_id,
      cantidad,
    ]);
  } catch (error) {
    throw new Error("Error al registrar en el log de ventas: " + error.message);
  }
};

const addDetalleVenta = async (
  ventaId,
  articulo_id,
  costo,
  cantidad,
  precio_monotributista,
  sub_total
) => {
  try {
    await db.query(queriesVentas.addDetalleVenta, [
      ventaId,
      articulo_id,
      costo,
      cantidad,
      precio_monotributista,
      sub_total,
    ]);
  } catch (error) {
    throw new Error("Error al agregar el detalle de venta: " + error.message);
  }
};

const dropVenta = async (ID) => {
  try {
    const [detalles] = await db.query(queriesVentas.getDetallesVenta, [ID]);

    for (const detalle of detalles) {
      await db.query(queriesVentas.devolverStock, [
        detalle.cantidad,
        detalle.articulo_id,
      ]);
    }

    await db.query(queriesVentas.dropVenta, [ID]);
  } catch (err) {
    throw err;
  }
};

const upVenta = async (ID) => {
  try {
    const [detalles] = await db.query(queriesVentas.getDetallesVenta, [ID]);

    for (const detalle of detalles) {
      await db.query(queriesVentas.restarStock, [
        detalle.cantidad,
        detalle.articulo_id,
      ]);
    }

    await db.query(queriesVentas.upVenta, [ID]);
  } catch (err) {
    throw err;
  }
};

const updateVentas = async (producto_id, cantidad, cliente_id, zona_id, ID) => {
  try {
    const query = queriesVentas.updateVentas;
    await db.query(query, [producto_id, cantidad, cliente_id, zona_id, ID]);
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

const getVentaByID = async (venta_id) => {
  try {
    const query = queriesVentas.getVentaByID;
    const [rows] = await db.query(query, [venta_id]);
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
const updateVentaTotal = async (total, total_con_descuento, ventaId) => {
  const query = queriesVentas.updateVentaTotal;
  await db.query(query, [total, total_con_descuento, ventaId]);
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
    COALESCE(notas_credito.total_notas_credito, 0) AS total_notas_credito
FROM zona z
LEFT JOIN (
    SELECT c.zona_id, SUM(v.total_con_descuento) AS total_ventas
    FROM venta v
    JOIN cliente c ON v.cliente_id = c.id
    WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
    GROUP BY c.zona_id
) AS ventas ON z.id = ventas.zona_id
LEFT JOIN (
    SELECT c.zona_id, SUM(p.monto) AS total_pagos
    FROM pagos p
    JOIN cliente c ON p.cliente_id = c.id
    WHERE DATE(p.fecha_pago) BETWEEN ? AND ?
    GROUP BY c.zona_id
) AS pagos ON z.id = pagos.zona_id
LEFT JOIN (
    SELECT c.zona_id, SUM(dnc.subTotal) AS total_notas_credito
    FROM notasCredito nc
    JOIN cliente c ON nc.cliente_id = c.id
    LEFT JOIN detalleNotaCredito dnc ON nc.id = dnc.notaCredito_id
    WHERE nc.estado = 1
    GROUP BY c.zona_id
) AS notas_credito ON z.id = notas_credito.zona_id
ORDER BY z.id;
    `;

    const [rows] = await db.query(query, [
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
const getLineasStock = async () => {
  try {
    const query = "select linea_id from lineas_stock";
    const [lineas] = await db.query(query);
    return lineas;
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
  addDetalleVenta,
  dropVenta,
  upVenta,
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
};
