const db = require("../database");
const queriesArticulos = require("../querys/queriesArticulos");

const getAllArticulos = async () => {
  try {
    const query = queriesArticulos.getAllArticulos;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addArticulo = async (
  nombre,
  mediciones,
  stock,
  codigo_producto,
  proveedor_id,
  precio_monotributista,
  costo,
  linea_id,
  subLinea_id,
  precio_oferta
) => {
  try {
    const query = queriesArticulos.addArticulo;
    await db.query(query, [
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
    ]);
    console.log("Articulo agregado");
  } catch (err) {
    throw err;
  }
};

const dropArticulo = async (ID) => {
  try {
    const query = queriesArticulos.dropArticulo;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upArticulo = async (ID) => {
  try {
    const query = queriesArticulos.upArticulo;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateArticulo = async (
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
) => {
  try {
    const query = queriesArticulos.updateArticulo;
    await db.query(query, [
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
    ]);
  } catch (err) {
    throw err;
  }
};
const getArticuloByID = async (ID) => {
  try {
    const query = queriesArticulos.getArticuloByID;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getArticulosByProveedorID = async (proveedorID) => {
  try {
    const query = queriesArticulos.getArticulosByProveedorID;
    const [results] = await db.execute(query, [proveedorID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching articles by provider ID: " + error.message);
  }
};
const getArticulosByLineaID = async (lineaID) => {
  try {
    const query = queriesArticulos.getArticulosByLineaID;
    const [results] = await db.query(query, [lineaID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching articles by line ID: " + error.message);
  }
};

const getArticulosBySubLineaID = async (subLineaID) => {
  try {
    const query = queriesArticulos.getArticulosBySubLineaID;
    const [results] = await db.query(query, [subLineaID]);
    return results;
  } catch (error) {
    throw new Error("Error fetching articles by sub-line ID: " + error.message);
  }
};

const increasePrices = async (linea_id, percentage) => {
  try {
    const query = queriesArticulos.increasePrices;
    await db.query(query, [percentage, percentage, linea_id]);
  } catch (error) {
    throw new Error("Error updating prices: " + error.message);
  }
};
const increasePrice = async (ID, percentage) => {
  try {
    const query = queriesArticulos.increasePrice;
    await db.query(query, [percentage, percentage, ID]);
  } catch (error) {
    throw new Error("Error updating price: " + error.message);
  }
};

const updateLogPrecios = async (
  articulo_id,
  costo_nuevo,
  costo_antiguo,
  precio_monotributista_nuevo,
  precio_monotributista_antiguo,
  porcentaje
) => {
  try {
    const query = queriesArticulos.updateLogPrecios;
    await db.query(query, [
      articulo_id,
      costo_nuevo,
      costo_antiguo,
      precio_monotributista_nuevo,
      precio_monotributista_antiguo,
      porcentaje,
    ]);
  } catch (error) {
    throw new Error("Error updating log: " + error.message);
  }
};
const logsPreciosById = async (ID) => {
  try {
    const query = queriesArticulos.logsPreciosById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const deshacerCambios = async (
  articulo_id,
  costo_antiguo,
  precio_monotributista_antiguo,
  log_id
) => {
  try {
    const queryUpdate = queriesArticulos.deshacerCambiosUpdate;
    const queryDelete = queriesArticulos.deshacerCambiosDelete;

    // Ejecutar la actualización del artículo
    await db.query(queryUpdate, [
      costo_antiguo,
      precio_monotributista_antiguo,
      articulo_id,
    ]);

    // Ejecutar la eliminación del log
    await db.query(queryDelete, [log_id]);
  } catch (err) {
    throw err;
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
};
