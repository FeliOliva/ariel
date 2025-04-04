const express = require("express");
const router = express.Router();
const detalleVentaControllers = require("../controllers/detalleVentasControllers");

router.get("/detalleVenta/:id", detalleVentaControllers.getDetalleVentaById);
router.put("/updateDetalleVenta", detalleVentaControllers.updateDetalleVenta);

module.exports = router;
