const express = require("express");
const router = express.Router();
const clientControllers = require("../controllers/clientesControllers");

router.get("/clientes", clientControllers.getAllClients);
router.post("/addClient", clientControllers.addClient);
router.put("/dropClient/:ID", clientControllers.dropClient);
router.put("/upClient/:ID", clientControllers.upClient);
router.put("/updateClients", clientControllers.updateClients);
module.exports = router;
