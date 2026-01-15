const comprasModel = require("../models/comprasModel");

const getAllCompras = async (req, res) => {
  try {
    const compras = await comprasModel.getAllCompras();
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addCompra = async (req, res) => {
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
    const compra_id = await comprasModel.addCompra(
      nro_compra,
      total,
      porcentaje_aumento_global || null,
      porcentaje_aumento_costo_global || null,
      porcentaje_aumento_precio_global || null
    );
    const lineasStock = await comprasModel.getLineasStock();
    const lineas = lineasStock.map(l => Number(l.linea_id));
    console.log("Líneas que controlan stock:", lineas);

    for (const detalle of detalles) {
      sub_total = Math.round(detalle.cantidad * detalle.costo);
      Math.round((total += sub_total));
      await comprasModel.addDetalleCompra(
        compra_id,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.costo,
        detalle.precio_monotributista,
        sub_total,
        detalle.porcentaje_aumento || null,
        detalle.porcentaje_aumento_costo || null,
        detalle.porcentaje_aumento_precio || null
      );
      
      // Actualizar el costo y precio_monotributista del artículo con los nuevos valores
      await comprasModel.updateCostoArticulo(
        detalle.articulo_id,
        detalle.costo,
        detalle.precio_monotributista
      );
      console.log(`✓ Precios actualizados: Artículo ${detalle.articulo_id}, Costo: ${detalle.costo}, Precio Monotributista: ${detalle.precio_monotributista}`);
      
      // Verificar si la línea del artículo controla stock (convertir a número para comparación)
      const lineaId = Number(detalle.linea_id);
      if (lineaId && lineas.includes(lineaId)) {
        await comprasModel.updateStock(detalle.articulo_id, detalle.cantidad); // Actualiza el stock sumando la cantidad
        console.log(`✓ Stock actualizado: Artículo ${detalle.articulo_id}, cantidad agregada: ${detalle.cantidad}`);
      } else {
        console.log(`✗ Stock NO actualizado: Línea ${lineaId} no controla stock o no está en la lista`);
      }
      
      await comprasModel.updateTotalCompra(compra_id, total);
    }

    res.status(201).json({ message: "Compra agregada con éxito" });
  } catch (error) {
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

    // Actualizamos el detalle de la compra
    await comprasModel.updateDetalleCompra(
      ID,
      new_costo,
      new_precio_monotributista,
      cantidad,
      sub_total,
      porcentaje_aumento_costo || null,
      porcentaje_aumento_precio || null
    );

    // Actualizamos el costo y precio del artículo en la tabla articulo
    await comprasModel.updateCostoArticulo(
      articulo_id,
      new_costo,
      new_precio_monotributista
    );

    // Recalculamos los totales de la compra
    await recalcularTotalesCompra(compra_id);

    res.status(200).json({
      message:
        "Detalle de compra actualizado, artículo modificado y totales recalculados correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el detalle de compra" });
  }
};

const recalcularTotalesCompra = async (compra_id) => {
  try {
    // Obtener todos los detalles de la compra
    const detalles = await comprasModel.getDetalleCompra(compra_id);
    // Inicializamos el total
    let total = 0;

    // Calculamos el total sumando costo * cantidad de cada detalle
    detalles.forEach((detalle) => {
      total += Math.round(detalle.costo * detalle.cantidad);
    });

    // Actualizamos el total en la tabla compra
    await comprasModel.updateTotalCompra(compra_id, total);
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
  try {
    const compra_id = req.params.ID;
    await comprasModel.deleteCompra(compra_id);
    res.json({ message: "Compra eliminada permanentemente" });
  } catch (error) {
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
