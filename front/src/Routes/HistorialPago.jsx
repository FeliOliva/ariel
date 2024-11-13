import React, { useState, useEffect } from "react";
import MenuLayout from "../components/MenuLayout";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import { format, set } from "date-fns";
import { Button, Tooltip } from "antd";

const HistorialPago = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [nroVenta, setNroVenta] = useState("");
  console.log(id);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/historialPagoByVentaID/${id}`
        );
        console.log(response.data);
        setData(response.data);
        setNroVenta(response.data[0].nroVenta);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]);
  const columns = [
    {
      name: "Fecha",
      selector: (row) => (
        <Tooltip title={row.fecha_pago}>
          <span>{format(new Date(row.fecha_pago), "dd/MM/yyyy")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Cliente",
      selector: (row) => (
        <Tooltip title={row.nombre + " " + row.apellido}>
          <span>{row.nombre + " " + row.apellido}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => (
        <Tooltip title={row.monto}>
          <span>{row.monto}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Forma de Pago",
      selector: (row) => (
        <Tooltip title={row.metodo}>
          <span>{row.metodo}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Nro cheque",
      selector: (row) => (
        <Tooltip title={row.nro_cheque || "N/A"}>
          <span>{row.nro_cheque || "N/A"}</span>
        </Tooltip>
      ),
      sortable: true,
    },
  ];
  return (
    <MenuLayout>
      <Button
        type="primary"
        onClick={() => window.history.back()}
        style={{ marginBottom: "10px" }}
      >
        Volver
      </Button>
      <h1>Historial de Pagos de la venta nro: {nroVenta}</h1>
      <DataTable
        columns={columns}
        data={data}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
          },
          cells: {
            style: customCellsStyles,
          },
        }}
      />
    </MenuLayout>
  );
};

export default HistorialPago;
