const db = require("../database");
const queriesNotasCredito = require("../querys/queriesNotasCredito");

const getAllNotasCreditoByClienteId = async (cliente_id) => {
    try {
        const query = queriesNotasCredito.getAllNotasCreditoByClienteId;
        const [rows] = await db.query(query, [cliente_id]);
        return rows;
    } catch (err) {
        throw err;
    }
}
const addNotaCredito = async (cliente_id) => {
    try {
        const query = queriesNotasCredito.addNotaCredito;
        const [result] = await db.query(query, [cliente_id]);
        return result.insertId;
    } catch (err) {
        throw err;
    }
}

const getDetallesNotaCredito = async (ID) => {
    try {
        const query = queriesNotasCredito.getDetallesNotaCredito;
        const [rows] = await db.query(query, [ID]);
        return rows;
    } catch (err) {
        throw err;
    }
}
const addDetallesNotaCredito = async (notaCreditoId, articulo_id, cantidad, precio) => {
    try {
        console.log("detalles");
        console.log("notaCreditoId", notaCreditoId);
        console.log("articulo_id", articulo_id);
        console.log("cantidad", cantidad);
        console.log("precio", precio);
        const query = queriesNotasCredito.addDetallesNotaCredito;
        await db.query(query, [notaCreditoId, articulo_id, cantidad, precio]);
    } catch (err) {
        throw err;
    }
}
const updateStock = async (articulo_id, cantidad) => {
    try {
        const query = queriesNotasCredito.updateStock;
        await db.query(query, [cantidad, articulo_id]); // Asegúrate de que cantidad se sume al stock
    } catch (err) {
        throw err;
    }
};
const dropNotaCredito = async (ID) => {
    try {
        const query = queriesNotasCredito.dropNotaCredito;
        await db.query(query, [ID]);
    } catch (err) {
        throw err;
    }
}
const upNotaCredito = async (ID) => {
    try {
        const query = queriesNotasCredito.upNotaCredito;
        await db.query(query, [ID]);
    } catch (err) {
        throw err;
    }
}
const getNotasCreditoByZona = async (zona_id) => {
    try {
        const query = queriesNotasCredito.getNotasCreditoByZona;
        const [rows] = await db.query(query, [zona_id]);
        return rows;
    } catch (err) {
        throw err;
    }
};

module.exports = { getAllNotasCreditoByClienteId, addNotaCredito, addDetallesNotaCredito, updateStock, dropNotaCredito, upNotaCredito, getNotasCreditoByZona, getDetallesNotaCredito };