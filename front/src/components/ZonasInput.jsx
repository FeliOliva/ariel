import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function ZonasInput({ onChangeZona }) {
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/zonas");
        // Guardar las zonas que tienen estado igual a 1
        setZonas(response.data.filter((zona) => zona.estado === 1));
      } catch (error) {
        console.error("Error fetching zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  const handleChangeZona = (value) => {
    const selectedZona = zonas.find((zona) => zona.id === value);
    onChangeZona(selectedZona); // Llama la función de callback con la zona seleccionada
  };

  const handleSearchZona = (value) => {
    console.log("search:", value); // Puedes agregar lógica de búsqueda personalizada aquí si lo necesitas
  };

  const options = zonas.map((zona) => ({
    label: zona.nombre,
    value: zona.id,
  }));

  return (
    <Select
      showSearch
      placeholder="Select a zone"
      optionFilterProp="label" // Para que el filtro funcione por label
      onChange={handleChangeZona}
      onSearch={handleSearchZona}
      options={options} // Carga las opciones filtradas
      style={{ width: "70%" }}
    />
  );
}
