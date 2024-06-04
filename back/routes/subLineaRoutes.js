const express = require("express");
const router = express.Router();
const subLineaControllers = require("../controllers/subLineaControllers");

router.get("/subLinea", subLineaControllers.getAllSubLinea);
router.post("/addSubLinea", subLineaControllers.addSubLinea);
router.put("/dropSubLinea/:ID", subLineaControllers.dropSubLinea);
router.put("/upSubLinea/:ID", subLineaControllers.upSubLinea);
router.put("/updateSubLinea", subLineaControllers.updateSubLinea);

module.exports = router;
