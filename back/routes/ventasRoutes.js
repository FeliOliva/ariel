const express = require("express");
const router = express.Router();
const ventaControllers = require("../controllers/ventasControllers");

router.get("/ventas", ventaControllers.getAllVentas);
router.post("/addVenta", ventaControllers.addVenta);
router.put("/dropVenta/:ID", ventaControllers.dropVenta);
router.put("/upVenta/:ID", ventaControllers.upVenta);
router.put("/updateVentas", ventaControllers.updateVentas);
router.get("/ventasCliente/:ID", ventaControllers.getVentasByClientes);
router.get("/ventasZona/:ID", ventaControllers.getVentasByZona);
router.get("/ventasProducto/:ID", ventaControllers.getVentasByProducto);
module.exports = router;
