import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const Clientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/clientes");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { name: "ID", selector: (row) => row.ID, sortable: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Apellido", selector: (row) => row.apellido, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Teléfono", selector: (row) => row.telefono, sortable: true },
    { name: "Estado", selector: (row) => row.estado, sortable: true },
  ];

  return (
    <div>
      <h1>Lista de Clientes</h1>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
      />
    </div>
  );
};

export default Clientes;
