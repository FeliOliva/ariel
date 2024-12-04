import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

const ClienteInput = ({ value, onChangeCliente, onInputChange }) => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/clientes");
        setClientes(response.data);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  const handleSearchCliente = (value) => {
    console.log("search:", value);
  };

  const handleChangeCliente = (value) => {
    const selectedCliente = clientes.find((cliente) => cliente.id === value);
    onChangeCliente(selectedCliente); // Pass selected cliente to parent

    // Solo llama a onInputChange si se ha pasado como prop
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const options = clientes
    .filter((cliente) => cliente.estado === 1)
    .map((cliente) => ({
      label: cliente.nombre + " " + cliente.apellido,
      value: cliente.id,
    }));

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un cliente"
      onSearch={handleSearchCliente}
      options={options}
      optionFilterProp="label"
      onChange={handleChangeCliente}
      style={{ width: "50%" }}
    />
  );
};

export default ClienteInput;
