import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function TipoClienteInput({ onChangeTipoCliente, value }) {
  const [tipoCliente, setTipoCliente] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState(value);

  useEffect(() => {
    const fetchTipoCliente = async () => {
      try {
        const response = await axios.get("http://localhost:3001/tipocliente");
        setTipoCliente(
          response.data.filter((tipoCliente) => tipoCliente.estado === 1)
        );
      } catch (error) {
        console.error("Error fetching tipoCliente:", error);
      }
    };

    fetchTipoCliente();
  }, []);

  useEffect(() => {
    setSelectedTipo(value); // Actualiza el valor cuando cambia
  }, [value]);

  const handleTipoChange = (newTipoId) => {
    const selectedTipoCliente = tipoCliente.find(
      (tipoCliente) => tipoCliente.id === newTipoId
    );
    setSelectedTipo(selectedTipoCliente);
    onChangeTipoCliente(selectedTipoCliente); // Notifica el cambio con el objeto completo
  };

  const options = tipoCliente.map((tipoCliente) => ({
    label: tipoCliente.nombre_tipo,
    value: tipoCliente.id,
  }));

  return (
    <Select
      showSearch
      placeholder="Selecciona un tipo de cliente"
      optionFilterProp="label"
      value={selectedTipo?.id} // Muestra el tipo cliente seleccionado
      onChange={handleTipoChange} // Cambia al nuevo tipo de cliente
      options={options} // Carga las opciones filtradas
      style={{ width: "70%" }}
    />
  );
}
