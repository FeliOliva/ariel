import React from "react";
import { Routes, Route } from "react-router-dom";
import Clientes from "./Routes/Clientes";
import Articulos from "./Routes/Articulos";
import Inicio from "./Routes/Inicio";
import Venta from "./Routes/Ventas";
import VentaDetalles from "./Routes/VentaDetalles";
import Linea from "./Routes/Linea";
import SubLinea from "./Routes/SubLinea"; // Importa el componente SubLinea

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
    </Routes>
  );
}

export default App;
