const express = require("express");
const router = express.Router();
const ofertasControllers = require("../controllers/ofertaControllers");

router.get("/ofertas", ofertasControllers.getAllOfertas);
router.post("/addOferta", ofertasControllers.addOferta);
router.put("/dropOferta/:ID", ofertasControllers.dropOferta);
router.put("/upOferta/:ID", ofertasControllers.upOferta);
router.put("/updateOferta", ofertasControllers.updateOferta);//todavia no funciona
router.get("/detalleOferta/:ID", ofertasControllers.getOfertaById);

module.exports = router;
