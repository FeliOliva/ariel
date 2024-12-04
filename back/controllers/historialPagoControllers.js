const historialPagoModel = require("../models/historialPagoModel");

const getAllHistorialPagoByVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;
        const historial = await historialPagoModel.findByVentaID(venta_id);
        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
