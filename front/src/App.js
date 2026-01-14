import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";

// Lazy loading de todos los componentes - solo se cargan cuando se necesitan
const Inicio = lazy(() => import("./Routes/Inicio"));
const Clientes = lazy(() => import("./Routes/Clientes"));
const Articulos = lazy(() => import("./Routes/Articulos"));
const ArticulosDetalles = lazy(() => import("./Routes/ArticulosDetalles"));
const Venta = lazy(() => import("./Routes/Ventas"));
const VentaDetalles = lazy(() => import("./Routes/VentaDetalles"));
const Linea = lazy(() => import("./Routes/Linea"));
const SubLinea = lazy(() => import("./Routes/SubLinea"));
const Proveedor = lazy(() => import("./Routes/Proveedor"));
const Zonas = lazy(() => import("./Routes/Zonas"));
const Compras = lazy(() => import("./Routes/Compras"));
const CompraDetalles = lazy(() => import("./Routes/CompraDetalles"));
const ResumenCuenta = lazy(() => import("./Routes/ResumenCuenta"));
const Gastos = lazy(() => import("./Routes/Gastos"));
const Cheques = lazy(() => import("./Routes/Cheques"));
const ResumenCuentaXZona = lazy(() => import("./Routes/ResuemenCuentaXZona"));
const ResumenZonas = lazy(() => import("./Routes/ResumenZonas"));
const Pedido = lazy(() => import("./Routes/Pedido"));
const PedidoDetalles = lazy(() => import("./Routes/PedidoDetalles"));
const EstadisticasDashboard = lazy(() => import("./Routes/EstadisticasDashboard"));
const ResumenPagosPorVendedor = lazy(() => import("./Routes/ResumenPagosPorVendedor"));
const ResumenVentasPorFecha = lazy(() => import("./Routes/VentasPorFechas"));

// Componente de carga mientras se cargan los componentes lazy
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/Articulos" element={<Articulos />} />
        <Route path="/ArticulosDetalles" element={<ArticulosDetalles />} />
        <Route path="/Ventas" element={<Venta />} />
        <Route path="/venta/:id" element={<VentaDetalles />} />
        <Route path="/linea" element={<Linea />} />
        <Route path="/linea/:id" element={<SubLinea />} />
        <Route path="/proveedor" element={<Proveedor />} />
        <Route path="/zonas" element={<Zonas />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/compras/:id" element={<CompraDetalles />} />
        <Route path="/ResumenCuenta" element={<ResumenCuenta />} />
        <Route path="/Gastos" element={<Gastos />} />
        <Route path="/Cheques" element={<Cheques />} />
        <Route path="/ResumenCuentaXZona" element={<ResumenCuentaXZona />} />
        <Route path="/ResumenZonas" element={<ResumenZonas />} />
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/pedido/:id" element={<PedidoDetalles />} />
        <Route path="/estadisticas" element={<EstadisticasDashboard />} />
        <Route
          path="/ResumenCuentaXVendedor"
          element={<ResumenPagosPorVendedor />}
        />
        <Route path="/ventasPorFechas" element={<ResumenVentasPorFecha />} />
      </Routes>
    </Suspense>
  );
}

export default App;
