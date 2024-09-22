const express = require("express");
const router = express.Router();
const cuentaCorrienteControllers = require("../controllers/cuentaCorrienteControllers");

router.get("/cuentascorrientes", cuentaCorrienteControllers.getAllCuentas);
router.put(
  "/payByCuentaCorriente",
  cuentaCorrienteControllers.payByCuentaCorriente
);
router.put("/payCuentaByTotal", cuentaCorrienteControllers.payCuentaByTotal);
router.get(
  "/cuentasCorrientesByCliente/:ID",
  cuentaCorrienteControllers.getCuentasByCliente
);

module.exports = router;
