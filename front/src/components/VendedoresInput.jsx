import { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";

export default function VendedoresInput({
  value,
  onChange,
  includeAllOption = false,
}) {
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/vendedores`);
        setVendedores(response.data);
      } catch (error) {
        console.error("Error fetching vendedores:", error);
      }
    };

    fetchVendedores();
  }, []);

  const options = [
    ...(includeAllOption
      ? [
          {
            label: "AMBOS VENDENDORES",
            value: "ALL",
          },
        ]
      : []),
    ...vendedores.map((vendedor) => ({
      label: vendedor.nombre,
      value: vendedor.id,
    })),
  ];

  return (
    <Select
      value={value}
      showSearch
      placeholder="Selecciona un vendedor"
      optionFilterProp="label"
      onChange={onChange} // (value, option)
      options={options}
      style={{ width: "100%" }}
    />
  );
}
