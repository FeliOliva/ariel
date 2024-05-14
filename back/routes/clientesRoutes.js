const express = require("express");
const router = express.Router();
const clientControllers = require("../controllers/clientesControllers");

router.get("/clientes", clientControllers.getAllClients);
router.post("/addClient", clientControllers.addClient);
module.exports = router;
