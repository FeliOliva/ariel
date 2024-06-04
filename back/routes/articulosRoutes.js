const express = require("express");
const router = express.Router();
const articulosControllers = require("../controllers/articulosControllers");

router.get("/articulos", articulosControllers.getAllArticulos);
router.post("/addArticulo", articulosControllers.addArticulo);
router.put("/dropArticulo/:ID", articulosControllers.dropArticulo);
router.put("/upArticulo/:ID", articulosControllers.upArticulo);
router.put("/updateArticulos", articulosControllers.updateArticulo);
module.exports = router;
