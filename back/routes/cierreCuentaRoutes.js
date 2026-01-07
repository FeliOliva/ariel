const express = require("express");
const router = express.Router();
const cierreCuentaControllers = require("../controllers/cierreCuentaControllers");

// Obtener cierre de cuenta por cliente
router.get("/cierre-cuenta/:cliente_id", cierreCuentaControllers.getCierreCuentaByCliente);

// Obtener todos los cierres de un cliente
router.get("/cierres-cuenta/:cliente_id", cierreCuentaControllers.getAllCierresByCliente);

// Verificar si existe un cierre
router.get("/cierre-cuenta-existe/:cliente_id", cierreCuentaControllers.existeCierre);

// Obtener todos los últimos cierres
router.get("/cierres-cuenta", cierreCuentaControllers.getAllUltimosCierres);

// Obtener cierres por zona
router.get("/cierres-cuenta-zona", cierreCuentaControllers.getCierresByZona);

// Vista previa de saldos de todos los clientes
router.get("/cierre-masivo/preview", cierreCuentaControllers.getSaldosTodosClientes);

// Contar cierres existentes por fecha
router.get("/cierre-masivo/count", cierreCuentaControllers.contarCierresPorFecha);

// Obtener saldo total del cierre masivo
router.get("/cierre-masivo/saldo-total", cierreCuentaControllers.getSaldoTotalCierreMasivo);

// Ejecutar cierre masivo de todas las cuentas
router.post("/cierre-masivo", cierreCuentaControllers.ejecutarCierreMasivo);

// Agregar cierre de cuenta individual
router.post("/cierre-cuenta", cierreCuentaControllers.addCierreCuenta);

// Actualizar cierre de cuenta
router.put("/cierre-cuenta", cierreCuentaControllers.updateCierreCuenta);

// Eliminar cierre de cuenta
router.delete("/cierre-cuenta/:id", cierreCuentaControllers.deleteCierreCuenta);

module.exports = router;

