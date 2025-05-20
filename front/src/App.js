import React from "react";
import { Routes, Route } from "react-router-dom";
import Clientes from "./Routes/Clientes";
import Articulos from "./Routes/Articulos";
import Inicio from "./Routes/Inicio";
import Venta from "./Routes/Ventas";
import VentaDetalles from "./Routes/VentaDetalles";
import Linea from "./Routes/Linea";
import SubLinea from "./Routes/SubLinea";
import Proveedor from "./Routes/Proveedor";
import Zonas from "./Routes/Zonas";
import Ofertas from "./Routes/Ofertas";
import OfertasDetalles from "./Routes/OfertasDetalles";
import Compras from "./Routes/Compras";
import CompraDetalles from "./Routes/CompraDetalles";
import ResumenCuenta from "./Routes/ResumenCuenta";
import Gastos from "./Routes/Gastos";
import ArticulosDetalles from "./Routes/ArticulosDetalles";
import Cheques from "./Routes/Cheques";
import ResumenCuentaXZona from "./Routes/ResuemenCuentaXZona";
import ResumenZonas from "./Routes/ResumenZonas";
import Pedido from "./Routes/Pedido";
import PedidoDetalles from "./Routes/PedidoDetalles";
import EstadisticasDashboard from "./Routes/EstadisticasDashboard";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/Articulos" element={<Articulos />} />
      <Route path="/ArticulosDetalles" element={<ArticulosDetalles />} />
      <Route path="/Ventas" element={<Venta />} />
      <Route path="/venta/:id" element={<VentaDetalles />} />{" "}
      <Route path="/linea" element={<Linea />} />
      <Route path="/linea/:id" element={<SubLinea />} />
      <Route path="/proveedor" element={<Proveedor />} />
      <Route path="/zonas" element={<Zonas />} />
      <Route path="/ofertas" element={<Ofertas />} />
      <Route path="/ofertas/:id" element={<OfertasDetalles />} />
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
    </Routes>
  );
}

export default App;
