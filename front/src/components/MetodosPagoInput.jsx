import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function MetodoPagoInput({
  value,
  onChangeMetodo,
  onInputChange,
}) {
  const [metodosPago, setMetodosPago] = useState([]);

  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const response = await axios.get("http://localhost:3001/metodosPago");
        setMetodosPago(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching metodosPago:", error);
      }
    };

    fetchMetodosPago();
  }, []);

  const handleChangeMetodo = (value) => {
    const selectedMetodo = metodosPago.find((metodo) => metodo.id === value);
    onChangeMetodo(selectedMetodo); // Pasa el método de pago completo
    onInputChange(value); // Actualiza el valor si es necesario
  };

  const handleSearchMetodo = (value) => {
    console.log("search:", value);
  };

  const options = metodosPago.map((metodo) => ({
    label: metodo.metodo, // Muestra el nombre del método de pago
    value: metodo.id, // Usa el id del método de pago
  }));

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un método de pago"
      optionFilterProp="label"
      onChange={handleChangeMetodo}
      onSearch={handleSearchMetodo}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
