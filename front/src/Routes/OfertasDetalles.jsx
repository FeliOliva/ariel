import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Menu } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OfertasDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log(id);
      try {
        const response = await axios.get(
          `http://localhost:3001/detalleOferta/${id}`
        );
        setData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre_articulo,
      sortable: true,
    },
    {
      name: "Cantidad",
      selector: (row) => row.cantidad,
      sortable: true,
    },
    {
      name: "Precio oferta",
      selector: (row) => row.precioOferta,
      sortable: true,
    },
    {
      name: "SubTotal",
      selector: (row) => row.subtotal,
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <DataTable
        title="Detalles de Oferta"
        columns={columns}
        data={data}
        progressPending={loading}
      />
    </MenuLayout>
  );
};

export default OfertasDetalles;
