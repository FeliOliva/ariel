const express = require("express");
const app = express();
const cors = require("cors"); // Importa el módulo cors
require("dotenv").config();

const PORT = process.env.PORT;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS no permitido"), false);
    },
    credentials: true,
  })
);
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
const RoutesGastos = require("./routes/GatosRoutes");
const RoutesCheques = require("./routes/chequesRoutes");
const RoutesPagos = require("./routes/pagosRoutes");
const RoutesNotasCredito = require("./routes/notasCreditoRoutes");
const RoutesPedidos = require("./routes/pedidosRoutes");
const RoutesEstadisticas = require("./routes/estadisticasRoutes");
const RoutesVendedores = require("./routes/vendedoresRoutes");
const RoutesCierreCuenta = require("./routes/cierreCuentaRoutes");
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
  RoutesGastos,
  RoutesCheques,
  RoutesPagos,
  RoutesNotasCredito,
  RoutesPedidos,
  RoutesEstadisticas,
  RoutesVendedores,
  RoutesCierreCuenta
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
});
