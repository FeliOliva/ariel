const express = require("express");
const router = express.Router();
const cuentaCorrienteControllers = require("../controllers/cuentaCorrienteControllers");

router.get(
  "/cuentascorrientesByCliente/:ID",
  cuentaCorrienteControllers.getAllCuentasCorrientesByCliente
);
router.put(
  "/payByCuentaCorriente",
  cuentaCorrienteControllers.payByCuentaCorriente
);
router.put("/payCuentaByTotal", cuentaCorrienteControllers.payCuentaByTotal);
router.get(
  "/cuentasCorrientesByCliente/:ID",
  cuentaCorrienteControllers.getCuentasByCliente
);
router.get(
  "/TotalCuentasByCliente/:ID",
  cuentaCorrienteControllers.getTotalCuentasByCliente
);

module.exports = router;
