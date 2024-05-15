const express = require("express");
const router = express.Router();
const zonaControllers = require("../controllers/zonasControllers");

router.get("/zonas", zonaControllers.getAllZonas);
router.post("/addZona", zonaControllers.addZona);
router.put("/dropZona/:ID", zonaControllers.dropZona);
router.put("/upZona/:ID", zonaControllers.upZona);
router.put("/updateZona", zonaControllers.updateZona);

module.exports = router;
