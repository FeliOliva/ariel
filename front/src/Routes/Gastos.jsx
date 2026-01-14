import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Drawer,
  Button,
  InputNumber,
  Input,
  Tooltip,
  Modal,
  notification,
} from "antd";
import MenuLayout from "../components/MenuLayout";
import { format } from "date-fns";
import {
  WarningOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import CustomPagination from "../components/CustomPagination";
import {
  customCellsStyles,
  customHeaderStyles,
} from "../style/dataTableStyles";
import "../style/style.css";

function Gastos() {
  const [newGasto, setNewGasto] = useState(null);
  const [currentGasto, setCurrentGasto] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const { confirm } = Modal;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/gastos");
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getGastoByID/${id}`
      );
      setCurrentGasto(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleEditGasto = async () => {
    if (!currentGasto.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }
    if (!currentGasto.monto) {
      Modal.warning({
        title: "Error",
        content: "El campo de monto es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }
    const gastoEditado = {
      nombre: currentGasto.nombre.toUpperCase().trim(),
      monto: currentGasto.monto,
      ID: currentGasto.id,
    };
    console.log(gastoEditado);
    confirm({
      title: "¿Estas seguro de editar este Gasto?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`http://localhost:3001/updateGastos/`, gastoEditado);
          setOpenEditDrawer(false);
          fetchData();
          notification.success({
            message: "Gasto editado correctamente",
            description: "El gasto se edito correctamente",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };
  const handleAddGasto = async () => {
    console.log(newGasto);
    if (!newGasto.nombre || !newGasto.monto) {
      Modal.warning({
        title: "Error",
        content: "Todos los campos son obligatorios",
        icon: <WarningOutlined />,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de agregar este Gasto?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          // Convertir el nombre a mayúsculas antes de enviar
          const gastoToSend = {
            ...newGasto,
            nombre: newGasto.nombre.toUpperCase().trim(),
          };
          await axios.post("http://localhost:3001/addGasto", gastoToSend);
          setOpen(false);
          // Limpiar el estado del drawer
          setNewGasto(null);
          fetchData();
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de desactivar este Gasto?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropGasto/${id}`);
            notification.success({
              message: "Gasto desactivado",
              description: "El gasto se desactivo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar este Gasto?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upGasto/${id}`);
            notification.success({
              message: "Gasto activado",
              description: "El gasto se activo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const columns = [
    {
      name: "Motivo",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre ? row.nombre.toUpperCase() : ""}
        >
          <span>{row.nombre ? row.nombre.toUpperCase() : ""}</span>
        </Tooltip>
      ),

      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => {
        const montoFormateado = row.monto 
          ? `$ ${parseFloat(row.monto).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "$ 0.00";
        return (
          <Tooltip
            className={row.estado === 0 ? "strikethrough" : ""}
            title={montoFormateado}
          >
            <span>{montoFormateado}</span>
          </Tooltip>
        );
      },
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={format(new Date(row.fecha), "dd/MM/yyyy")}
        >
          <span>{format(new Date(row.fecha), "dd/MM/yyyy")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      selector: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            className="custom-button"
            onClick={() => handleOpenEditDrawer(row.id)}
            icon={<EditOutlined />}
          ></Button>
          <Button
            className="custom-button"
            onClick={() => handleToggleState(row.id, row.estado)}
          >
            {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MenuLayout>
      <h1>Listado de Gastos</h1>

      <Button
        type="primary"
        onClick={() => {
          // Limpiar el estado antes de abrir el drawer
          setNewGasto(null);
          setOpen(true);
        }}
        style={{ marginBottom: "16px" }}
      >
        Agregar Gasto
      </Button>
      <Drawer 
        open={open} 
        onClose={() => {
          setOpen(false);
          // Limpiar el estado del drawer al cerrar
          setNewGasto(null);
        }} 
        title="Agregar Gasto"
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Motivo</Tooltip>
        </div>
        <Input
          value={newGasto?.nombre || ""}
          onChange={(e) => setNewGasto({ ...newGasto, nombre: e.target.value })}
          style={{ width: "70%" }}
          placeholder="Ingrese el motivo del gasto"
        />
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Monto</Tooltip>
        </div>
        <InputNumber
          value={newGasto?.monto || undefined}
          onChange={(value) => setNewGasto({ ...newGasto, monto: value })}
          min={0}
          style={{ width: "100%" }}
          placeholder="Ingrese el monto"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          precision={2}
        />
        <Button
          type="primary"
          onClick={handleAddGasto}
          style={{ marginTop: "16px", display: "flex" }}
        >
          Agregar
        </Button>
      </Drawer>
      <Drawer
        title="Editar Gasto"
        open={openEditDrawer}
        onClose={() => {
          setOpenEditDrawer(false);
          // Limpiar el estado del drawer al cerrar
          setCurrentGasto(null);
        }}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Motivo</Tooltip>
        </div>
        <Input
          value={currentGasto?.nombre || ""}
          onChange={(e) =>
            setCurrentGasto({ ...currentGasto, nombre: e.target.value })
          }
          style={{ width: "70%" }}
          placeholder="Ingrese el motivo del gasto"
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Monto</Tooltip>
        </div>
        <InputNumber
          value={currentGasto?.monto || undefined}
          onChange={(value) =>
            setCurrentGasto({ ...currentGasto, monto: value })
          }
          min={0}
          style={{ width: "100%" }}
          placeholder="Ingrese el monto"
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          precision={2}
        />
        <Button
          type="primary"
          onClick={handleEditGasto}
          style={{ marginTop: "16px", display: "flex" }}
        >
          Editar
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: {
              ...customHeaderStyles,
            },
          },
          cells: {
            style: {
              ...customCellsStyles,
            },
          },
        }}
      />
    </MenuLayout>
  );
}

export default Gastos;
