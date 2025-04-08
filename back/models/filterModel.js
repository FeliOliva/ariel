const db = require("../database");

const getVentasByDay = async (startDate, endDate, clienteId) => {
  const query = `
    SELECT DATE_FORMAT(fecha_venta, '%Y-%m-%d') AS fecha_venta, 
           SUM(total) AS total_importe
    FROM venta
    WHERE fecha_venta BETWEEN ? AND ? 
      AND cliente_id = ?
      AND estado = 1
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
      WHERE DATE(fecha_compra) BETWEEN ? AND ?
        AND estado = 1
    `;
    const values = [startDate, endDate];
    const [result] = await db.query(query, values);
    return result.length > 0 ? result[0] : { cantidad_compras: 0, suma_total: 0 };
  } catch (error) {
    console.error("Error fetching compras by fecha:", error);
    throw error;
  }
};

const getTotalVentas = async (startDate, endDate) => {
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(total_con_descuento), 2), '0.00') AS suma_total
    FROM venta
    WHERE DATE(fecha_venta) BETWEEN ? AND ?
      AND estado = 1
  `;
  const values = [startDate, endDate];
  const [result] = await db.query(query, values);
  return result.length > 0 ? result[0] : { suma_total: '0.00' };
};

const getTotalGastos = async (startDate, endDate) => {
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(monto), 2), '0.00') AS suma_total
    FROM gasto
    WHERE DATE(fecha) BETWEEN ? AND ?
      AND estado = 1
  `;
  const values = [startDate, endDate];
  const [result] = await db.query(query, values);
  return result.length > 0 ? result[0] : { suma_total: '0.00' };
};

const getTotalCompras = async () => {
  const query = `
    SELECT SUM(total) AS total
    FROM compra
    WHERE estado = 1
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getTotalPagos = async (startDate, endDate) => {
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(monto), 2), '0.00') AS suma_total
    FROM pagos
    WHERE DATE(fecha_pago) BETWEEN ? AND ?
      AND estado = 1
  `;
  const values = [startDate, endDate];
  const [result] = await db.query(query, values);
  return result.length > 0 ? result[0] : { suma_total: '0.00' };
};

const getTotalClientes = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM cliente
    WHERE estado = 1
  `;
  const [rows] = await db.query(query);
  return rows[0] || 0;
};

module.exports = {
  getVentasByDay,
  getTotalVentas,
  getTotalGastos,
  getTotalCompras,
  getTotalPagos,
  filterComprasByFecha,
  getTotalClientes,
};
