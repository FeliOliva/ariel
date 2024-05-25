const express = require("express");
const router = express.Router();
const detalleVentaControllers = require("../controllers/detalleVentasControllers");

router.get("/detalleventas", detalleVentaControllers.getAllDetalleVentas);
router.post("/addDetalleVenta", detalleVentaControllers.addDetalleVenta);
router.put("/deleteDetalleVenta/:ID", detalleVentaControllers.deleteDetalleVenta);
router.put("/updateDetalleVenta/:ID", detalleVentaControllers.updateDetalleVenta);

module.exports = router;
