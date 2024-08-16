import Select from "react-select";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ProveedorList = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get("http://localhost:3001/proveedor");
        setOptions(response.data);
      } catch (error) {
        console.error(
          `Error fetching options from http://localhost:3001/proveedor:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSelectChange = (event) => {
    console.log(event);
  };

  return (
    <>
      <Select
        options={options.map((option) => ({
          value: option.id,
          label: option.nombre,
        }))}
        onChange={handleSelectChange}
      />
      {loading && <p>Loading...</p>}
    </>
  );
};

export default ProveedorList;
