import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

const VentaDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/getVentaByID/${id}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const columns = [
    { name: "Código", selector: "cod_articulo", sortable: true },
    { name: "Descripción", selector: "nombre_articulo", sortable: true },
    { name: "Unidades", selector: "cantidad", sortable: true },
    {
      name: "Precio Unitario",
      selector: "precio_monotributista",
      sortable: true,
    },
    {
      name: "Importe",
      selector: "total_precio_monotributista",
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <div>
        <h1>Detalle de Venta {id}</h1>
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
