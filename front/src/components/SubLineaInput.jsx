import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "antd";

const { Option } = Select;

const SubLineaInput = ({ lineaId, onChangeSubLinea }) => {
  const [subLineas, setSubLineas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lineaId) {
      const fetchSubLineas = async () => {
        setLoading(true); 
        try {
          const response = await axios.get(
            `http://localhost:3001/getSubLineasByLinea/${lineaId}`
          );
          setSubLineas(response.data);
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching sublineas:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubLineas();
    } else {
      setSubLineas([]);
    }
  }, [lineaId]);

  return (
    <Select
      style={{ width: "100%" }}
      placeholder="Seleccione una sublinea"
      onChange={(value) => {
        const selectedSubLinea = subLineas.find(
          (sublinea) => sublinea.id === value
        );
        onChangeSubLinea(selectedSubLinea);
      }}
      loading={loading}
    >
      {subLineas.map((sublinea) => (
        <Option key={sublinea.id} value={sublinea.id}>
          {sublinea.nombre}
        </Option>
      ))}
    </Select>
  );
};

export default SubLineaInput;
