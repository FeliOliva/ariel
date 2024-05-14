const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productosControllers");

router.get("/productos", productControllers.getAllProducts);
router.post("/addProduct", productControllers.addProduct);
router.put("/dropProduct/:ID", productControllers.dropProduct);
router.put("/upProduct/:ID", productControllers.upProduct);
router.put("/updateProducts", productControllers.updateProducts);
module.exports = router;
