const db = require("../database");
const queriesCompras = require("../querys/queriesCompras");

const getAllCompras = async () => {
  try {
    const query = queriesCompras.getAllCompras;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addCompra = async (
  nro_compra,
  total,
  porcentaje_aumento_global = null,
  porcentaje_aumento_costo_global = null,
  porcentaje_aumento_precio_global = null,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.addCompra;
    const [result] = await conn.query(query, [
      nro_compra,
      total,
      porcentaje_aumento_global,
      porcentaje_aumento_costo_global,
      porcentaje_aumento_precio_global,
    ]);
    return result.insertId; // Devuelve el ID de la compra recién insertada
  } catch (err) {
    throw err;
  }
};

const addDetalleCompra = async (
  compra_id,
  articulo_id,
  cantidad,
  costo,
  precio_monotributista,
  sub_total,
  porcentaje_aumento = null,
  porcentaje_aumento_costo = null,
  porcentaje_aumento_precio = null,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.addDetalleCompra;
    await conn.query(query, [
      compra_id,
      articulo_id,
      cantidad,
      costo,
      precio_monotributista,
      sub_total,
      porcentaje_aumento,
      porcentaje_aumento_costo,
      porcentaje_aumento_precio,
    ]);
  } catch (err) {
    throw err;
  }
};
const addDetalleCompraBatch = async (rows, connection = null) => {
  if (!rows || rows.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const query =
      "INSERT INTO detalle_compra (compra_id, articulo_id, cantidad, costo, precio_monotributista, sub_total, porcentaje_aumento, porcentaje_aumento_costo, porcentaje_aumento_precio) VALUES ?";
    await conn.query(query, [rows]);
  } catch (err) {
    throw err;
  }
};
const updateStock = async (articulo_id, cantidad, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.updateStock;
    await conn.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
  } catch (err) {
    throw err;
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
  } catch (err) {
    throw err;
  }
};

const getComprasByProveedor = async (proveedor_id) => {
  try {
    const query = queriesCompras.getComprasByProveedor;
    const [rows] = await db.query(query, [proveedor_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getCompraByID = async (compra_id) => {
  try {
    const query = queriesCompras.getCompraByID;
    const [rows] = await db.query(query, [compra_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const updateTotalCompra = async (compra_id, total, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.updateTotalesCompra;
    await conn.query(query, [total, compra_id]);
  } catch (err) {
    throw err;
  }
};
const updateDetalleCompra = async (
  ID,
  new_costo,
  new_precio_monotributista,
  cantidad,
  sub_total,
  porcentaje_aumento_costo = null,
  porcentaje_aumento_precio = null,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.updateDetalleCompra;
    await conn.query(query, [
      new_costo,
      new_precio_monotributista,
      cantidad,
      sub_total,
      porcentaje_aumento_costo,
      porcentaje_aumento_precio,
      ID,
    ]);
  } catch (err) {
    throw err;
  }
};
const updateCostoArticulo = async (
  articulo_id,
  new_costo,
  new_precio_monotributista,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.updateCostoArticulo;
    await conn.query(query, [new_costo, new_precio_monotributista, articulo_id]);
  } catch (err) {
    throw err;
  }
};
const updateCostoArticuloBatch = async (updates, connection = null) => {
  if (!updates || updates.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const casesCosto = updates.map(() => "WHEN ? THEN ?").join(" ");
    const casesPrecio = updates.map(() => "WHEN ? THEN ?").join(" ");
    const ids = updates.map((u) => u.articulo_id);
    const params = [];
    updates.forEach((u) => {
      params.push(u.articulo_id, u.costo);
    });
    updates.forEach((u) => {
      params.push(u.articulo_id, u.precio_monotributista);
    });
    params.push(...ids);
    const query = `UPDATE articulo SET 
      costo = CASE id ${casesCosto} ELSE costo END,
      precio_monotributista = CASE id ${casesPrecio} ELSE precio_monotributista END
      WHERE id IN (${ids.map(() => "?").join(",")})`;
    await conn.query(query, params);
  } catch (err) {
    throw err;
  }
};
const getDetalleCompra = async (compra_id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesCompras.getDetalleCompra;
    const [rows] = await conn.query(query, [compra_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getDetalleCompraById = async (ID) => {
  try {
    const query = queriesCompras.getDetalleCompraById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const dropCompra = async (compra_id) => {
  try {
    const query = queriesCompras.dropCompra;
    await db.query(query, [compra_id]);
  } catch (err) {
    throw err;
  }
};

const deleteCompra = async (compra_id, connection = null) => {
  try {
    const conn = connection || db;
    // Primero obtener los detalles para revertir el stock si es necesario
    const detalles = await getDetalleCompra(compra_id, conn);
    
    if (detalles.length > 0) {
      // Obtener las líneas que controlan stock
      const lineasStock = await getLineasStock(conn);
      const lineas = lineasStock.map(l => Number(l.linea_id));
      const stockMap = new Map();
      for (const detalle of detalles) {
        const lineaId = Number(detalle.linea_id);
        const articuloId = Number(detalle.articulo_id);
        const cantidad = Number(detalle.cantidad);
        if (lineaId && lineas.includes(lineaId)) {
          const current = stockMap.get(articuloId) || 0;
          stockMap.set(articuloId, current - cantidad);
        }
      }
      if (stockMap.size > 0) {
        const updates = Array.from(stockMap.entries()).map(
          ([articulo_id, cantidad]) => ({ articulo_id, cantidad })
        );
        await updateStockBatch(updates, conn);
      }
    }
    
    // Eliminar los detalles de compra
    const deleteDetalleQuery = queriesCompras.deleteDetalleCompra;
    await conn.query(deleteDetalleQuery, [compra_id]);
    
    // Eliminar la compra
    const deleteCompraQuery = queriesCompras.deleteCompra;
    await conn.query(deleteCompraQuery, [compra_id]);
  } catch (err) {
    console.error("Error en deleteCompra:", err);
    throw err;
  }
};
const upCompra = async (compra_id) => {
  try {
    const query = queriesCompras.upCompra;
    await db.query(query, [compra_id]);
  } catch (err) {
    throw err;
  }
};
const getLineasStock = async (connection = null) => {
  try {
    const conn = connection || db;
    const query = "select linea_id from lineas_stock"
    const [lineas] = await conn.query(query)
    return lineas
  } catch (err) {
    throw err
  }
}
module.exports = {
  getAllCompras,
  addCompra,
  addDetalleCompra,
  addDetalleCompraBatch,
  updateStock,
  updateStockBatch,
  getComprasByProveedor,
  getCompraByID,
  updateTotalCompra,
  updateDetalleCompra,
  updateCostoArticulo,
  updateCostoArticuloBatch,
  getDetalleCompra,
  getDetalleCompraById,
  dropCompra,
  deleteCompra,
  upCompra,
  getLineasStock
};
