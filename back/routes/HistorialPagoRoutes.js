const express = require("express");
const router = express.Router();
const historialPagoControllers = require("../controllers/historialPagoControllers");

router.get("/historialPagoByVentaID/:venta_id", historialPagoControllers.getAllHistorialPagoByVenta);
router.get("/historialPagoByVentaAndCliente/:venta_id/:cliente_id", historialPagoControllers.getHistorialPagoByVentaAndCliente);

module.exports = router;
