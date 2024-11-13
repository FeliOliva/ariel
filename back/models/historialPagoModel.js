const db = require("../database"); // Conexión a la base de datos
const queriesHistorialPago = require("../querys/historialPagoQueries");

// Método para obtener historial por `venta_id`
const findByVentaID = async (venta_id) => {
    const [rows] = await db.query(queriesHistorialPago.findByVentaID, [venta_id]);
    return rows;
};

// Método para obtener historial por `venta_id` y `cliente_id`
const findByVentaAndCliente = async (venta_id, cliente_id) => {
    const [rows] = await db.query(queriesHistorialPago.findByVentaAndCliente, [venta_id, cliente_id]);
    return rows;
};

module.exports = {
    findByVentaID,
    findByVentaAndCliente,
};
