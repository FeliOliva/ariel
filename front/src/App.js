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
import MenuLayout from "./components/MenuLayout";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/Articulos" element={<Articulos />} />
      <Route path="/Ventas" element={<Venta />} />
      <Route path="/venta/:id" element={<VentaDetalles />} />{" "}
      <Route path="/linea" element={<Linea />} />
      <Route path="/linea/:id" element={<SubLinea />} />
      <Route path="/proveedor" element={<Proveedor />} />
      <Route path="/zonas" element={<Zonas />} />
    </Routes>
  );
}

export default App;
