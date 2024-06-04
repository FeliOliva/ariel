const express = require("express");
const router = express.Router();
const lineaControllers = require("../controllers/lineaControllers");

router.get("/lineas", lineaControllers.getAllLineas);
router.post("/addLinea", lineaControllers.addLinea);
router.put("/dropLinea/:ID", lineaControllers.dropLinea);
router.put("/upLinea/:ID", lineaControllers.upLinea);
router.put("/updateLinea", lineaControllers.updateLinea);
module.exports = router;
