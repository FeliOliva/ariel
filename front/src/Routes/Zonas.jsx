import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, Modal, notification } from "antd";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import "../style/style.css";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const Zonas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentZona, setCurrentZona] = useState(null);
  const [newZone, setNewZone] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  const { confirm } = Modal;

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/zonas");
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleAddZona = async () => {
    if (!newZone.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo Zona es obligatorio",
        icon: <WarningOutlined />,
      });
    }
    confirm({
      title: "¿Estas seguro de agregar esta Zona?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post("http://localhost:3001/addZona", newZone);
          fetchData();
          setOpenAddDrawer(false);
          setNewZone(null);
          notification.success({
            message: "Zona agregada",
            description: "La Zona se agrego correctamente",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error adding the zona:", error);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de desactivar esta zona?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropZona/${id}`);
            notification.success({
              message: "Zona desactivada",
              description: "La zona se desactivo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar esta zona?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upZona/${id}`);
            notification.success({
              message: "Zona activada",
              description: "La zona se activo correctamente",
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
  const handleEditZona = async () => {
    if (!currentZona.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo Zona es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }
    const zonaActualizada = {
      nombre: currentZona.nombre,
      ID: currentZona.id,
    };
    confirm({
      title: "¿Estas seguro de actualizar esta Zona?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`http://localhost:3001/updateZona`, zonaActualizada);
          setOpenEditDrawer(false);
          fetchData();
          notification.success({
            message: "Zona actualizada",
            description: "La Zona se actualizo correctamente",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error updating the zona:", error);
        }
      },
    });
  };

  const columns = [
    {
      name: "Zona",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.nombreZona}
        </span>
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

  const handleOpenEditDrawer = async (ID) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getZonaByID/${ID}`
      );
      setCurrentZona(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleBack = () => {
    window.history.back();
  };
  return (
    <MenuLayout>
      <h1>Lista de Zonas</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          style={{ marginBottom: 10 }}
          onClick={() => setOpenAddDrawer(true)}
          type="primary"
        >
          Agregar Zona
        </Button>
        <Button onClick={handleBack}>Volver</Button>
      </div>
      <Drawer
        open={openAddDrawer}
        title="Agregar Zona"
        onClose={() => setOpenAddDrawer(false)}
      >
        <Input
          value={newZone?.nombre}
          onChange={(e) =>
            setNewZone((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleAddZona} type="primary">
          Agregar Zona
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Zona"
        onClose={() => setOpenEditDrawer(false)}
      >
        <Input
          value={currentZona?.nombre}
          onChange={(e) =>
            setCurrentZona((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleEditZona} type="primary">
          Actualizar Zona
        </Button>
      </Drawer>
      <div>
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationComponent={CustomPagination}
          customStyles={{
            headCells: {
              style: customHeaderStyles,
            },
            cells: {
              style: customCellsStyles,
            },
          }}
        />
      </div>
    </MenuLayout>
  );
};

export default Zonas;
