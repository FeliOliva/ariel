const notasCreditoModel = require("../models/notasCreditoModel");

const getAllNotasCreditoByClienteId = async (req, res) => {
    try {
        const cliente_id = req.params.ID;
        const notasCreditoDetalles = await notasCreditoModel.getAllNotasCreditoByClienteId(cliente_id);

        if (notasCreditoDetalles.length === 0) {
            return res.status(404).json({ error: "No se encontraron notas de crédito para este cliente" });
        }

        // Transformar los datos en un solo objeto por cada nota de crédito
        const notasCreditoMap = new Map();

        notasCreditoDetalles.forEach((detalle) => {
            const notaCreditoId = detalle.notaCredito_id;

            if (!notasCreditoMap.has(notaCreditoId)) {
                notasCreditoMap.set(notaCreditoId, {
                    notaCredito_id: detalle.notaCredito_id,
                    nroNC: detalle.nroNC,
                    cliente_nombre: detalle.cliente_farmacia + " " + detalle.cliente_nombre + " " + detalle.cliente_apellido,
                    fecha: detalle.notaCredito_fecha,
                    estado: detalle.estado,
                    total: detalle.totalNC,
                    detalles: []
                });
            }

            notasCreditoMap.get(notaCreditoId).detalles.push({
                detalle_id: detalle.detalle_id,
                articulo_id: detalle.articulo_id,
                articulo_nombre: detalle.cod_articulo + " - " + detalle.articulo_nombre + " - " + detalle.nombre_linea + " - " + detalle.nombre_sublinea,
                cantidad: detalle.cantidad,
                fecha: detalle.detalle_fecha,
                precio: detalle.precio,
                subTotal: detalle.subTotal
            });
        });

        // Convertir el Map a un array de objetos
        const notasCreditoArray = Array.from(notasCreditoMap.values());

        res.json(notasCreditoArray);
    } catch (error) {
        console.error("Error al obtener todas las notas de crédito:", error);
        res.status(500).json({ error: "Error al obtener todas las notas de crédito" });
    }
};

const getDetallesNotaCredito = async (req, res) => {
    try {
        const ID = req.params.ID;
        const detalles = await notasCreditoModel.getDetallesNotaCredito(ID);
        res.json(detalles);
    } catch (error) {
        console.error("Error al obtener los detalles de la nota de credito:", error);
        res.status(500).json({ error: "Error al obtener los detalles de la nota de credito" });
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

module.exports = { getAllNotasCreditoByClienteId, addNotaCredito, dropNotaCredito, getNotasCreditoByZona, getDetallesNotaCredito };