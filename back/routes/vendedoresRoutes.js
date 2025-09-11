const express = require("express");
const router = express.Router();
const vendedoresControllers = require("../controllers/vendedoresControllers");

router.get("/vendedores", vendedoresControllers.getAllVendedores);
router.post("/addVendedor", vendedoresControllers.addVendedor);
router.get("/getVendedorByID/:ID", vendedoresControllers.getVendedorByID);
router.delete("/dropVendedor/:ID", vendedoresControllers.dropVendedor);
router.put("/updateVendedor", vendedoresControllers.updateVendedor);
router.get("/pagosPorVendedor", vendedoresControllers.getPagosPorVendedor);

module.exports = router;
