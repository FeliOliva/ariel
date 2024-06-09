import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

const SubLinea = () => {
  const { id } = useParams();
  const [subLineas, setSubLineas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/getSublineaByLinea/${id}`
        );
        setSubLineas(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitada" : "Deshabilitada"),
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Lista de Sublíneas de la Línea {id}</h1>
        <DataTable
          style={{ width: "100%" }}
          columns={columns}
          data={subLineas}
          progressPending={loading}
          pagination
        />
      </div>
    </MenuLayout>
  );
};

export default SubLinea;
