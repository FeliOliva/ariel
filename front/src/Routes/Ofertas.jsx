import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import ArticulosInput from "../components/ArticulosInput";
import { Link } from "react-router-dom";

function Ofertas() {
  const [data, setData] = useState([]);
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ofertas");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  });

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Precio total",
      selector: (row) => row.total_oferta,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.fecha,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
      sortable: true,
    },
    {
      name: "Detalles",
      cell: (row) => (
        <Link to={`/ofertas/${row.id}`}>
          <Button type="primary">Detalles</Button>
        </Link>
      ),
    },
  ];
  return (
    <MenuLayout>
      <DataTable
        columns={columns}
        data={data}
        pagination
        title="Ofertas"
        highlightOnHover
      />
    </MenuLayout>
  );
}

export default Ofertas;
