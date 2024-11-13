const historialPagoModel = require("../models/historialPagoModel");

// Controlador para obtener historial de pago solo por `venta_id`
const getAllHistorialPagoByVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;
        const historial = await historialPagoModel.findByVentaID(venta_id);
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para obtener historial de pago por `venta_id` y `cliente_id`
const getHistorialPagoByVentaAndCliente = async (req, res) => {
    try {
        const { venta_id, cliente_id } = req.params;
        const historial = await historialPagoModel.findByVentaAndCliente(venta_id, cliente_id);
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllHistorialPagoByVenta,
    getHistorialPagoByVentaAndCliente,
};
