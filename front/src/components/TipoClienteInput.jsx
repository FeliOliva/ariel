import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function TipoClienteInput({ onChangeTipoCliente }) {
  const [tipoCliente, setTipoCliente] = useState([]);

  useEffect(() => {
    const fetchTipoCliente = async () => {
      try {
        const response = await axios.get("http://localhost:3001/tipocliente");
        // Guardar los tipos de cliente que tienen estado igual a 1
        setTipoCliente(
          response.data.filter((tipoCliente) => tipoCliente.estado === 1)
        );
      } catch (error) {
        console.error("Error fetching tipoCliente:", error);
      }
    };

    fetchTipoCliente();
  }, []);

  const handleChangeTipoCliente = (value) => {
    const selectedTipoCliente = tipoCliente.find(
      (tipoCliente) => tipoCliente.id === value
    );
    onChangeTipoCliente(selectedTipoCliente); // Llama la función de callback con el tipo de cliente seleccionado
  };

  const handleSearchTipoCliente = (value) => {
    console.log("search:", value); // Lógica personalizada de búsqueda (si es necesario)
  };

  const options = tipoCliente.map((tipoCliente) => ({
    label: tipoCliente.nombre_tipo,
    value: tipoCliente.id,
  }));

  return (
    <Select
      showSearch
      placeholder="Selecciona un tipo de cliente"
      optionFilterProp="label" // Para que el filtro funcione por label
      onChange={handleChangeTipoCliente}
      onSearch={handleSearchTipoCliente}
      options={options} // Carga las opciones filtradas
      style={{ width: "70%" }}
    />
  );
}
