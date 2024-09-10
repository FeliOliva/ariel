import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button } from "antd";

const CompraDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compraInfo, setCompraInfo] = useState({
    proveedor_nombre: "",
    nro_compra: "",
    fecha_compra: "",
    total: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getCompraByID/${id}`
        );

        const { detalles, proveedor_nombre, nro_compra, fecha_compra, total } =
          response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setCompraInfo({
            proveedor_nombre,
            nro_compra,
            fecha_compra,
            total,
          });
          console.log(response.data);
        } else {
          console.error("Expected 'detalles' to be an array");
        }
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
      name: "Descripción",
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
      name: "Precio Unitario",
      selector: (row) => row.costo,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.costo).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.subtotal,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.subtotal).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const totalImporte = data
    .reduce((acc, item) => acc + parseFloat(item.subtotal), 0)
    .toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <MenuLayout>
      <h1>Detalle de Compra {compraInfo.nro_compra}</h1>
      <div>
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
              <strong>Total Importe: </strong> {totalImporte}
            </div>
          </div>
        )}
      </div>
    </MenuLayout>
  );
};

export default CompraDetalles;
