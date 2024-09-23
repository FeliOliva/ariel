const express = require("express");
const router = express.Router();
const gastosControllers = require("../controllers/gastosControllers");

router.get("/gastos", gastosControllers.getAllGastos);
router.post("/addGasto", gastosControllers.addGasto);
router.put("/dropGasto/:ID", gastosControllers.dropGasto);
router.put("/upGasto/:ID", gastosControllers.upGasto);
router.put("/updateGastos", gastosControllers.updateGastos);
router.get("/getGastoByID/:ID", gastosControllers.getGastoByID);
module.exports = router;
