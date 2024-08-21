const db = require("../database");

const getVentasByDay = async (startDate, endDate) => {
  const query = `
    SELECT 
      DATE(dv.fecha) AS date,
      SUM(dv.precio_monotributista * dv.cantidad) AS total_importe
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.venta_id = v.id
    WHERE dv.fecha BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY DATE(dv.fecha)
    ORDER BY DATE(dv.fecha)
  `;

  const [results] = await db.query(query, [startDate, endDate]);
  return results;
};

const getVentasByMonth = async (startDate, endDate) => {
  const query = `
    SELECT 
      DATE_FORMAT(dv.fecha, '%Y-%m') AS month,
      SUM(dv.precio_monotributista * dv.cantidad) AS total_importe
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.venta_id = v.id
    WHERE dv.fecha BETWEEN ? AND LAST_DAY(?)
    GROUP BY DATE_FORMAT(dv.fecha, '%Y-%m')
    ORDER BY DATE_FORMAT(dv.fecha, '%Y-%m')
  `;

  const [results] = await db.query(query, [startDate, endDate]);
  return results;
};

const getVentasByQuarter = async (startDate, endDate) => {
  const query = `
    SELECT 
      CONCAT(YEAR(dv.fecha), ' Q', QUARTER(dv.fecha)) AS quarter,
      SUM(dv.precio_monotributista * dv.cantidad) AS total_importe
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.venta_id = v.id
    WHERE dv.fecha BETWEEN ? AND
      (SELECT MAX(ultima_fecha)
       FROM (
         SELECT
           CASE 
             WHEN QUARTER(?) = 1 THEN LAST_DAY(CONCAT(YEAR(?), '-03-31'))
             WHEN QUARTER(?) = 2 THEN LAST_DAY(CONCAT(YEAR(?), '-06-30'))
             WHEN QUARTER(?) = 3 THEN LAST_DAY(CONCAT(YEAR(?), '-09-30'))
             ELSE LAST_DAY(CONCAT(YEAR(?), '-12-31'))
           END AS ultima_fecha
       ) AS trimestre
      )
    GROUP BY YEAR(dv.fecha), QUARTER(dv.fecha)
    ORDER BY YEAR(dv.fecha), QUARTER(dv.fecha)
  `;

  const [results] = await db.query(query, [
    startDate,
    endDate,
    startDate,
    startDate,
    startDate,
    startDate,
    startDate,
    startDate,
  ]);
  return results;
};

module.exports = {
  getVentasByDay,
  getVentasByMonth,
  getVentasByQuarter,
};
