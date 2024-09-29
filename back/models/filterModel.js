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

module.exports = {
  getVentasByDay,
};
