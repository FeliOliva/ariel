const express = require("express");
const router = express.Router();
const filterControllers = require("../controllers/filterControllers");

router.post("/filterVentasByCliente", filterControllers.filterVentasByCliente);
router.get("/totalVentas", filterControllers.totalVentas);
router.get("/totalGastos", filterControllers.totalGastos);
router.get("/totalCompras", filterControllers.totalCompras);
router.get("/filterComprasByFecha", filterControllers.filterComprasByFecha);
router.get("/totalPagos", filterControllers.totalPagos);
router.get("/totalClientes", filterControllers.totalClientes);
router.get("/totalNotasCredito", filterControllers.totalNotasCredito);
router.get("/totalGanancia", filterControllers.totalGanancia);


module.exports = router;
