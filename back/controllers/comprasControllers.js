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
    const { proveedor_id, nro_compra, total, detalles } = req.body;

    const compra_id = await comprasModel.addCompra(
      proveedor_id,
      nro_compra,
      total
    );

    for (const detalle of detalles) {
      await comprasModel.addDetalleCompra(
        compra_id,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.costo
      );
      await comprasModel.updateStock(detalle.articulo_id, detalle.cantidad); // Actualiza el stock sumando la cantidad
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
        proveedor: detalleCompra[0].proveedor,
        nro_compra: detalleCompra[0].nro_compra,
        fecha_compra: detalleCompra[0].fecha_compra,
        total: detalleCompra[0].total,
        detalles: detalleCompra.map((detalle) => ({
          id: detalle.articulo_id,
          nombre: detalle.nombre_articulo,
          costo: detalle.costo,
          cantidad: detalle.cantidad,
          subtotal: detalle.subtotal,
        })),
      };
      res.json(data);
    }
  } catch (error) {
    console.error("Error al obtener la compra por ID:", error);
    res.status(500).json({ error: "Error al obtener la compra por ID" });
  }
};

module.exports = {
  getAllCompras,
  addCompra,
  getComprasByProveedor,
  getCompraByID,
};
