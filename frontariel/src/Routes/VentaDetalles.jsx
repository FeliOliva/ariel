import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button } from "antd";

const VentaDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nroVenta, setNroVenta] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        if (response.data.length > 0) {
          setNroVenta(response.data[0].nroVenta);
        }
        setData(response.data);
        console.log(nroVenta);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const columns = [
    { name: "Código", selector: (row) => row.cod_articulo, sortable: true },
    {
      name: "Descripción",
      selector: (row) => row.nombre_articulo,
      sortable: true,
    },
    { name: "Unidades", selector: (row) => row.cantidad, sortable: true },
    {
      name: "Precio Unitario",
      selector: (row) => row.precio_monotributista,
      sortable: true,
    },
    {
      name: "Importe",
      selector: (row) => row.total_precio_monotributista,
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <div>
        <Button onClick={() => window.history.back()}>Volver</Button>
        <h1>Detalle de Venta {nroVenta}</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable columns={columns} data={data} pagination={false} />
        )}
      </div>
    </MenuLayout>
  );
};

export default VentaDetalles;
