const notasCreditoModel = require("../models/notasCreditoModel");

const getAllNotasCreditoByClienteId = async (req, res) => {
    try {
        const cliente_id = req.params.ID;
        const notasCredito = await notasCreditoModel.getAllNotasCreditoByClienteId(cliente_id);
        res.json(notasCredito);
    } catch (error) {
        console.error("Error al obtener todas las notas de crédito:", error);
        res.status(500).json({ error: "Error al obtener todas las notas de crédito" });
    }
}
const addNotaCredito = async (req, res) => {
    try {
        const { cliente_id, detalles } = req.body;
        console.log("datos desde el back", req.body)
        const notaCreditoId = await notasCreditoModel.addNotaCredito(cliente_id);
        console.log("id de la nota de credito", notaCreditoId)
        for (const detalle of detalles) {
            await notasCreditoModel.addDetallesNotaCredito(notaCreditoId, detalle.articulo_id, detalle.cantidad, detalle.precio);
            await notasCreditoModel.updateStock(detalle.articulo_id, detalle.cantidad); // Actualiza el stock sumando la cantidad
        }
        res.status(200).json({ message: "Nota de crédito creada con éxito" });
    } catch (error) {
        console.error("Error al crear la nota de crédito:", error);
        res.status(500).json({ error: "Error al crear la nota de crédito" });
    }
}
const dropNotaCredito = async (req, res) => {
    try {
        const ID = req.params.ID;
        await notasCreditoModel.dropNotaCredito(ID);
        res.status(200).json({ message: "Nota de credito eliminada con exito" });
    } catch (error) {
        console.error("Error al eliminar la nota de credito:", error);
        res.status(500).json({ error: "Error al eliminar la nota de credito" });
    }
}
const upNotaCredito = async (req, res) => {
    try {
        const ID = req.params.ID;
        await notasCreditoModel.upNotaCredito(ID);
        res.status(200).json({ message: "Nota de credito actualizada con exito" });
    } catch (error) {
        console.error("Error al actualizar la nota de credito:", error);
        res.status(500).json({ error: "Error al actualizar la nota de credito" });
    }
}
const getNotasCreditoByZona = async (req, res) => {
    try {
        const { ID: zona_id } = req.params;

        if (!zona_id) {
            return res.status(400).json({ error: "ID de zona no proporcionado" });
        }

        const notasCredito = await notasCreditoModel.getNotasCreditoByZona(
            zona_id,
        );

        if (!notasCredito || notasCredito.length === 0) {
            return res.json([]); // Si no hay notas, devolver un array vacío
        }

        res.json(notasCredito);
    } catch (error) {
        console.error("Error al obtener notas de crédito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { getAllNotasCreditoByClienteId, addNotaCredito, dropNotaCredito, upNotaCredito, getNotasCreditoByZona };