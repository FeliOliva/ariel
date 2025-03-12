const express = require('express');
const router = express.Router();
const pedidoController = require("../controllers/pedidoController")


router.get("/pedidos", pedidoController.getAllPedidos);
router.get("/pedidos/:id", pedidoController.getPedidoById);
router.get("/detallesPedido/:id", pedidoController.getDetallesPedido);
router.get("/detallePedidoById/:id", pedidoController.getDetallePedidoById)
router.post("/pedidos", pedidoController.addPedido);
router.put("/pedido/detalle", pedidoController.updateCantidadDetalle);
router.delete("/dropPedido/:id", pedidoController.dropPedido);
router.post("/upPedido/:id", pedidoController.upPedido);

module.exports = router;