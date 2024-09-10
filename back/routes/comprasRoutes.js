const express = require("express");
const router = express.Router();
const comprasControllers = require("../controllers/comprasControllers");

router.get("/compras", comprasControllers.getAllCompras);
router.post("/addCompra", comprasControllers.addCompra);
router.get(
  "/getComprasByProveedor/:ID",
  comprasControllers.getComprasByProveedor
);
router.get("/getCompraByID/:ID", comprasControllers.getCompraByID);
module.exports = router;
