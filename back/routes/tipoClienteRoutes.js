const express = require("express");
const router = express.Router();
const tipoClienteControllers = require("../controllers/tipoClienteControllers");

router.get("/tipocliente", tipoClienteControllers.getAllTipoCliente);
router.post("/addTipoCliente", tipoClienteControllers.addTipoCliente);
router.put("/dropTipoCliente/:ID", tipoClienteControllers.dropTipoCliente);
router.put("/upTipoCliente/:ID", tipoClienteControllers.upTipoCliente);
router.put("/updateTipoCliente", tipoClienteControllers.updateTipoCliente);
router.get(
  "/getTipoClienteByID/:ID",
  tipoClienteControllers.getTipoClienteByID
);
module.exports = router;
