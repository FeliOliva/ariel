import React from "react";
import { Routes, Route } from "react-router-dom";
import Clientes from "./Routes/Clientes";
import Productos from "./Routes/Productos";
import Inicio from "./Routes/Inicio";
import Ventas from "./Routes/Ventas";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/Ventas" element={<Ventas />} />
    </Routes>
  );
}

export default App;
