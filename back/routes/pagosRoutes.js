const express = require("express");
const router = express.Router();
const pagosControllers = require("../controllers/pagosControllers");

router.get("/pagos", pagosControllers.getAllPagos);
router.get("/getPagosByClienteId/:ID", pagosControllers.getPagosByClienteId);
router.post("/addPago", pagosControllers.addPago);
router.put("/updatePago", pagosControllers.updatePago);
router.get("/getPagosByZona_id/:ID", pagosControllers.getPagosByZona_id);

module.exports = router;