const express = require("express");
const router = express.Router();
const estadisticasController = require("../controllers/estadisticasController");

router.get("/estadisticas/masVendidos", estadisticasController.getMasVendidos);
router.get(
  "/estadisticas/masRentables",
  estadisticasController.getMasRentables
);
router.get(
  "/estadisticas/comparativaVentas",
  estadisticasController.getComparativaVentas
);
router.get(
  "/estadisticas/articulosSinVentas",
  estadisticasController.getArticulosSinVentas
);
router.get(
  "/estadisticas/evolucionVentas",
  estadisticasController.getEvolucionVentas
);
router.get(
  "/estadisticas/masUnidadesVendidas",
  estadisticasController.getMasUnidadesVendidas
);
router.get(
  "/estadisticas/precioPromedioVenta",
  estadisticasController.getPrecioPromedioVenta
);

module.exports = router;
