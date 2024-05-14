const express = require("express");
const app = express();
const cors = require("cors"); // Importa el módulo cors
require("dotenv").config();

const PORT = process.env.PORT;
// Habilita CORS para todas las rutas, con esta sentencia permite todo
app.use(cors());
// Middleware para parsear JSON y URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RoutesProductos = require("../back/routes/productosRoutes");
const RoutesClientes = require("../back/routes/clientesRoutes");
const RoutesCategorias = require("../back/routes/categoriasRoutes");
const RoutesSubCategorias = require("../back/routes/subCategoriasRoutes");
const RoutesMarcas = require("../back/routes/marcasRoutes");

app.use(
  "/",
  RoutesProductos,
  RoutesClientes,
  RoutesCategorias,
  RoutesSubCategorias,
  RoutesMarcas
);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
