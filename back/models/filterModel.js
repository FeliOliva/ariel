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
    SELECT SUM(total) AS total
    FROM venta
  `;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalGastos = async () => {
  const query = `
    SELECT SUM(monto) AS total
    FROM gasto
  `;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalCompras = async () => {
  const query = `
    SELECT SUM(total) AS total
    FROM compra
  `;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalPagos = async () => {
  const query = `
  SELECT SUM(monto) AS total
  FROM pagos
`;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalClientes = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM cliente
  `;
  const [rows] = await db.query(query);
  return rows;
};


module.exports = {
  getVentasByDay,
  getTotalVentas,
  getTotalGastos,
  getTotalCompras,
  getTotalPagos,
  getTotalClientes
};
