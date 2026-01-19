import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function TipoClienteInput({ onChangeTipoCliente }) {
  const [tipoCliente, setTipoCliente] = useState([]);

  useEffect(() => {
    const fetchTipoCliente = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tipocliente`);
        setTipoCliente(response.data);
      } catch (error) {
        console.error("Error fetching tipoCliente:", error);
      }
    };

    fetchTipoCliente();
  }, []);

  const handleChangeTipo = (value) => {
    const selectedTipoCliente = tipoCliente.find(
      (tipoCliente) => tipoCliente.id === value
    );
    onChangeTipoCliente(selectedTipoCliente);
  };

  const handleSearchtipo = (value) => {
  };

  const options = tipoCliente
    .filter((tipoCliente) => tipoCliente.estado === 1)
    .map((tipoCliente) => ({
      label: tipoCliente.nombre_tipo,
      value: tipoCliente.id,
    }));

  return (
    <Select
      showSearch
      placeholder="Selecciona un tipo de cliente"
      optionFilterProp="label"
      onChange={handleChangeTipo} // Cambia al nuevo tipo de cliente
      onSearch={handleSearchtipo}
      options={options} // Carga las opciones filtradas
      style={{ width: "70%" }}
    />
  );
}
