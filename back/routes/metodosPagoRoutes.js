const express = require("express");
const router = express.Router();
const metodosPagoControllers = require("../controllers/metodosPagoControllers");

router.get("/metodosPago", metodosPagoControllers.getAllMetodosPago);
router.post("/addMetodo", metodosPagoControllers.addMetodo);
router.put("/updateMetodo", metodosPagoControllers.updateMetodo);

module.exports = router;
