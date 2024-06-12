import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; // Importar Link desde React Router
import MenuLayout from "../components/MenuLayout";

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/lineas");
        setLineas(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitada" : "Deshabilitada"),
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Link to={`/linea/${row.id}`}>
          <button>Ver Sublíneas</button>
        </Link>
      ),
    },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Lista de Líneas</h1>
        <DataTable
          style={{ width: "100%" }}
          columns={columns}
          data={lineas}
          progressPending={loading}
          pagination
        />
      </div>
    </MenuLayout>
  );
};

export default Linea;
