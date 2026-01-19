const comprasModel = require("../models/comprasModel");
const db = require("../database");

const getAllCompras = async (req, res) => {
  try {
    const compras = await comprasModel.getAllCompras();
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addCompra = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const { 
      nro_compra, 
      detalles, 
      porcentaje_aumento_global,
      porcentaje_aumento_costo_global,
      porcentaje_aumento_precio_global
    } = req.body;
    let total = 0;
    let sub_total = 0;

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    const compra_id = await comprasModel.addCompra(
      nro_compra,
      total,
      porcentaje_aumento_global || null,
      porcentaje_aumento_costo_global || null,
      porcentaje_aumento_precio_global || null,
      connection
    );
    const lineasStock = await comprasModel.getLineasStock(connection);
    const lineas = lineasStock.map(l => Number(l.linea_id));
    const detalleRows = [];
    const stockMap = new Map();
    const costoMap = new Map();

    for (const detalle of detalles) {
      sub_total = Math.round(detalle.cantidad * detalle.costo);
      Math.round((total += sub_total));

      detalleRows.push([
        compra_id,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.costo,
        detalle.precio_monotributista,
        sub_total,
        detalle.porcentaje_aumento || null,
        detalle.porcentaje_aumento_costo || null,
        detalle.porcentaje_aumento_precio || null,
      ]);

      costoMap.set(detalle.articulo_id, {
        costo: detalle.costo,
        precio_monotributista: detalle.precio_monotributista,
      });

      const lineaId = Number(detalle.linea_id);
      if (lineaId && lineas.includes(lineaId)) {
        const current = stockMap.get(detalle.articulo_id) || 0;
        stockMap.set(detalle.articulo_id, current + Number(detalle.cantidad));
      }
    }

    await comprasModel.addDetalleCompraBatch(detalleRows, connection);

    if (costoMap.size > 0) {
      const updates = Array.from(costoMap.entries()).map(
        ([articulo_id, values]) => ({
          articulo_id,
          costo: values.costo,
          precio_monotributista: values.precio_monotributista,
        })
      );
      await comprasModel.updateCostoArticuloBatch(updates, connection);
    }

    if (stockMap.size > 0) {
      const updates = Array.from(stockMap.entries()).map(
        ([articulo_id, cantidad]) => ({ articulo_id, cantidad })
      );
      await comprasModel.updateStockBatch(updates, connection);
    }

    await comprasModel.updateTotalCompra(compra_id, total, connection);

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    res.status(201).json({ message: "Compra agregada con éxito" });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de addCompra:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error(error);
    res.status(500).json({ error: "Error al agregar la compra" });
  }
};

const getComprasByProveedor = async (req, res) => {
  try {
    const proveedor_id = req.params.ID;
    const compras = await comprasModel.getComprasByProveedor(proveedor_id);
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getCompraByID = async (req, res) => {
  try {
    const compra_id = req.params.ID;
    const detalleCompra = await comprasModel.getCompraByID(compra_id);
    if (detalleCompra.length <= 0) {
      return res.status(404).json({ error: "Compra no encontrada" });
    } else {
      let data = {
        nro_compra: detalleCompra[0].nro_compra,
        fecha_compra: detalleCompra[0].fecha_compra,
        compra_id: detalleCompra[0].compra_id,
        total: detalleCompra[0].total,
        detalles: detalleCompra.map((detalle) => ({
          articulo_id: detalle.articulo_id,
          detalle_compra_id: detalle.detalle_compra_id,
          nombre:
            detalle.nombre_articulo +
            " " +
            detalle.medicion_articulo +
            " " +
            detalle.linea_articulo +
            " " +
            detalle.sublinea_articulo,
          costo: detalle.costo,
          precio_monotributista: detalle.precio_monotributista,
          cantidad: detalle.cantidad,
          subtotal: detalle.subtotal,
          porcentaje_aumento_costo: detalle.porcentaje_aumento_costo || null,
          porcentaje_aumento_precio: detalle.porcentaje_aumento_precio || null,
        })),
      };
      res.json(data);
    }
  } catch (error) {
    console.error("Error al obtener la compra por ID:", error);
    res.status(500).json({ error: "Error al obtener la compra por ID" });
  }
};
const getDetalleCompraById = async (req, res) => {
  try {
    const ID = req.params.id;
    const compra = await comprasModel.getDetalleCompraById(ID);
    res.json(compra[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los detalles de venta" });
  }
};

const updateDetalleCompra = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const {
      ID,
      new_costo,
      new_precio_monotributista,
      cantidad,
      compra_id,
      articulo_id,
      porcentaje_aumento_costo,
      porcentaje_aumento_precio,
    } = req.body;
    const sub_total = new_costo * cantidad;

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    // Actualizamos el detalle de la compra
    await comprasModel.updateDetalleCompra(
      ID,
      new_costo,
      new_precio_monotributista,
      cantidad,
      sub_total,
      porcentaje_aumento_costo || null,
      porcentaje_aumento_precio || null,
      connection
    );

    // Actualizamos el costo y precio del artículo en la tabla articulo
    await comprasModel.updateCostoArticulo(
      articulo_id,
      new_costo,
      new_precio_monotributista,
      connection
    );

    // Recalculamos los totales de la compra
    await recalcularTotalesCompra(compra_id, connection);

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    res.status(200).json({
      message:
        "Detalle de compra actualizado, artículo modificado y totales recalculados correctamente",
    });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de updateDetalleCompra:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de compra" });
  }
};

const recalcularTotalesCompra = async (compra_id, connection = null) => {
  try {
    // Obtener todos los detalles de la compra
    const detalles = await comprasModel.getDetalleCompra(compra_id, connection);
    // Inicializamos el total
    let total = 0;

    // Calculamos el total sumando costo * cantidad de cada detalle
    detalles.forEach((detalle) => {
      total += Math.round(detalle.costo * detalle.cantidad);
    });

    // Actualizamos el total en la tabla compra
    await comprasModel.updateTotalCompra(compra_id, total, connection);
  } catch (err) {
    throw err;
  }
};
const dropCompra = async (req, res) => {
  try {
    const compra_id = req.params.ID;
    await comprasModel.dropCompra(compra_id);
    res.json({ message: "Compra eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la compra" });
  }
};

const deleteCompra = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const compra_id = req.params.ID;
    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    await comprasModel.deleteCompra(compra_id, connection);

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;

    res.json({ message: "Compra eliminada permanentemente" });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de deleteCompra:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la compra" });
  }
};
const upCompra = async (req, res) => {
  try {
    const compra_id = req.params.ID;
    await comprasModel.upCompra(compra_id);
    res.json({ message: "Compra actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la compra" });
  }
};
module.exports = {
  getAllCompras,
  addCompra,
  getComprasByProveedor,
  getCompraByID,
  updateDetalleCompra,
  getDetalleCompraById,
  dropCompra,
  deleteCompra,
  upCompra,
};
