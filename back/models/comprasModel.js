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
const addCompra = async (nro_compra, total, porcentaje_aumento_global = null, porcentaje_aumento_costo_global = null, porcentaje_aumento_precio_global = null) => {
  try {
    const query = queriesCompras.addCompra;
    const [result] = await db.query(query, [nro_compra, total, porcentaje_aumento_global, porcentaje_aumento_costo_global, porcentaje_aumento_precio_global]);
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
  porcentaje_aumento_precio = null
) => {
  try {
    const query = queriesCompras.addDetalleCompra;
    await db.query(query, [
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
const updateStock = async (articulo_id, cantidad) => {
  try {
    const query = queriesCompras.updateStock;
    await db.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
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
const updateTotalCompra = async (compra_id, total) => {
  try {
    const query = queriesCompras.updateTotalesCompra;
    await db.query(query, [total, compra_id]);
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
  porcentaje_aumento_precio = null
) => {
  try {
    console.log(new_costo, new_precio_monotributista, sub_total, cantidad, ID, porcentaje_aumento_costo, porcentaje_aumento_precio);
    const query = queriesCompras.updateDetalleCompra;
    await db.query(query, [
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
  new_precio_monotributista
) => {
  try {
    const query = queriesCompras.updateCostoArticulo;
    await db.query(query, [new_costo, new_precio_monotributista, articulo_id]);
  } catch (err) {
    throw err;
  }
};
const getDetalleCompra = async (compra_id) => {
  try {
    const query = queriesCompras.getDetalleCompra;
    const [rows] = await db.query(query, [compra_id]);
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

const deleteCompra = async (compra_id) => {
  try {
    // Primero obtener los detalles para revertir el stock si es necesario
    const detalles = await getDetalleCompra(compra_id);
    console.log("Detalles obtenidos para eliminar:", detalles);
    
    if (detalles.length > 0) {
      // Obtener las líneas que controlan stock
      const lineasStock = await getLineasStock();
      const lineas = lineasStock.map(l => Number(l.linea_id));
      console.log("Líneas que controlan stock:", lineas);
      
      // Revertir el stock si es necesario
      for (const detalle of detalles) {
        const lineaId = Number(detalle.linea_id);
        const articuloId = Number(detalle.articulo_id);
        const cantidad = Number(detalle.cantidad);
        
        console.log(`Procesando detalle - Artículo ID: ${articuloId}, Línea ID: ${lineaId}, Cantidad: ${cantidad}`);
        
        // Verificar si la línea del artículo controla stock (convertir a número para comparación)
        if (lineaId && lineas.includes(lineaId)) {
          // Restar el stock (pasar cantidad negativa para que la query stock = stock + (-cantidad) reste)
          await updateStock(articuloId, -cantidad);
          console.log(`✓ Stock revertido: Artículo ${articuloId}, cantidad restada: ${cantidad}`);
        } else {
          console.log(`✗ Stock NO revertido: Línea ${lineaId} no controla stock o no está en la lista`);
        }
      }
    }
    
    // Eliminar los detalles de compra
    const deleteDetalleQuery = queriesCompras.deleteDetalleCompra;
    await db.query(deleteDetalleQuery, [compra_id]);
    console.log("Detalles de compra eliminados");
    
    // Eliminar la compra
    const deleteCompraQuery = queriesCompras.deleteCompra;
    await db.query(deleteCompraQuery, [compra_id]);
    console.log("Compra eliminada");
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
const getLineasStock = async () => {
  try {
    const query = "select linea_id from lineas_stock"
    const [lineas] = await db.query(query)
    return lineas
  } catch (err) {
    throw err
  }
}
module.exports = {
  getAllCompras,
  addCompra,
  addDetalleCompra,
  updateStock,
  getComprasByProveedor,
  getCompraByID,
  updateTotalCompra,
  updateDetalleCompra,
  updateCostoArticulo,
  getDetalleCompra,
  getDetalleCompraById,
  dropCompra,
  deleteCompra,
  upCompra,
  getLineasStock
};
