const express = require("express");
const router = express.Router();
const filterControllers = require("../controllers/filterControllers");

router.get("/filterVentas", filterControllers.filterVentas);

module.exports = router;
