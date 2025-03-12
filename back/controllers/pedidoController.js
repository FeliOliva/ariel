const pedidoModel = require('../models/pedidoModel');

const getAllPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoModel.getAllPedidos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getPedidoById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Falta el id' });
            return;
        }
        const pedido = await pedidoModel.getPedidoById(id);
        res.json(pedido[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const addPedido = async (req, res) => {
    try {
        const { estado, detalles } = req.body; // `detalles` es un array con los productos del pedido

        if (!estado || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: "Faltan datos o detalles inválidos" });
        }

        // Crear el pedido en la base de datos
        const pedidoId = await pedidoModel.addPedido(estado);

        // Insertar los detalles del pedido
        for (const detalle of detalles) {
            const { articulo_id, cantidad } = detalle;
            await pedidoModel.addDetallePedido(pedidoId, articulo_id, cantidad);
        }

        res.status(201).json({ message: "Pedido agregado con éxito", pedidoId });
    } catch (error) {
        console.error("Error al agregar el pedido:", error);
        res.status(500).json({ error: "Error al agregar el pedido" });
    }
};
const getDetallesPedido = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Falta el id' });
            return;
        }
        const detalles = await pedidoModel.getDetallesPedido(id);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("Error al obtener los detalles del pedido:", error);
    }
}
const getDetallePedidoById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Falta el id' });
            return;
        }
        const detallesPedido = await pedidoModel.getDetallePedidoById(id)
        res.json(detallesPedido[0])
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el detalle" })
    }
}
const updateCantidadDetalle = async (req, res) => {
    try {
        const { detalleId, nuevaCantidad } = req.body;

        if (!detalleId || !nuevaCantidad) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        await pedidoModel.updateCantidadDetalle(detalleId, nuevaCantidad);
        res.json({ message: "Cantidad actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar la cantidad:", error);
        res.status(500).json({ error: error.message });
    }
};

const dropPedido = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Falta el id' });
            return;
        }
        await pedidoModel.dropPedido(id);
        res.json({ message: 'Pedido eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const upPedido = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Falta el id' });
            return;
        }
        await pedidoModel.upPedido(id);
        res.json({ message: 'Pedido actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addPedido, getAllPedidos, getPedidoById, updateCantidadDetalle, dropPedido, upPedido, getDetallesPedido, getDetallePedidoById };