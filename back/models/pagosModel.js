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
const getUltimoPago = async (cliente_id) => {
  const query = `SELECT nro_pago FROM pagos WHERE cliente_id = ? ORDER BY nro_pago DESC LIMIT 1`;
  const [rows] = await db.query(query, [cliente_id]); // 👈 fix
  return rows[0]?.nro_pago || null;
};

const addPago = async (
  cliente_id,
  monto,
  metodo_pago,
  vendedor_id,
  cheque // 👈 objeto opcional { banco, nro_cheque, fecha_emision, fecha_cobro }
) => {
  // 1) Calcular siguiente nro_pago para ese cliente
  const ultimoNroPago = await getUltimoPago(cliente_id);
  let nuevoNro;

  if (!ultimoNroPago) {
    nuevoNro = "00001";
  } else {
    const siguiente = parseInt(ultimoNroPago, 10) + 1;
    nuevoNro = siguiente.toString().padStart(5, "0");
  }

  // 2) Insertar pago
  const insertPagoQuery = `
    INSERT INTO pagos (nro_pago, cliente_id, monto, metodo_pago, vendedor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [insertResult] = await db.query(insertPagoQuery, [
    nuevoNro,
    cliente_id,
    monto,
    metodo_pago,
    vendedor_id,
  ]);

  const pagoId = insertResult.insertId;
  const bancoMayus = cheque?.banco ? cheque.banco.toUpperCase() : null;
  // 3) Si el método es cheque, insertamos en la tabla cheque con pago_id
  if (metodo_pago === "cheque" && cheque) {
    const insertChequeQuery = `
      INSERT INTO cheque (
        banco,
        nro_cheque,
        fecha_emision,
        fecha_cobro,
        importe,
        cliente_id,
        pago_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(insertChequeQuery, [
      bancoMayus,
      cheque.nro_cheque,
      cheque.fecha_emision, // "YYYY-MM-DD" desde el front
      cheque.fecha_cobro, // "YYYY-MM-DD"
      monto, // importe del cheque = monto del pago
      cliente_id,
      pagoId, // 👈 relación directa con pagos.id
    ]);
  }

  // 4) Devolvemos algo útil al controller
  return {
    pagoId,
    nro_pago: nuevoNro,
  };
};

const getPagoById = async (ID) => {
  try {
    const query = queriesPagos.getPagoById;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};

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

const getNextNroPago = async (cliente_id) => {
  try {
    const query = `SELECT COALESCE(MAX(CAST(nro_pago AS UNSIGNED)), 0) + 1 AS nextNumber FROM pagos WHERE cliente_id = ? AND estado = 1`;
    const [rows] = await db.query(query, [cliente_id]);
    const nextNumber = rows[0]?.nextNumber || 1;
    const formattedNumber = nextNumber.toString().padStart(5, "0");
    return { nextNroPago: formattedNumber };
  } catch (err) {
    console.error("Error en getNextNroPago:", err);
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
  getPagoById,
  getNextNroPago,
};
