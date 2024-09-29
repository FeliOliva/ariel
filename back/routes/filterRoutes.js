const express = require("express");
const router = express.Router();
const filterControllers = require("../controllers/filterControllers");

router.post("/filterVentasByCliente", filterControllers.filterVentasByCliente);

module.exports = router;
