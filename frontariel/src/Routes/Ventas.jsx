import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

const DetalleVentas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/detalleventas");
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
    { name: "Cliente", selector: (row) => row.nombre_cliente, sortable: true },
    {
      name: "Producto",
      selector: (row) => row.nombre_producto,
      sortable: true,
    },
    { name: "Cantidad", selector: (row) => row.cantidad, sortable: true },
    { name: "Precio", selector: (row) => row.precio, sortable: true },
    { name: "Zona", selector: (row) => row.nombre_zona, sortable: true },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Lista de Detalle de Ventas</h1>
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

export default DetalleVentas;
