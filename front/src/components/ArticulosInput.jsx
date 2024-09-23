import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function ArticulosInput({
  value,
  onChangeArticulo,
  onInputChange,
}) {
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const response = await axios.get("http://localhost:3001/articulos");
        setArticulos(response.data);
      } catch (error) {
        console.error("Error fetching articulos:", error);
      }
    };

    fetchArticulos();
  }, []);

  const handleChangeArticulo = (value) => {
    const selectedArticulo = articulos.find(
      (articulo) => articulo.id === value
    );
    onChangeArticulo(selectedArticulo); // Pasa el artículo completo
    onInputChange(value); // También actualiza el valor de entrada si lo necesitas
  };

  const handleSearchArticulo = (value) => {
    console.log("search:", value);
  };

  const options = articulos
    .filter((articulo) => articulo.estado === 1)
    .map((articulo) => ({
      label:
        articulo.nombre +
        " - " +
        articulo.linea_nombre +
        " - " +
        articulo.sublinea_nombre,
      value: articulo.id,
    }));

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un artículo"
      optionFilterProp="label"
      onChange={handleChangeArticulo}
      onSearch={handleSearchArticulo}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
