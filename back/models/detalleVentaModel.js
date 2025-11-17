const db = require("../database");
const queriesDetalleVenta = require("../querys/queriesDetalleVentas");

const getDetalleVentaById = async (ID) => {
  try {
    const query = queriesDetalleVenta.getDetalleVentaById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateDetalleVenta = async (
  ID,
  new_precio,
  cantidad,
  sub_total,
  aumento_porcentaje,
  modoEdicion
) => {
  try {
    // Buscar precio base del artículo
    const [row] = await db.query(
      `
      SELECT a.precio_monotributista AS precio_base
      FROM detalle_venta dv
      JOIN articulo a ON dv.articulo_id = a.id
      WHERE dv.id = ?
      `,
      [ID]
    );

    const precioBase = Number(row[0].precio_base);
    let aumentoFinal = 0;

    if (modoEdicion === "porcentaje" && aumento_porcentaje !== null) {
      aumentoFinal = Number(aumento_porcentaje);
    } else {
      // modo manual: calcular aumento solo si realmente subió
      if (new_precio >= precioBase && precioBase > 0) {
        aumentoFinal = ((new_precio - precioBase) / precioBase) * 100;
      }
    }

    const query = `
      UPDATE detalle_venta
      SET precio_monotributista = ?, 
          cantidad = ?, 
          sub_total = ?, 
          aumento_porcentaje = ?
      WHERE id = ?
    `;

    await db.query(query, [new_precio, cantidad, sub_total, aumentoFinal, ID]);
  } catch (err) {
    throw err;
  }
};

const getDetalleVenta = async (venta_id) => {
  try {
    const query = queriesDetalleVenta.getDetalleVenta;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getPorcentage = async (venta_id) => {
  try {
    const query = queriesDetalleVenta.getPorcentage;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateTotalesVenta = async (venta_id, total, totalConDescuento) => {
  try {
    const query = `
      UPDATE venta
      SET total = ?, total_con_descuento = ?
      WHERE id = ?;
    `;
    await db.query(query, [total, totalConDescuento, venta_id]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getDetalleVentaById,
  updateDetalleVenta,
  getDetalleVenta,
  getPorcentage,
  updateTotalesVenta,
};
