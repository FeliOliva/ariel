const articuloModel = require("../models/articuloModel");
const db = require("../database");

const getAllArticulos = async (req, res) => {
  try {
    const articulos = await articuloModel.getAllArticulos();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addArticulo = async (req, res) => {
  try {
    const {
      nombre,
      mediciones,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      linea_id,
      subLinea_id,
      precio_oferta,
    } = req.body;

    if (!linea_id) {
      return res
        .status(400)
        .json({ error: "El campo linea_id es obligatorio" });
    }
    let nombreMayus = nombre.toUpperCase();

    await articuloModel.addArticulo(
      nombreMayus,
      mediciones,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      linea_id,
      subLinea_id,
      precio_oferta
    );

    res.status(201).json({ message: "Articulo agregado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el articulo" });
  }
};

const dropArticulo = async (req, res) => {
  try {
    const ID = req.params.ID;
    await articuloModel.dropArticulo(ID);
    res.status(200).json({ message: "Articulo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el Articulo" });
  }
};
const upArticulo = async (req, res) => {
  try {
    const ID = req.params.ID;
    await articuloModel.upArticulo(ID);
    res.status(200).json({ message: "Articulo activado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar el Articulo" });
  }
};
const updateArticulo = async (req, res) => {
  try {
    const {
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      linea_id,
      mediciones,
      precio_oferta,
      ID,
    } = req.body;
    const products = await articuloModel.updateArticulo(
      nombre,
      stock,
      codigo_producto,
      proveedor_id,
      precio_monotributista,
      costo,
      subLinea_id,
      linea_id,
      mediciones,
      precio_oferta,
      ID
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getArticuloByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const products = await articuloModel.getArticuloByID(ID);
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getArticulosByProveedorID = async (req, res) => {
  try {
    const proveedorID = req.params.proveedorID;
    const products = await articuloModel.getArticulosByProveedorID(proveedorID);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getArticulosByLineaID = async (req, res) => {
  try {
    const lineaID = req.params.lineaID;
    const products = await articuloModel.getArticulosByLineaID(lineaID);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getArticulosBySubLineaID = async (req, res) => {
  try {
    const subLineaID = req.params.subLineaID;
    const products = await articuloModel.getArticulosBySubLineaID(subLineaID);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const increasePrices = async (req, res) => {
  try {
    const linea_id = req.params.linea_id;
    const { percentage } = req.body;

    if (!percentage || isNaN(percentage)) {
      return res.status(400).json({ error: "Invalid percentage value" });
    }

    await articuloModel.increasePrices(linea_id, percentage);
    res.status(200).json({ message: "Prices updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating prices" });
  }
};
const decreasePrices = async (req, res) => {
  try {
    const linea_id = req.params.linea_id;
    const { percentage } = req.body;

    if (!percentage || isNaN(percentage)) {
      return res.status(400).json({ error: "Invalid percentage value" });
    }

    await articuloModel.decreasePrices(linea_id, percentage);
    res.status(200).json({ message: "Prices updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating prices" });
  }
};
const increasePrice = async (req, res) => {
  try {
    const ID = req.params.ID;
    const { percentage } = req.body;
    if (!percentage || isNaN(percentage)) {
      return res.status(400).json({ error: "Invalid percentage value" });
    }
    await articuloModel.increasePrice(ID, percentage);
    res.status(200).json({ message: "Price updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const decreasePrice = async (req, res) => {
  try {
    const ID = req.params.ID;
    const { percentage } = req.body;
    if (!percentage || isNaN(percentage)) {
      return res.status(400).json({ error: "Invalid percentage value" });
    }
    await articuloModel.decreasePrice(ID, percentage);
    res.status(200).json({ message: "Price updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLogPrecios = async (req, res) => {
  try {
    const {
      articulo_id,
      precio_monotributista_nuevo,
      precio_monotributista_antiguo,
      porcentaje,
    } = req.body;
    if (!porcentaje || isNaN(porcentaje)) {
      return res.status(400).json({ error: "Invalid percentage value" });
    }
    await articuloModel.updateLogPrecios(
      articulo_id,
      precio_monotributista_nuevo,
      precio_monotributista_antiguo,
      porcentaje
    );
    res.status(200).json({ message: "Log updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logsPreciosById = async (req, res) => {
  try {
    const ID = req.params.ID;
    const logs = await articuloModel.logsPreciosById(ID);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deshacerCambios = async (req, res) => {
  let connection = null;
  let inTransaction = false;
  try {
    const id = req.params.id;
    const { costo_antiguo, precio_monotributista_antiguo, articulo_id } =
      req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();
    inTransaction = true;

    await articuloModel.deshacerCambios(
      articulo_id,
      costo_antiguo,
      precio_monotributista_antiguo,
      id,
      connection
    );

    await connection.commit();
    inTransaction = false;
    connection.release();
    connection = null;
    res.status(200).json({ message: "Cambio deshecho correctamente" });
  } catch (error) {
    if (inTransaction) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error al hacer rollback de deshacerCambios:", rollbackError);
      }
    }
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: error.message });
  }
};
const getArticulosOrdenados = async (req, res) => {
  try {
    const articulos = await articuloModel.getArticulosOrdenados();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getArticulosVendidosPorLinea = async (req, res) => {
  try {
    const { linea_id, fecha_inicio, fecha_fin } = req.query;

    if (!linea_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Faltan parámetros: linea_id, fecha_inicio o fecha_fin",
      });
    }

    const productos = await articuloModel.getArticulosVendidosPorLinea({
      linea_id,
      fecha_inicio,
      fecha_fin,
    });

    // Sumamos el total general de todos los subtotales
    const totalGeneral = productos.reduce(
      (acc, prod) => acc + parseFloat(prod.subtotal),
      0
    );

    res.json({ productos, totalGeneral: totalGeneral.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEvolucionGananciaPorLinea = async (req, res) => {
  try {
    const { linea_id, fecha_inicio, fecha_fin } = req.query;

    if (!linea_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Faltan parámetros: linea_id, fecha_inicio o fecha_fin",
      });
    }

    const evolucion = await articuloModel.getEvolucionGananciaPorLinea({
      linea_id,
      fecha_inicio,
      fecha_fin,
    });

    res.json({ evolucion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVentasConGananciaFiltradas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, articulo_id, linea_id, sublinea_id, proveedor_id } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Faltan parámetros: fecha_inicio y fecha_fin son requeridos",
      });
    }

    const ventas = await articuloModel.getVentasConGananciaFiltradas({
      fecha_inicio,
      fecha_fin,
      articulo_id: articulo_id || null,
      linea_id: linea_id || null,
      sublinea_id: sublinea_id || null,
      proveedor_id: proveedor_id || null,
    });

    res.json({ ventas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllArticulos,
  addArticulo,
  dropArticulo,
  upArticulo,
  updateArticulo,
  getArticuloByID,
  getArticulosByProveedorID,
  getArticulosByLineaID,
  getArticulosBySubLineaID,
  increasePrices,
  increasePrice,
  updateLogPrecios,
  logsPreciosById,
  deshacerCambios,
  getArticulosOrdenados,
  decreasePrices,
  getArticulosVendidosPorLinea,
  decreasePrice,
  getEvolucionGananciaPorLinea,
  getVentasConGananciaFiltradas,
};
