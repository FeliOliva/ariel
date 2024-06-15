const express = require("express");
const router = express.Router();
const proveedorControllers = require("../controllers/proveedorControllers");

router.get("/proveedor", proveedorControllers.getAllProveedores);
router.post("/addProveedor", proveedorControllers.addProveedor);
router.put("/dropProveedore/:ID", proveedorControllers.dropProveedor);
router.put("/upProveedore/:ID", proveedorControllers.upProveedor);
router.put("/updateProveedor", proveedorControllers.updateProveedor);
router.get("/getProveedorByID/:ID", proveedorControllers.getProveedorByID);
module.exports = router;
