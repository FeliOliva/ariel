const db = require("../database");
const queriesVentas = require("../querys/queriesVentas");

const getAllVentas = async () => {
  try {
    const query = queriesVentas.getAllVentas;
    const [rows] = await db.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addVenta = async (cliente_id, nroVenta, zona_id, pago) => {
  try {
    const query = queriesVentas.addVenta;
    const [result] = await db.query(query, [
      cliente_id,
      nroVenta,
      zona_id,
      pago,
    ]);
    return result.insertId;
  } catch (err) {
    throw err;
  }
};

const checkStock = async (articulo_id, cantidad) => {
  try {
    const [rows] = await db.query(queriesVentas.checkStock, [articulo_id]);
    if (rows.length === 0 || rows[0].stock < cantidad) {
      return {
        disponible: false,
        nombre: rows.length > 0 ? rows[0].nombre : "Desconocido",
      };
    }
    return { disponible: true };
  } catch (error) {
    throw new Error("Error al verificar el stock: " + error.message);
  }
};

const descontarStock = async (articulo_id, cantidad) => {
  try {
    await db.query(queriesVentas.descontarStock, [cantidad, articulo_id]);
  } catch (error) {
    throw new Error("Error al descontar el stock: " + error.message);
  }
};

const updateLogVenta = async (cliente_id, articulo_id, cantidad) => {
  try {
    await db.query(queriesVentas.updateLogVenta, [
      cliente_id,
      articulo_id,
      cantidad,
    ]);
  } catch (error) {
    throw new Error("Error al registrar en el log de ventas: " + error.message);
  }
};

const addDetalleVenta = async (
  ventaId,
  articulo_id,
  costo,
  cantidad,
  precio_monotributista
) => {
  try {
    await db.query(queriesVentas.addDetalleVenta, [
      ventaId,
      articulo_id,
      costo,
      cantidad,
      precio_monotributista,
    ]);
  } catch (error) {
    throw new Error("Error al agregar el detalle de venta: " + error.message);
  }
};

const dropVenta = async (ID) => {
  try {
    const query = queriesVentas.dropVenta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const upVenta = async (ID) => {
  try {
    const query = queriesVentas.upVenta;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};

const updateVentas = async (producto_id, cantidad, cliente_id, zona_id, ID) => {
  try {
    const query = queriesVentas.updateVentas;
    await db.query(query, [producto_id, cantidad, cliente_id, zona_id, ID]);
  } catch (err) {
    throw err;
  }
};

const getVentasByClientes = async (cliente_id) => {
  try {
    const query = queriesVentas.getVentasByClientes;
    const [rows] = await db.query(query, [cliente_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentasByZona = async (zona_id) => {
  try {
    const query = queriesVentas.getVentasByZona;
    const [rows] = await db.query(query, [zona_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentasByProducto = async (producto_id) => {
  try {
    const query = queriesVentas.getVentasByProducto;
    const [rows] = await db.query(query, [producto_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVentaByID = async (venta_id) => {
  try {
    const query = queriesVentas.getVentaByID;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addCuentaCorriente = async (cliente_id, saldo_total) => {
  const query = queriesVentas.addCuentaCorriente;
  await db.query(query, [cliente_id, saldo_total]);
};

const getTotal = async (venta_id) => {
  try {
    const query = queriesVentas.getTotal;
    const [rows] = await db.query(query, [venta_id]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getCuentaCorrienteByClienteId = async (cliente_id) => {
  const query = queriesVentas.getCuentaCorrienteByClienteId;
  const [rows] = await db.query(query, [cliente_id]);
  return rows.length ? rows[0] : null;
};

const updatePagoCuentaCorriente = async (cliente_id, monto_total) => {
  const query = queriesVentas.updatePagoCuentaCorriente;
  await db.query(query, [monto_total, cliente_id]);
};
const updateCuentaCorriente = async (cliente_id, saldo_total) => {
  const query = queriesVentas.updateCuentaCorriente;
  await db.query(query, [saldo_total, cliente_id]);
};

const getPagoCuentaCorrienteByClienteId = async (cliente_id) => {
  const query = queriesVentas.getPagoCuentaCorrienteByClienteId;
  const [rows] = await db.query(query, [cliente_id]);
  return rows.length ? rows[0] : null;
};

const addPagoCuentaCorriente = async (cliente_id, monto_total) => {
  const query = queriesVentas.addPagoCuentaCorriente;
  await db.query(query, [cliente_id, monto_total]);
};
const getSaldoTotalCuentaCorriente = async (cliente_id) => {
  const query = queriesVentas.getSaldoTotalCuentaCorriente;
  const [rows] = await db.query(query, [cliente_id]);
  return rows[0].saldo_acumulado || 0;
};
const updateVentaTotal = async (ventaId, total) => {
  const query = queriesVentas.updateVentaTotal;
  await db.query(query, [total, ventaId]);
};

module.exports = {
  getAllVentas,
  addVenta,
  checkStock,
  descontarStock,
  updateLogVenta,
  addDetalleVenta,
  dropVenta,
  upVenta,
  updateVentas,
  getVentasByClientes,
  getVentasByZona,
  getVentasByProducto,
  getVentaByID,
  addCuentaCorriente,
  getTotal,
  getCuentaCorrienteByClienteId,
  addPagoCuentaCorriente,
  getPagoCuentaCorrienteByClienteId,
  updatePagoCuentaCorriente,
  updateCuentaCorriente,
  getSaldoTotalCuentaCorriente,
  updateVentaTotal,
};
