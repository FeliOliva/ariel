import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

const Articulos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/articulos");
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
    { name: "Codigo", selector: (row) => row.articulo_codigo, sortable: true },
    { name: "Nombre", selector: (row) => row.articulo_nombre, sortable: true },
    { name: "Stock", selector: (row) => row.articulo_stock, sortable: true },
    { name: "Linea", selector: (row) => row.linea_nombre, sortable: true },
    {
      name: "SubLinea",
      selector: (row) => row.sublinea_nombre,
      sortable: true,
    },
    {
      name: "Costo",
      selector: (row) => row.articulo_costo,
      sortable: true,
    },
    {
      name: "Precio monotributista",
      selector: (row) => row.precio_monotributista,
      sortable: true,
    },
    {
      name: "Proveedor",
      selector: (row) => row.proveedor_nombre,
      sortable: true,
    },
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

export default Articulos;
