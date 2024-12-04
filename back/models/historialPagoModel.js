const db = require("../database");
const queriesHistorialPago = require("../querys/historialPagoQueries");


const findByVentaID = async (venta_id) => {
    const [rows] = await db.query(queriesHistorialPago.findByVentaID, [venta_id]);
    return rows;
};

const findByVentaAndCliente = async (venta_id, cliente_id) => {
    const [rows] = await db.query(queriesHistorialPago.findByVentaAndCliente, [venta_id, cliente_id]);
    return rows;
};

module.exports = {
    findByVentaID,
    findByVentaAndCliente,
};
