import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { format } from "date-fns";
import CustomPagination from "../components/CustomPagination";
import Swal from "sweetalert2";
import { customHeaderStyles } from "../style/dataTableStyles"; // Importa los estilos reutilizables

function Logs() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreArticulo, setNombreArticulo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/logsPreciosById/${id}`
        );
        setData(response.data);
        setNombreArticulo(response.data[0].nombre_articulo);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  const colums = [
    {
      name: "Nombre",
      selector: (row) => row.nombre_articulo,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha_cambio), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Porcentaje Aplicado",
      selector: (row) => row.porcentaje,
      sortable: true,
    },
    {
      name: "Costo Antiguo",
      selector: (row) => row.costo_antiguo,
      sortable: true,
    },
    {
      name: "Costo Nuevo",
      selector: (row) => row.costo_nuevo,
      sortable: true,
    },
    {
      name: "Precio Monotributista Antiguo",
      selector: (row) => row.precio_monotributista_antiguo,
      sortable: true,
    },
    {
      name: "Precio Monotributista Nuevo",
      selector: (row) => row.precio_monotributista_nuevo,
      sortable: true,
    },
    {
      name: "Deshacer",
      cell: (row) => (
        <Button type="primary" onClick={() => handledDeshacer(row)}>
          Deshacer
        </Button>
      ),
    },
  ];

  const handledDeshacer = async (row) => {
    Swal.fire({
      title: "¿Estás seguro de deshacer este cambio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:3001/deshacerCambios/${row.id}`, {
            costo_antiguo: row.costo_antiguo,
            precio_monotributista_antiguo: row.precio_monotributista_antiguo,
            articulo_id: row.articulo_id,
          });
          Swal.fire({
            title: "Cambio deshecho",
            icon: "success",
            timer: 1000,
          });
          window.history.back();
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      }
    });
  };
  return (
    <MenuLayout>
      <h1>Historial de precios de "{nombreArticulo}"</h1>
      <Button
        onClick={() => window.history.back()}
        type="primary"
        style={{ float: "right", marginBottom: "10px" }}
      >
        Volver
      </Button>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <DataTable
          columns={colums}
          data={data}
          paginationComponent={CustomPagination}
          customStyles={{
            headCells: {
              style: customHeaderStyles,
            },
          }}
        />
      )}
    </MenuLayout>
  );
}

export default Logs;
