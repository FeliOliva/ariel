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

const RoutesArticulos = require("./routes/articulosRoutes");
const RoutesClientes = require("./routes/clientesRoutes");
const RoutesLineas = require("./routes/lineaRoutes");
const RoutesSublineas = require("./routes/subLineaRoutes");
const RoutesVentas = require("./routes/ventasRoutes");
const RoutesZonas = require("./routes/zonasRoutes");
const RoutesDetalleVentas = require("./routes/detalleVentasRoutes");
const RoutesProveedores = require("./routes/proveedorRoutes");
const RoutesOfertas = require("./routes/ofertasRoutes");
const RoutesFilter = require("./routes/filterRoutes");
const RoutesCompras = require("./routes/comprasRoutes");
const RoutesTipoCliente = require("./routes/tipoClienteRoutes");
const RoutesCuentaCorrientes = require("./routes/cuentasCorrientesRoutes");
const RoutesGastos = require("./routes/GatosRoutes");
const RoutesMetodosPagos = require("./routes/metodosPagoRoutes");
const RoutesCheques = require("./routes/chequesRoutes");

app.use(
  "/",
  RoutesArticulos,
  RoutesClientes,
  RoutesLineas,
  RoutesSublineas,
  RoutesVentas,
  RoutesZonas,
  RoutesDetalleVentas,
  RoutesProveedores,
  RoutesOfertas,
  RoutesFilter,
  RoutesCompras,
  RoutesTipoCliente,
  RoutesCuentaCorrientes,
  RoutesGastos,
  RoutesMetodosPagos,
  RoutesCheques
);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
