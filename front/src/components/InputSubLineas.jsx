import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function SubLineasInput({ onChangeSubLineas }) {
  const [subLineas, setSubLineas] = useState([]);

  useEffect(() => {
    const fetchSubLineas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/subLinea`);
        setSubLineas(response.data);
      } catch (error) {
        console.error("Error fetching subLineass:", error);
      }
    };
    fetchSubLineas();
  }, []);

  const handleChangeSubLineas = (value) => {
    const selectedSubLineas = subLineas.find(
      (subLineas) => subLineas.id === value
    );
    onChangeSubLineas(selectedSubLineas);
  };

  const handleSearchSubLineas = (value) => {
  };

  const options = subLineas
    .filter((subLinea) => subLinea.estado === 1) 
    .map((subLinea) => ({
      label: subLinea.nombre,
      value: subLinea.id,
    }));

  return (
    <Select
      showSearch
      placeholder="Select a SubLineas"
      optionFilterProp="label"
      onChange={handleChangeSubLineas}
      onSearch={handleSearchSubLineas}
      options={options}
      style={{ width: "70%" }}
    />
  );
}
