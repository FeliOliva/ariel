const express = require("express");
const router = express.Router();
const chequesControllers = require("../controllers/chequesControllers");

router.get("/cheques", chequesControllers.getAllCheques);
router.post("/addCheque", chequesControllers.addCheque);
router.put("/dropCheque/:ID", chequesControllers.dropCheque);
router.put("/upCheque/:ID", chequesControllers.upCheque);
router.put("/updateCheques", chequesControllers.updateCheques);
router.get("/getChequeByID/:ID", chequesControllers.getChequeByID);

module.exports = router;
