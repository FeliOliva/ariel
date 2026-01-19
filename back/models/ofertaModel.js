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

const addOferta = async (nombre, detalles, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesOfertas.addOferta;
    const [result] = await conn.query(query, [nombre]);
    const ofertaId = result.insertId;

    if (detalles && detalles.length > 0) {
      const rows = detalles.map((detalle) => [
        ofertaId,
        detalle.articulo_id,
        detalle.cantidad,
        detalle.precioOferta,
      ]);
      const queryDetalle =
        "INSERT INTO detalle_oferta (oferta_id, articulo_id, cantidad, precioOferta) VALUES ?";
      await conn.query(queryDetalle, [rows]);
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

const updateOferta = async (nombre, id, connection = null) => {
  try {
    const conn = connection || db;
    const query = queriesOfertas.updateOferta;
    await conn.query(query, [nombre, id]);
  } catch (err) {
    throw err;
  }
};

const updateCantidadDetalleOferta = async (
  cantidad,
  articulo_id,
  oferta_id,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = queriesOfertas.updateCantidadDetalleOferta;
    await conn.query(query, [cantidad, articulo_id, oferta_id]);
  } catch (err) {
    throw err;
  }
};
const updateCantidadDetalleOfertaBatch = async (
  oferta_id,
  detalles,
  connection = null
) => {
  if (!detalles || detalles.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const cases = detalles.map(() => "WHEN ? THEN ?").join(" ");
    const ids = detalles.map((d) => d.articulo_id);
    const params = [];
    detalles.forEach((d) => {
      params.push(d.articulo_id, d.cantidad);
    });
    params.push(oferta_id, ...ids);
    const query = `UPDATE detalle_oferta SET cantidad = CASE articulo_id ${cases} ELSE cantidad END WHERE oferta_id = ? AND articulo_id IN (${ids
      .map(() => "?")
      .join(",")})`;
    await conn.query(query, params);
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
  updateCantidadDetalleOferta,
  updateCantidadDetalleOfertaBatch,
};
