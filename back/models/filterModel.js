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
  const [result] = await db.query(query, values);
  return result;
};
const filterComprasByFecha = async (startDate, endDate) => {
  try {
    const query = `
     SELECT 
    COUNT(*) AS cantidad_compras,
    COALESCE(FORMAT(SUM(total), 2), '0.00') AS suma_total
FROM compra
WHERE DATE(fecha_compra) BETWEEN ? AND ?;
    `;
    const values = [startDate, endDate];

    const [result] = await db.query(query, values);

    return result.length > 0 ? result[0] : { cantidad_compras: 0, suma_total: 0 };
  } catch (error) {
    console.error("Error fetching compras by fecha:", error);
    throw error;
  }
};
const getTotalVentas = async () => {
  const query = `
    SELECT SUM(total) AS total
    FROM venta 
    WHERE venta.estado = 1
  `;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalGastos = async () => {
  const query = `
    SELECT SUM(monto) AS total
    FROM gasto
    WHERE gasto.estado = 1
  `;
  const [rows] = await db.query(query);
  return rows;
};
const getTotalCompras = async () => {
  const query = `
    SELECT SUM(total) AS total
    FROM compra
    WHERE compra.estado = 1
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
    WHERE cliente.estado = 1
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
  getTotalClientes,
  filterComprasByFecha
};
