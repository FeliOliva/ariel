import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function LineaInput({ onChangeLinea }) {
  const [linea, setlinea] = useState([]);

  useEffect(() => {
    const fetchlinea = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/lineas`);
        setlinea(response.data);
      } catch (error) {
        console.error("Error fetching lineas:", error);
      }
    };

    fetchlinea();
  }, []);

  const handleChangelinea = (value) => {
    const selectedlinea = linea.find((linea) => linea.id === value);
    onChangeLinea(selectedlinea);
  };

  const handleSearchlinea = (value) => {
  };

  const options = linea
    .filter((linea) => linea.estado === 1)
    .map((linea) => ({
      label: linea.nombre,
      value: linea.id,
    }));

  return (
    <Select
      showSearch
      placeholder="Select a linea"
      optionFilterProp="label"
      onChange={handleChangelinea}
      onSearch={handleSearchlinea}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
