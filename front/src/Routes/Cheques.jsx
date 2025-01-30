import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  customCellsStyles,
  customHeaderStyles,
} from "../style/dataTableStyles";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, notification, Modal, Tooltip } from "antd";

const Cheques = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = Modal;
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
          title: "¿Estas seguro de activar este Cliente?",
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
  const columns = [
    {
      name: "Fecha de emision",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={dayjs(row.fecha_emision).format("YYYY/MM/DD")}
        >
          <span>{dayjs(row.fecha_emision).format("YYYY/MM/DD")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Fecha de cobro",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={dayjs(row.fecha_cobro).format("YYYY/MM/DD")}
        >
          <span>{dayjs(row.fecha_cobro).format("YYYY/MM/DD")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Importe",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.importe}
        >
          <span>{row.importe}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Banco",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.banco}
        >
          <span>{row.banco}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Número",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nro_cheque}
        >
          <span>{row.nro_cheque}</span>
        </Tooltip>
      ),
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
