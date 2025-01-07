const db = require("../database");

const getVentasByDay = async (startDate, endDate, clienteId) => {
  const query = `
    SELECT DATE_FORMAT(fecha_venta, '%Y-%m-%d') AS fecha_venta, 
           SUM(total) AS total_importe
    FROM venta
    WHERE fecha_venta BETWEEN ? AND ? 
      AND cliente_id = ?
    GROUP BY fecha_venta
  `;
  const values = [startDate, endDate, clienteId];
  const result = await db.query(query, values);
  return result;
};
const getTotalVentas = async () => {
  const query = `
    SELECT SUM(total) AS total_importe
    FROM venta
  `;
  const result = await db.query(query);
  return result;
};
const getTotalGastos = async () => {
  const query = `
    SELECT SUM(monto) AS total
    FROM gasto
  `;
  const result = await db.query(query);
  return result;
};
const getTotalCompras = async () => {
  const query = `
    SELECT SUM(total) AS total_importe
    FROM compra
  `;
  const result = await db.query(query);
  return result;
};
const getTotalPagos = async () => {
  const query = `
    SELECT SUM(monto) AS totalPagos
    FROM log_pago
  `;
  const result = await db.query(query);
  return result;
};
const getTotalClientes = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM cliente
  `;
  const result = await db.query(query);
  return result;
};


module.exports = {
  getVentasByDay,
  getTotalVentas,
  getTotalGastos,
  getTotalCompras,
  getTotalPagos,
  getTotalClientes
};
