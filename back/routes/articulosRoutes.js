const express = require("express");
const router = express.Router();
const articulosControllers = require("../controllers/articulosControllers");

router.get("/articulos", articulosControllers.getAllArticulos);
router.post("/addArticulo", articulosControllers.addArticulo);
router.put("/dropArticulo/:ID", articulosControllers.dropArticulo);
router.put("/upArticulo/:ID", articulosControllers.upArticulo);
router.put("/updateArticulos", articulosControllers.updateArticulo);
router.get("/getArticuloByID/:ID", articulosControllers.getArticuloByID);
router.get(
  "/getArticulosByProveedorID/:proveedorID",
  articulosControllers.getArticulosByProveedorID
);
router.get(
  "/getArticulosByLineaID/:lineaID",
  articulosControllers.getArticulosByLineaID
);
router.get(
  "/getArticulosBySubLineaID/:subLineaID",
  articulosControllers.getArticulosBySubLineaID
);
router.put("/increasePrice/:ID", articulosControllers.increasePrice);
router.put("/increasePrices/:linea_id", articulosControllers.increasePrices);
router.post("/updateLog", articulosControllers.updateLogPrecios);
router.get("/logsPreciosById/:ID", articulosControllers.logsPreciosById);
router.put("/deshacerCambios/:id", articulosControllers.deshacerCambios);
router.get("/getArticulosOrdenados", articulosControllers.getArticulosOrdenados);
module.exports = router;
