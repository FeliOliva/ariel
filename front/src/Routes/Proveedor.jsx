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
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
const Proveedores = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState("");
  const [newProveedor, setNewProveedor] = useState("");
  const { confirm } = Modal;
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/proveedor`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProveedor = async () => {
    if (!newProveedor.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo Nombre es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }

    confirm({
      title: "¿Estas seguro de agregar este proveedor?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/addProveedor`,
            newProveedor
          );
          setData([...data, response.data]);
          setOpenAddDrawer(false);
          setNewProveedor(null);
          fetchData();
          notification.success({
            message: "Proveedor agregado con exito",
            description: "El proveedor se agrego correctamente",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error adding the proveedor:", error);
        }
      },
    });
  };

  const handleEditProveedor = async () => {
    if (!currentProveedor.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo Nombre es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }

    const proveedorActualizado = {
      nombre: currentProveedor.nombre,
      ID: currentProveedor.id,
    };
    confirm({
      title: "¿Estas seguro de actualizar este proveedor?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/updateProveedor`,
            proveedorActualizado
          );
          setOpenEditDrawer(false);
          setCurrentProveedor(null);
          fetchData();
          notification.success({
            message: "Proveedor actualizado con exito",
            description: "El proveedor se actualizo correctamente",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error updating the proveedor:", error);
        }
      },
    });
  };
  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de desactivar este Proveedor?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/dropProveedor/${id}`);
            fetchData();
            notification.success({
              message: "Proveedor desactivado con exito",
              description: "El proveedor se desactivo correctamente",
              duration: 2,
              placement: "topRight",
            });
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar este Proveedor?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/upProveedor/${id}`);
            fetchData();
            notification.success({
              message: "Proveedor activado con exito",
              description: "El proveedor se activo correctamente",
              duration: 2,
              placement: "topRight",
            });
          },
        });
      }
    } catch (error) {
      console.error("Error toggling state:", error);
    }
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.nombre}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Habilitar/Deshabilitar",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            onClick={() => handleOpenEditDrawer(row.id)}
            icon={<EditOutlined />}
          ></Button>
          <Button
            type="primary"
            onClick={() => handleToggleState(row.id, row.estado)}
          >
            {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
          </Button>
        </div>
      ),
    },
  ];

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getProveedorByID/${id}`
      );
      setCurrentProveedor(response.data);
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
      <h1>Lista de Proveedores</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          style={{ marginBottom: 10 }}
          onClick={() => setOpenAddDrawer(true)}
          type="primary"
        >
          Agregar Proveedor
        </Button>
        <Button onClick={handleBack}>Volver</Button>
      </div>
      <Drawer
        open={openAddDrawer}
        title="Agregar Proveedor"
        onClose={() => setOpenAddDrawer(false)}
      >
        <Input
          value={newProveedor?.nombre}
          onChange={(e) =>
            setNewProveedor((value) => ({
              ...value,
              nombre: e.target.value,
            }))
          }
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleAddProveedor} type="primary">
          Agregar Proveedor
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Proveedor"
        onClose={() => setOpenEditDrawer(false)}
      >
        <Input
          value={currentProveedor?.nombre}
          onChange={(e) =>
            setCurrentProveedor((prev) => ({
              ...prev,
              nombre: e.target.value,
            }))
          }
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleEditProveedor} type="primary">
          Actualizar Proveedor
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

export default Proveedores;
