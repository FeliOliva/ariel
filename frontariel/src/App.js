import React from "react";
import { Routes, Route } from "react-router-dom";
import Clientes from "./components/Clientes";
import Productos from "./components/Productos";

function App() {
  return (
    <Routes>
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/productos" element={<Productos />} />
    </Routes>
  );
}

export default App;
