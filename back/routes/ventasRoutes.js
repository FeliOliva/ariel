const express = require("express");
const router = express.Router();
const ventaControllers = require("../controllers/ventasControllers");

router.get("/ventas", ventaControllers.getAllVentas);
router.post("/addVenta", ventaControllers.addVenta);
router.put("/dropVenta/:ID", ventaControllers.dropVenta);
router.put("/upVenta/:ID", ventaControllers.upVenta);
router.put("/updateVentas", ventaControllers.updateVentas); //todavia no funciona
router.get("/ventasCliente/:ID", ventaControllers.getVentasByClientes);
router.get("/ventasZona/:ID", ventaControllers.getVentasByZona);
router.get("/ventasProducto/:ID", ventaControllers.getVentasByProducto);
router.get("/getVentaByID/:ID", ventaControllers.getVentaByID);
router.get(
  "/ventasxclientexfecha/:ID",
  ventaControllers.getVentasByClientesxFecha
);
router.get("/resumenCliente/:ID", ventaControllers.getResumenCliente);
router.get("/resumenZonas", ventaControllers.getResumenZonas);
module.exports = router;
