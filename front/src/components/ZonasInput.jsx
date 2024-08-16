import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function ZonasInput({ onChangeZona }) {
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/zonas");
        setZonas(response.data);
      } catch (error) {
        console.error("Error fetching zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  const handleChangeZona = (value) => {
    const selectedZona = zonas.find((zona) => zona.id === value);
    onChangeZona(selectedZona);
  };

  const handleSearchZona = (value) => {
    console.log("search:", value);
  };

  const options = zonas.map((zona) => ({
    label: zona.nombre,
    value: zona.id,
  }));

  return (
    <Select
      showSearch
      placeholder="Select a zone"
      optionFilterProp="label"
      onChange={handleChangeZona}
      onSearch={handleSearchZona}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
