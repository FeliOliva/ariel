import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Tooltip, Input, Modal, notification } from "antd";
import CustomPagination from "../components/CustomPagination";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import "../style/style.css";

const SubLinea = () => {
  const { id } = useParams();
  const [subLineas, setSubLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [editDrawer, setEditDrawer] = useState(false);
  const [currentSubLinea, setCurrentSubLinea] = useState({});
  const { confirm } = Modal;
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getSubLineasByLinea/${id}`
      );
      setSubLineas(response.data);
      setNombre(response.data[0].nombre_linea);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de deshabilitar esta sublinea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropSubLinea/${id}`);
            notification.success({
              message: "SubLinea desactivada",
              description: "La subLinea se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar esta sublinea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upSubLinea/${id}`);
            notification.success({
              message: "SubLinea activada",
              description: "La subLinea se activo exitosamente",
              duration: 1,
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
        `http://localhost:3001/getSublineaByID/${id}`
      );
      setCurrentSubLinea(response.data);
      setEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleEditedSubLinea = async () => {
    const editedSubLinea = {
      nombre: currentSubLinea.nombre,
      ID: currentSubLinea.id,
    };
    console.log(editedSubLinea);
    if (!editedSubLinea.nombre) {
      Modal.warning({
        title: "Advertencia",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de editar esta sublinea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:3001/updateSubLinea`,
            editedSubLinea
          );
          setEditDrawer(false);
          fetchData();
          notification.success({
            message: "Sublinea editada con exito!",
            description: "La sublinea ha sido editada con exito.",
            duration: 1,
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, omit: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Editar",
      cell: (row) => (
        <Button type="primary" onClick={() => handleOpenEditDrawer(row.id)}>
          Editar
        </Button>
      ),
    },
    {
      name: "Habilitar/Deshabilitar",
      cell: (row) => (
        <Button
          type="primary"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? "Desactivar" : "Activar"}
        </Button>
      ),
    },
  ];

  return (
    <MenuLayout>
      <Button onClick={() => window.history.back()} type="primary">
        Volver
      </Button>
      <Drawer
        open={editDrawer}
        onClose={() => setEditDrawer(false)}
        title="Editar Sublínea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={currentSubLinea?.nombre}
          onChange={(e) =>
            setCurrentSubLinea((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Sublínea"
          style={{ marginBottom: 10 }}
          required
        ></Input>
        <Button className="custom-button" onClick={handleEditedSubLinea}>
          Actualizar Sublinea
        </Button>
      </Drawer>
      <div>
        <h1>Lista de Sublíneas de la Línea {nombre}</h1>
        <DataTable
          style={{ width: "100%" }}
          columns={columns}
          data={subLineas}
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

export default SubLinea;
