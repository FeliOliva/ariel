import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function ProveedoresInput({ onChangeProveedor, value }) {
  const [proveedor, setProveedor] = useState([]);

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const response = await axios.get("http://localhost:3001/proveedor");
        setProveedor(response.data);
      } catch (error) {
        console.error("Error fetching proveedores:", error);
      }
    };

    fetchProveedor();
  }, []);

  const handleChangeProveedor = (value) => {
    const selectedProveedor = proveedor.find(
      (proveedor) => proveedor.id === value
    );
    onChangeProveedor(selectedProveedor);
  };

  const handleSearchProveedor = (value) => {
    console.log("search:", value);
  };

  const options = proveedor
    .filter((proveedor) => proveedor.estado === 1)
    .map((proveedor) => ({
      label: proveedor.nombre,
      value: proveedor.id,
    }));

  return (
    <Select
      showSearch
      placeholder="Select a proveedor"
      optionFilterProp="label"
      onChange={handleChangeProveedor}
      onSearch={handleSearchProveedor}
      options={options}
      value={value}
      style={{ width: "70%" }}
    />
  );
}
