const express = require("express");
const router = express.Router();
const notasCreditoControllers = require("../controllers/notasCreditoControllers");

router.get("/notasCreditoByClienteId/:ID", notasCreditoControllers.getAllNotasCreditoByClienteId);
router.post("/addNotaCredito", notasCreditoControllers.addNotaCredito);
router.put("/dropNotaCredito/:ID", notasCreditoControllers.dropNotaCredito);
router.put("/upNotaCredito/:ID", notasCreditoControllers.upNotaCredito);
router.get("/getNotasCreditoByZonaID/:ID", notasCreditoControllers.getNotasCreditoByZona);

module.exports = router;