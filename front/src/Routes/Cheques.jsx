import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  customCellsStyles,
  customHeaderStyles,
} from "../style/dataTableStyles";
import dayjs from "dayjs";
import { Button } from "antd";

const Cheques = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cheques");
      setCheques(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "Fecha de emision",
      selector: (row) => dayjs(row.fecha_emision).format("YYYY/MM/DD"),
      sortable: true,
    },
    {
      name: "Fecha de cobro",
      selector: (row) => dayjs(row.fecha_cobro).format("YYYY/MM/DD"),
      sortable: true,
    },
    {
      name: "Importe",
      selector: (row) => row.importe,
      sortable: true,
    },
    {
      name: "Banco",
      selector: (row) => row.banco,
      sortable: true,
    },
    {
      name: "Número",
      selector: (row) => row.nro_cheque,
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <Button onClick={() => window.history.back()} type="primary">
        Volver
      </Button>{" "}
      <DataTable
        title="Cheques"
        columns={columns}
        data={cheques}
        progressPending={loading}
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

export default Cheques;
