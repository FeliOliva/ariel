const express = require("express");
const router = express.Router();
const subCategoryControllers = require("../controllers/subCategoriasControllers");

router.get("/subcategorias", subCategoryControllers.getAllSubCategories);
router.post("/addSubCategory", subCategoryControllers.addSubCategory);
router.put("/dropSubCategory/:ID", subCategoryControllers.dropSubCategory);
router.put("/upSubCategory/:ID", subCategoryControllers.upSubCategory);
router.put("/updateSubCategories", subCategoryControllers.updateSubCategories);

module.exports = router;
