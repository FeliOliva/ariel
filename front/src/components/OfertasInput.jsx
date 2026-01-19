import React, { useState, useEffect } from "react";
import { Select } from "antd";
import axios from "axios";

export default function OfertasInput({ value, onChangeOferta, onInputChange }) {
  const [ofertas, setOfertas] = useState([]);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/ofertas`);
        setOfertas(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOfertas();
  }, []);
  const handleChangeOferta = (value) => {
    const selectedOferta = ofertas.find((oferta) => oferta.id === value);
    onChangeOferta(selectedOferta); // Pasa el artículo completo
    onInputChange(value); // También actualiza el valor de entrada si lo necesitas
  };

  const handleSearchOferta = (value) => {
  };

  const options = ofertas
    .filter((oferta) => oferta.estado === 1)
    .map((oferta) => ({
      label: oferta.nombre,
      value: oferta.id,
    }));

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un artículo"
      optionFilterProp="label"
      onChange={handleChangeOferta}
      onSearch={handleSearchOferta}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
