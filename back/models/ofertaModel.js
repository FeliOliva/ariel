const db = require("../database");
const queriesOfertas = require("../querys/queriesOfertas");

const getAllOfertas = async () => {
  try {
    const query = queriesOfertas.getAllOfertas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addOferta = async (nombre, detalles) => {
  try {
    const query = queriesOfertas.addOferta;
    const [result] = await db.query(query, [nombre]);
    const ofertaId = result.insertId;

    for (const detalle of detalles) {
      const queryDetalle = queriesOfertas.addDetalleOferta;
      await db.query(queryDetalle, [
        ofertaId,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.precioOferta,
      ]);
    }

    return ofertaId;
  } catch (err) {
    throw err;
  }
};

const dropOferta = async (ID) => {
  try {
    const query = queriesOfertas.dropOferta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upOferta = async (ID) => {
  try {
    const query = queriesOfertas.upOferta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const updateOferta = async (nombre, detalles, ID) => {
  try {
    const query = queriesOfertas.updateOferta;
    await db.query(query, [nombre, ID]);
    const queryDeleteDetalles = queriesOfertas.deleteDetallesOferta;
    await db.query(queryDeleteDetalles, [ID]);
    for (const detalle of detalles) {
      const queryDetalle = queriesOfertas.addDetalleOferta;
      await db.query(queryDetalle, [
        ID,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.precioOferta,
      ]);
    }
  } catch (err) {
    throw err;
  }
};
const getOfertaById = async (oferta_id) => {
  try {
    const query = queriesOfertas.getOfertaById;
    const [rows] = await db.query(query, [oferta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllOfertas,
  addOferta,
  dropOferta,
  upOferta,
  updateOferta,
  getOfertaById,
};
