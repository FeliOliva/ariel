import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

const Productos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/productos");
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
    { name: "Cantidad", selector: (row) => row.cantidad, sortable: true },
    { name: "Marca", selector: (row) => row.nombre_marca, sortable: true },
    {
      name: "Categoría",
      selector: (row) => row.nombre_categoria,
      sortable: true,
    },
    { name: "Precio", selector: (row) => row.precio, sortable: true },
    { name: "Estado", selector: (row) => row.estado, sortable: true },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Lista de Productos</h1>
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
        />
      </div>
    </MenuLayout>
  );
};

export default Productos;
