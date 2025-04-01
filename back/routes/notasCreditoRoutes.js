const express = require("express");
const router = express.Router();
const notasCreditoControllers = require("../controllers/notasCreditoControllers");

router.get("/notasCreditoByClienteId/:ID", notasCreditoControllers.getAllNotasCreditoByClienteId);
router.get("/getNotaCreditoById/:ID", notasCreditoControllers.getNotaCreditoById);
router.post("/addNotaCredito", notasCreditoControllers.addNotaCredito);
router.get("/getDetallesNotaCredito/:ID", notasCreditoControllers.getDetallesNotaCredito);
router.put("/dropNotaCredito/:ID", notasCreditoControllers.dropNotaCredito);
router.get("/getNotasCreditoByZonaID/:ID", notasCreditoControllers.getNotasCreditoByZona);
router.put("/updateNotaCredito", notasCreditoControllers.updateNotaCredito);

module.exports = router;