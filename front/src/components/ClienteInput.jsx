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

  const handleChangeCliente = (value) => {
    const selectedCliente = clientes.find((cliente) => cliente.id === value);
    onChangeCliente(selectedCliente); // Pass selected cliente to parent
    onInputChange(value); // Update input value in parent
  };

  const options = clientes
    .filter((cliente) => cliente.estado === 1)
    .map((cliente) => ({
      label: `${cliente.nombre} ${cliente.apellido}`,
      value: cliente.id,
    }));

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un cliente"
      optionFilterProp="label"
      onChange={handleChangeCliente}
      style={{ width: "100%" }}
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ClienteInput;
