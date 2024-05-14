const express = require("express");
const router = express.Router();
const marcasControllers = require("../controllers/marcasControllers");

router.get("/marcas", marcasControllers.getAllMarcas);
router.post("/addMarca", marcasControllers.addMarca);
router.put("/dropMarca/:ID", marcasControllers.dropMarca);
router.put("/upMarca/:ID", marcasControllers.upMarca);
router.put("/updateMarcas", marcasControllers.updateMarca);

module.exports = router;
