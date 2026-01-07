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
  // Usar BETWEEN para filtrar correctamente por el rango de fechas seleccionado
  // También excluir clientes inactivos para coincidir con el cierre
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(v.total_con_descuento), 2), '0.00') AS suma_total
    FROM venta v
    INNER JOIN cliente c ON v.cliente_id = c.id
    WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 1
      AND c.estado = 1
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
  // Usar BETWEEN para filtrar correctamente por el rango de fechas seleccionado
  // También excluir clientes inactivos para coincidir con el cierre
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(p.monto), 2), '0.00') AS suma_total
    FROM pagos p
    INNER JOIN cliente c ON p.cliente_id = c.id
    WHERE DATE(p.fecha_pago) BETWEEN ? AND ?
      AND p.estado = 1
      AND c.estado = 1
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

const getTotalNotasCredito = async (startDate, endDate) => {
  // Usar BETWEEN para filtrar correctamente por el rango de fechas seleccionado
  // También excluir clientes inactivos para coincidir con el cierre
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM(dnc.subTotal), 2), '0.00') AS suma_total
    FROM notascredito nc
    JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
    INNER JOIN cliente c ON nc.cliente_id = c.id
    WHERE DATE(nc.fecha) BETWEEN ? AND ?
      AND nc.estado = 1
      AND c.estado = 1
  `;
  const values = [startDate, endDate];
  const [result] = await db.query(query, values);
  return result.length > 0 ? result[0] : { suma_total: '0.00' };
};

const getTotalGanancia = async (startDate, endDate) => {
  // Usar BETWEEN para filtrar correctamente por el rango de fechas seleccionado
  // También excluir clientes inactivos para coincidir con el cierre
  // Ganancia = (precio_monotributista - costo) * cantidad para cada detalle de venta
  const query = `
    SELECT 
      COALESCE(FORMAT(SUM((dv.precio_monotributista - dv.costo) * dv.cantidad), 2), '0.00') AS ganancia_total
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.venta_id = v.id
    INNER JOIN cliente c ON v.cliente_id = c.id
    WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      AND v.estado = 1
      AND c.estado = 1
  `;
  const values = [startDate, endDate];
  const [result] = await db.query(query, values);
  return result.length > 0 ? result[0] : { ganancia_total: '0.00' };
};

module.exports = {
  getVentasByDay,
  getTotalVentas,
  getTotalGastos,
  getTotalCompras,
  getTotalPagos,
  filterComprasByFecha,
  getTotalClientes,
  getTotalNotasCredito,
  getTotalGanancia,
};
