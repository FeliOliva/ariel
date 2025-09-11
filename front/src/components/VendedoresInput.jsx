import { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function VendedoresInput({ value, onChange }) {
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await axios.get("http://localhost:3001/vendedores");
        setVendedores(response.data);
      } catch (error) {
        console.error("Error fetching vendedores:", error);
      }
    };

    fetchVendedores();
  }, []);

  const options = vendedores.map((vendedor) => ({
    label: vendedor.nombre,
    value: vendedor.id, // <- acá va el id como valor
  }));

  return (
    <Select
      value={value} // recibe el id desde el Form
      showSearch
      placeholder="Selecciona un vendedor"
      optionFilterProp="label"
      onChange={onChange} // devuelve solo el id
      options={options}
      style={{ width: "100%" }}
    />
  );
}
