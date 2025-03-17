const express = require("express");
const router = express.Router();
const lineaControllers = require("../controllers/lineaControllers");

router.get("/lineas", lineaControllers.getAllLineas);
router.post("/addLinea", lineaControllers.addLinea);
router.put("/dropLinea/:ID", lineaControllers.dropLinea);
router.put("/upLinea/:ID", lineaControllers.upLinea);
router.put("/updateLinea", lineaControllers.updateLinea);
router.get(
  "/getSubLineasByLinea/:linea_id",
  lineaControllers.getSubLineasByLinea
);
router.get("/getLastLinea", lineaControllers.getLastLinea);
router.get("/getLineaByID/:ID", lineaControllers.getLineaByID);
router.post("/guardar-lineas", lineaControllers.guardarLineas)
router.get("/lineas-guardadas", lineaControllers.obtenerLineasGuardadas);
router.put("/eliminarLineas", lineaControllers.deleteLineasStock)


module.exports = router;
