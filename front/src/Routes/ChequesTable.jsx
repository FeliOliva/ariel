import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";

const ChequesTable = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState(1); // Estado inicial: activos (1)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cheques");
      // Ordena los cheques por fecha de cobro (fecha más cercana a la más lejana)
      const sortedCheques = response.data.sort(
        (a, b) => new Date(a.fecha_cobro) - new Date(b.fecha_cobro)
      );
      setCheques(sortedCheques);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredCheques = cheques.filter(
    (cheque) => cheque.estado === estadoFiltro
  );
  const columns = [
    {
      name: "Fecha de emisión",
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
      name: "Número",
      selector: (row) => row.nro_cheque,
      sortable: true,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={filteredCheques}
        progressPending={loading}
        // customStyles={{
        //   headCells: {
        //     style: customHeaderStyles,
        //   },
        //   cells: {
        //     style: customCellsStyles,
        //   },
        // }}
      />
    </div>
  );
};

export default ChequesTable;
