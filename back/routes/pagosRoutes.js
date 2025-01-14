const express = require("express");
const router = express.Router();
const pagosControllers = require("../controllers/pagosControllers");

router.get("/pagos", pagosControllers.getAllPagos);
router.get("/getPagosByClienteId/:ID", pagosControllers.getPagosByClienteId);
router.post("/addPago", pagosControllers.addPago);
router.put("/updatePago", pagosControllers.updatePago);

module.exports = router;