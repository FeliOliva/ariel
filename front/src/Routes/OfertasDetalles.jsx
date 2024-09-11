import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button } from "antd";

const OfertasDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ofertaInfo, setOfertaInfo] = useState({
    nombre_oferta: "",
    total: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/detalleOferta/${id}`
        );
        const { nombre, productos } = response.data; // Aquí accedes a 'nombre' y 'productos'

        // Actualizamos la información de la oferta y los productos
        setOfertaInfo({
          nombre_oferta: nombre,
          total: productos
            .reduce(
              (acc, producto) =>
                acc + parseFloat(producto.precio) * producto.cantidad,
              0
            )
            .toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        });
        setData(productos); // Guardamos los productos en el estado 'data'
        setLoading(false);
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
      name: "Nombre del Artículo",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>{row.nombre}</div>
      ),
    },
    {
      name: "Cantidad",
      selector: (row) => row.cantidad,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>{row.cantidad}</div>
      ),
    },
    {
      name: "Precio",
      selector: (row) => row.precio,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.precio).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      name: "SubTotal",
      selector: (row) => row.subtotal,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {(parseFloat(row.precio) * row.cantidad).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  return (
    <MenuLayout>
      <h1>Detalles de la Oferta: {ofertaInfo.nombre_oferta}</h1>
      <Button onClick={() => window.history.back()} type="primary">
        Volver
      </Button>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div id="pdf-content" style={{ padding: "20px" }}>
          <DataTable
            columns={columns}
            data={data}
            pagination={false}
            customStyles={{
              rows: {
                style: {
                  minHeight: "60px",
                },
              },
              headCells: {
                style: {
                  fontSize: "16px",
                  padding: "12px",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  padding: "10px",
                },
              },
            }}
          />
          <div
            style={{
              textAlign: "right",
              marginTop: "20px",
              fontSize: "18px",
            }}
          >
            <strong>Total Importe: </strong> {ofertaInfo.total}
          </div>
        </div>
      )}
    </MenuLayout>
  );
};

export default OfertasDetalles;
