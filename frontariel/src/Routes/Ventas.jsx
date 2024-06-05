import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom"; 
import MenuLayout from "../components/MenuLayout";

const Venta = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/ventas");
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
    { name: "Nro Venta", selector: (row) => row.nro_venta, sortable: true },
    { name: "Cliente", selector: (row) => row.nombre_cliente, sortable: true },
    { name: "Zona", selector: (row) => row.nombre_zona, sortable: true },
    {
      name: "Pago",
      selector: (row) => (row.pago ? "Sí" : "No"),
      sortable: true,
    },
    {
      name: "Total Costo",
      selector: (row) => row.total_costo,
      sortable: true,
    },
    {
      name: "Total Monotributista",
      selector: (row) => row.total_monotributista,
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Link to={`/venta/${row.id}`}>
          <button>Detalle de Venta</button>
        </Link>
      ),
    },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Lista de Ventas</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable columns={columns} data={data} pagination />
        )}
      </div>
    </MenuLayout>
  );
};

export default Venta;
