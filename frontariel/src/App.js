import React from "react";
import { Routes, Route } from "react-router-dom";
import Clientes from "./Routes/Clientes";
import Articulos from "./Routes/Articulos";
import Inicio from "./Routes/Inicio";
import Ventas from "./Routes/Ventas";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/Articulos" element={<Articulos />} />
      <Route path="/Ventas" element={<Ventas />} />
    </Routes>
  );
}

export default App;
