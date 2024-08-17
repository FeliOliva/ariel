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
    onChangeArticulo(selectedArticulo);
    onInputChange(value); // Actualiza el valor del input en el componente padre
  };

  const handleSearchArticulo = (value) => {
    console.log("search:", value);
  };

  const options = articulos.map((articulo) => ({
    label: articulo.nombre,
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
