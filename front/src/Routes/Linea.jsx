import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Input,
  Tooltip,
  message,
  Modal,
  notification,
} from "antd";
import {
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "../style/style.css";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [linea, setLinea] = useState({ nombre: "" });
  const [subLinea, setSubLinea] = useState([]);
  const [openSubLineaDrawer, setOpenSubLineaDrawer] = useState(false);
  const [currentLinea, setCurrentLinea] = useState({});
  const [OpenEditDrawer, setOpenEditDrawer] = useState(false);
  const { confirm } = Modal;
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/lineas");
      setLineas(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  const handleLineaChange = (e) => {
    setLinea({ ...linea, nombre: e.target.value });
  };

  const handleGuardarLinea = async () => {
    if (linea.nombre === "") {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de agregar esta linea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post("http://localhost:3001/addLinea", {
            nombre: linea.nombre,
          });
          notification.success({
            message: "Linea agregada",
            description: "La linea se agrego exitosamente",
            duration: 1,
          });
          fetchData();
          setOpenLineaDrawer(false); // Cierra el drawer
          setLinea(""); // Resetea el estado del input
        } catch (error) {
          console.error("Error al guardar la linea:", error);
          message.error("Hubo un error al añadir la linea.");
        }
      },
    });
  };
  const handleSubLineaChange = (e) => {
    setSubLinea({ ...subLinea, nombre: e.target.value });
  };

  const handleOpenSubLineaDrawer = async (id) => {
    setSubLinea({ linea_id: id });
    setOpenSubLineaDrawer(true);
  };
  const handleAddSubLinea = async () => {
    if (subLinea.nombre === undefined) {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de agregar esta sublinea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post(`http://localhost:3001/addSubLinea`, {
            nombre: subLinea.nombre,
            linea_id: subLinea.linea_id,
          });
          fetchData();
          setOpenSubLineaDrawer(false);
          notification.success({
            message: "SubLinea agregada",
            description: "La sublinea se agrego exitosamente",
            duration: 1,
          });
        } catch (error) {
          console.error("Error adding the linea or sublinea:", error);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de deshabilitar esta Linea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropLinea/${id}`);
            notification.success({
              message: "Linea desactivada",
              description: "La linea se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de habilitar esta Linea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upLinea/${id}`);
            notification.success({
              message: "Linea activada",
              description: "La linea se activo exitosamente",
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
        `http://localhost:3001/getLineaByID/${id}`
      );
      setCurrentLinea(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleEditedLinea = async () => {
    const editedLinea = {
      nombre: currentLinea.nombre,
      ID: currentLinea.id,
    };
    console.log(editedLinea.nombre);
    if (!editedLinea.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de editar esta Linea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`http://localhost:3001/updateLinea`, editedLinea);
          setOpenEditDrawer(false);
          fetchData();
          notification.success({
            message: "Linea editada con exito!",
            description: "La Linea ha sido editada con exito.",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };
  const columns = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip title={row.nombre}>
          <span className={row.estado === 0 ? "strikethrough" : ""}>
            {row.nombre}
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Añadir Sublineas",
      cell: (row) => (
        <Button
          onClick={() => handleOpenSubLineaDrawer(row.id)}
          className="custom-button"
        >
          Añadir SubLineas
        </Button>
      ),
    },

    {
      name: "Sublíneas",
      cell: (row) => (
        <Link to={`/linea/${row.id}`} style={{ textDecoration: "none" }}>
          <Button className="custom-button">Ver Sublíneas</Button>
        </Link>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
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
      <h1>Listado de lineas</h1>
      <Button
        style={{ marginBottom: 10 }}
        onClick={() => setOpenLineaDrawer(true)}
        type="primary"
      >
        Añadir Línea
      </Button>
      <div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable
            style={{ width: "100%" }}
            columns={columns}
            data={lineas}
            pagination={true}
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
        )}
      </div>
      <Drawer
        open={openLineaDrawer}
        onClose={() => setOpenLineaDrawer(false)}
        title="Añadir Línea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip title="Línea">
            <Input
              placeholder="Nombre de la línea"
              value={linea.nombre}
              onChange={handleLineaChange}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </div>
        <Button
          type="primary"
          onClick={handleGuardarLinea}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Drawer>
      <Drawer
        open={openSubLineaDrawer}
        onClose={() => setOpenSubLineaDrawer(false)}
        title="Añadir Nueva Sublínea"
      >
        <div>
          <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
            <strong>Añadir una nueva SubLinea</strong>
          </div>
          <Input
            placeholder="Nombre de la SubLínea"
            value={subLinea.nombre}
            onChange={handleSubLineaChange}
            style={{ padding: 0 }}
          />
        </div>
        <div>
          <Button
            type="primary"
            onClick={handleAddSubLinea}
            style={{ marginTop: 20 }}
          >
            Guardar
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={OpenEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        title="Editar Línea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={currentLinea?.nombre}
          onChange={(e) =>
            setCurrentLinea((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Linea"
          style={{ marginBottom: 10 }}
          required
        ></Input>
        <Button type="primary" onClick={handleEditedLinea}>
          Actualizar Sublinea
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default Linea;
