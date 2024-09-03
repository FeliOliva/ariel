const ventasModel = require("../models/ventasModel");

const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasModel.getAllVentas();
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener todas las ventas:", error);
    res.status(500).json({ error: "Error al obtener todas las ventas" });
  }
};

const addVenta = async (req, res) => {
  try {
    const { cliente_id, nroVenta, zona_id, pago, detalles } = req.body;

    // Crear la venta y obtener el ID generado
    const ventaId = await ventasModel.addVenta(
      cliente_id,
      nroVenta,
      zona_id,
      pago
    );

    // Verificar el stock de cada artículo
    for (const detalle of detalles) {
      const result = await ventasModel.checkStock(
        detalle.articulo_id,
        detalle.cantidad
      );
      if (!result.disponible) {
        console.log(
          "Stock insuficiente para el articulo:",
          detalle.articulo_id
        );
        return res.status(203).json({
          error_code: result.nombre,
        });
      }
    }

    // Agregar detalles de la venta y descontar el stock
    for (const detalle of detalles) {
      await ventasModel.addDetalleVenta(
        ventaId,
        detalle.articulo_id,
        detalle.costo,
        detalle.cantidad,
        detalle.precio_monotributista
      );

      // Descontar el stock del artículo
      await ventasModel.descontarStock(detalle.articulo_id, detalle.cantidad);

      // Registrar el cambio en el log de stock
      await ventasModel.updateLogVenta(
        cliente_id,
        detalle.articulo_id,
        detalle.cantidad
      );
    }

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
    res.status(200).json({ message: "Venta eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la venta:", error);
    res.status(500).json({ error: "Error al eliminar la venta" });
  }
};

const upVenta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ventasModel.upVenta(ID);
    res.status(200).json({ message: "Venta activada con éxito" });
  } catch (error) {
    console.error("Error al activar la venta:", error);
    res.status(500).json({ error: "Error al activar la venta" });
  }
};

const updateVentas = async (req, res) => {
  try {
    const { producto_id, cantidad, cliente_id, zona_id, ID } = req.body;
    await ventasModel.updateVentas(
      producto_id,
      cantidad,
      cliente_id,
      zona_id,
      ID
    );
    res.status(200).json({ message: "Venta actualizada" });
  } catch (error) {
    console.error("Error al actualizar la venta:", error);
    res.status(500).json({ error: "Error al actualizar la venta" });
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

const getVentasByZona = async (req, res) => {
  try {
    const zona_id = req.params.ID;
    const ventas = await ventasModel.getVentasByZona(zona_id);
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

const getVentaByID = async (req, res) => {
  try {
    const venta_id = req.params.ID;
    const detalleVentas = await ventasModel.getVentaByID(venta_id);
    if (detalleVentas.length <= 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    } else {
      let data = {
        nombre_cliente: detalleVentas[0].nombre_cliente_completo,
        id: detalleVentas[0].id,
        nroVenta: detalleVentas[0].nroVenta,
        fecha: detalleVentas[0].fecha,
        zona_nombre: detalleVentas[0].nombre_zona,
        direccion: detalleVentas[0].direccion,
        total: detalleVentas[0].total_importe,
        detalles: detalleVentas.map((detalle) => ({
          id: detalle.articulo_id,
          nombre: detalle.nombre_articulo,
          cantidad: detalle.cantidad,
          precio_monotributista: detalle.precio_monotributista,
          subtotal: detalle.total_precio_monotributista,
        })),
      };
      res.json(data);
    }
  } catch (error) {
    console.error("Error al obtener la venta por ID:", error);
    res.status(500).json({ error: "Error al obtener la venta por ID" });
  }
};

module.exports = {
  getAllVentas,
  addVenta,
  dropVenta,
  upVenta,
  updateVentas,
  getVentasByClientes,
  getVentasByZona,
  getVentasByProducto,
  getVentaByID,
};
