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
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  notification,
  Modal,
  Tooltip,
  Drawer,
  Input,
  InputNumber,
} from "antd";
import CustomPagination from "../components/CustomPagination";

const Cheques = () => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCheque, setCurrentCheque] = useState({});
  const [open, setOpen] = useState(false);
  const { confirm } = Modal;
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/cheques`);
      setCheques(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de dar de baja este cheque?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/dropCheque/${id}`);
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
            await axios.put(`${process.env.REACT_APP_API_URL}/upCheque/${id}`);
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
  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getChequeByID/${id}`
      );
      setCurrentCheque(response.data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
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
      name: "Cliente",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre_cliente}
        >
          <span>{row.nombre_cliente}</span>
        </Tooltip>
      ),
    },
    {
      name: "Nro Pago",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nro_pago}
        >
          <span>{row.nro_pago}</span>
        </Tooltip>
      ),
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
    {
      name: "Editar",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleOpenEditDrawer(row.id)}
          icon={<EditOutlined />}
        ></Button>
      ),
    },
  ];
  const handleSaveChanges = async () => {
    try {
      const payLoad = {
        id: currentCheque.id,
        banco: currentCheque.banco,
        nro_cheque: currentCheque.nro_cheque,
        fecha_emision: currentCheque.fecha_emision,
        fecha_cobro: currentCheque.fecha_cobro,
        importe: currentCheque.importe,
      };
      await axios.put(`${process.env.REACT_APP_API_URL}/updateCheques/`, payLoad);
      notification.success({
        message: "Cheque actualizado",
        description: "El cheque se actualizó correctamente",
        duration: 2,
        placement: "topRight",
      });
      fetchData();
      setOpen(false);
    } catch (error) {
      console.error("Error actualizando el cheque:", error);
      notification.error({
        message: "Error",
        description: "No se pudo actualizar el cheque",
        duration: 2,
        placement: "topRight",
      });
    }
  };

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
        pagination={true}
        paginationComponent={CustomPagination}
        responsive={true}
      />
      <Drawer
        open={open}
        width={400}
        title="Editar Cheque"
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Tooltip>Banco</Tooltip>
          <Input
            value={currentCheque?.banco}
            onChange={(e) =>
              setCurrentCheque((prev) => ({ ...prev, banco: e.target.value }))
            }
          />

          <Tooltip>Número de Cheque</Tooltip>
          <Input
            value={currentCheque?.nro_cheque}
            onChange={(e) =>
              setCurrentCheque((prev) => ({
                ...prev,
                nro_cheque: e.target.value,
              }))
            }
          />

          <Tooltip>Fecha de Emisión</Tooltip>
          <Input
            type="date"
            value={dayjs(currentCheque?.fecha_emision).format("YYYY-MM-DD")}
            onChange={(e) =>
              setCurrentCheque((prev) => ({
                ...prev,
                fecha_emision: e.target.value,
              }))
            }
          />

          <Tooltip>Fecha de Cobro</Tooltip>
          <Input
            type="date"
            value={dayjs(currentCheque?.fecha_cobro).format("YYYY-MM-DD")}
            onChange={(e) =>
              setCurrentCheque((prev) => ({
                ...prev,
                fecha_cobro: e.target.value,
              }))
            }
          />

          <Tooltip>Importe</Tooltip>
          <InputNumber
            style={{ width: "100%" }}
            value={currentCheque?.importe}
            onChange={(value) =>
              setCurrentCheque((prev) => ({ ...prev, importe: value }))
            }
          />

          <Button
            type="primary"
            onClick={handleSaveChanges}
            style={{ marginTop: 10 }}
          >
            Guardar Cambios
          </Button>
        </div>
      </Drawer>
    </MenuLayout>
  );
};

export default Cheques;
