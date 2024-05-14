const express = require("express");
const router = express.Router();
const categoryControllers = require("../controllers/categoriaControllers");

router.get("/categorias", categoryControllers.getAllCategories);
router.post("/addCategory", categoryControllers.addCategory);
router.put("/dropCategory/:ID", categoryControllers.dropCategory);
router.put("/upCategory/:ID", categoryControllers.upCategory);
router.put("/updateCategories", categoryControllers.updateCategories);
module.exports = router;
