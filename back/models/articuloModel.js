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
  subLinea_id
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

const increasePrices = async (proveedorID, percentage) => {
  try {
    const query = queriesArticulos.increasePrices;
    await db.query(query, [percentage, percentage, proveedorID]);
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
};
