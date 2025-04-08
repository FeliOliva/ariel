import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import { Button, Space, Modal, notification } from "antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
const ChequesTable = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState(1);
  const { confirm } = Modal;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cheques");
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
  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de dar de baja este cheque?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropCheque/${id}`);
            notification.success({
              message: "Cheque desactivado",
              description: "El Cheque se desactivo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar este cheque?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upCheque/${id}`);
            notification.success({
              message: "Cliente activado",
              description: "El cliente se activo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      }
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the article:`,
        error
      );
    }
  };
  const getRowColor = (fechaCobro) => {
    const hoy = dayjs();
    const fecha = dayjs(fechaCobro);
    const diferencia = fecha.diff(hoy, "day");

    if (fecha.isBefore(hoy, "day")) return "#ffcccc"; // rojo claro
    if (diferencia <= 10) return "#fff3cd"; // amarillo claro
    return "#d4edda"; // verde claro
  };

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
    {
      name: "Dar de baja",
      selector: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={estadoFiltro === 1 ? "primary" : "default"}
          onClick={() => setEstadoFiltro(1)}
        >
          Activos
        </Button>
        <Button
          type={estadoFiltro === 0 ? "primary" : "default"}
          onClick={() => setEstadoFiltro(0)}
        >
          Inactivos
        </Button>
      </Space>

      <DataTable
        columns={columns}
        data={filteredCheques}
        progressPending={loading}
        pagination
        paginationComponent={CustomPagination}
        conditionalRowStyles={[
          {
            when: (row) => true,
            style: (row) => ({
              backgroundColor: getRowColor(row.fecha_cobro),
              transition: "all 0.3s ease",
            }),
          },
        ]}
        customStyles={{
          headCells: { style: customHeaderStyles },
          cells: { style: customCellsStyles },
        }}
      />
    </div>
  );
};

export default ChequesTable;
