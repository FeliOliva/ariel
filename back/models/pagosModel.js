const db = require("../database");
const queriesPagos = require("../querys/queriesPagos");

const getAllPagos = async (fecha_inicio, fecha_fin) => {
  try {
    const query = queriesPagos.getAllPagos;
    return await db.query(query, [fecha_inicio, fecha_fin]); // Pasar las fechas como parámetros
  } catch (err) {
    throw err;
  }
};

const getPagosByClienteId = async (cliente_id, fecha_inicio, fecha_fin) => {
  try {
    const fechaInicioSQL = `${fecha_inicio} 00:00:00`;
    const fechaFinSQL = `${fecha_fin} 23:59:59`;
    const query = queriesPagos.getPagosByClienteId;
    const [rows] = await db.query(query, [
      cliente_id,
      fechaInicioSQL,
      fechaFinSQL,
    ]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addPago = async (nro_pago, cliente_id, monto, metodo_pago) => {
  try {
    const query = queriesPagos.addPagos;
    return await db.query(query, [nro_pago, cliente_id, monto, metodo_pago]);
  } catch (err) {
    throw err;
  }
};

const getPagoById = async (ID) => {
  try {
    const query = queriesPagos.getPagoById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
}

const updatePago = async (monto, fecha_pago, ID) => {
  try {
    const [day, month, year] = fecha_pago.split("/");
    const formattedFechaPago = `${year}-${month}-${day} 00:00:00`;

    const query = queriesPagos.updatePago;
    return await db.query(query, [monto, formattedFechaPago, ID]);
  } catch (err) {
    throw err;
  }
};

const getPagosByZona_id = async (zona_id, fecha_inicio, fecha_fin) => {
  try {
    const query = queriesPagos.getPagosByZona_id;
    const [rows] = await db.query(query, [zona_id, fecha_inicio, fecha_fin]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const dropPago = async (id) => {
  try {
    const query = queriesPagos.dropPago;
    return await db.query(query, [id]);
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getAllPagos,
  addPago,
  updatePago,
  getPagosByClienteId,
  getPagosByZona_id,
  dropPago,
  getPagoById
};
