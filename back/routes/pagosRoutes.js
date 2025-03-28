const express = require("express");
const router = express.Router();
const pagosControllers = require("../controllers/pagosControllers");

router.get("/pagos", pagosControllers.getAllPagos);
router.get("/getPagosByClienteId/:ID", pagosControllers.getPagosByClienteId);
router.get("/getPagoById/:ID", pagosControllers.getPagoById);
router.post("/addPago", pagosControllers.addPago);
router.put("/updatePago", pagosControllers.updatePago);
router.get("/getPagosByZona_id/:ID", pagosControllers.getPagosByZona_id);
router.put("/dropPago/:id", pagosControllers.dropPago);

module.exports = router;
