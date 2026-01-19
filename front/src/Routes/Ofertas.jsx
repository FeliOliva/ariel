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
import {
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import MenuLayout from "../components/MenuLayout";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import DynamicList from "../components/DynamicList"; // Asegúrate de tener este componente
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import "../style/style.css";

function Ofertas() {
  const [data, setData] = useState([]);
  const [currentOfert, setCurrentOfert] = useState({
    id: null,
    nombre: "",
    productos: [],
  });
  const [open, setOpen] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [newOfert, setNewOfert] = useState({
    nombre: "",
    productos: [],
  });
  const [articuloValue, setArticuloValue] = useState(null);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { confirm } = Modal;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/ofertas`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/detalleOferta/${id}`
      );
      setCurrentOfert(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleEditOfert = async () => {
    const updatedOfert = {
      id: currentOfert.id,
      nombre: currentOfert.nombre,
      productos: currentOfert.productos.map((producto) => ({
        articulo_id: producto.id, // Asegúrate de que este ID es correcto en el backend
        cantidad: producto.cantidad,
      })),
    };
    confirm({
      title: "¿Esta seguro de modificar esta oferta?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/updateOferta`, updatedOfert);
          setOpenEditDrawer(false);
          fetchData(); // Refresca la tabla con los nuevos datos
          notification.success({
            message: "Oferta modificada con exito!",
            description: "La oferta ha sido modificada con exito.",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error updating the offer:", error);
        }
      },
    });
  };

  const handleAddArticulo = () => {
    if (selectedArticulo.precio_oferta === null) {
      Modal.warning({
        title: "Advertencia",
        content: "Este artículo no tiene un precio de oferta.",
        icon: <ExclamationCircleOutlined />,
      });
      return;
    } else {
      if (selectedArticulo && cantidad > 0) {
        setNewOfert((prev) => ({
          ...prev,
          productos: [
            ...prev.productos,
            {
              ...selectedArticulo,
              quantity: cantidad,
              label: selectedArticulo.nombre,
              value: selectedArticulo.id,
            },
          ],
        }));
        setSelectedArticulo(null);
        setArticuloValue(""); // Reinicia la selección del artículo
        setCantidad(1); // Reinicia la cantidad
      } else {
        Modal.warning({
          title: "Advertencia",
          content: "No cargaste un articulo.",
          icon: <ExclamationCircleOutlined />,
        });
      }
    }
  };

  const handleDeleteArticulo = (id) => {
    setNewOfert((prev) => ({
      ...prev,
      productos: prev.productos.filter((producto) => producto.id !== id),
    }));
  };

  const handleSaveOfert = async () => {
    confirm({
      title: "¿Esta seguro de crear esta oferta?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const ofertaData = {
            nombre: newOfert.nombre,
            detalles: newOfert.productos.map((producto) => ({
              articulo_id: producto.id,
              cantidad: producto.quantity,
              precioOferta: producto.precio_oferta, // Ajuste para cumplir con el formato del endpoint
            })),
          };

          await axios.post(`${process.env.REACT_APP_API_URL}/addOferta`, ofertaData);
          setOpen(false);
          fetchData();
          notification.success({
            message: "Oferta Creada",
            description: "La oferta se ha creado correctamente.",
            duration: 2,
          });
        } catch (error) {
          console.error("Error saving the offer:", error);
        }
      },
    });
  };

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo); // Guarda todo el objeto del artículo
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del producto
  };
  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Esta seguro de desactivar esta oferta?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/dropOferta/${id}`);
            notification.success({
              message: "Oferta desactivada",
              description: "La oferta se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Esta seguro de activar esta oferta?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/upOferta/${id}`);
            notification.success({
              message: "Oferta activada",
              description: "La oferta se activo exitosamente",
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
      name: "Fecha",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {format(new Date(row.fecha), "dd/MM/yyyy")}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Precio total",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.total_oferta}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Detalles",
      cell: (row) => (
        <Link to={`/ofertas/${row.id}`}>
          <Button type="primary">Detalles</Button>
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
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <MenuLayout>
      <h1>Listado de ofertas</h1>
      <Button type="primary" onClick={() => setOpen(true)}>
        Añadir oferta
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Añadir oferta"
        width={720}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre de la oferta</Tooltip>
        </div>
        <Input
          value={newOfert.nombre}
          onChange={(e) => setNewOfert({ ...newOfert, nombre: e.target.value })}
          placeholder="Nombre de la oferta"
        />
        <div>
          <div style={{ display: "block", marginTop: 10 }}>
            <Tooltip>Seleccionar artículo</Tooltip>
          </div>
          <ArticulosInput
            value={articuloValue}
            onChangeArticulo={handleArticuloChange}
            onInputChange={setArticuloValue}
          />
          <InputNumber
            min={1}
            value={cantidad}
            onChange={(value) => setCantidad(value)}
            style={{ marginBottom: 10 }}
          />
          <Button
            type="primary"
            onClick={handleAddArticulo}
            style={{ marginBottom: 20 }}
          >
            Agregar Artículo
          </Button>
          <DynamicList
            items={newOfert.productos}
            onDelete={handleDeleteArticulo}
          />
          <Button className="custom-button" onClick={handleSaveOfert}>
            Guardar Oferta
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        title="Editar oferta"
        width={720}
      >
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 20 }}>Nombre de la oferta</strong>
          <Input
            value={currentOfert.nombre}
            style={{ marginTop: 10 }}
            onChange={(e) =>
              setCurrentOfert((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Nombre de la oferta"
          />
        </div>

        {currentOfert?.productos?.map((valueProd, indexProd) => (
          <div
            key={indexProd}
            style={{
              marginBottom: 20,
              padding: 10,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              backgroundColor: "#fafafa",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <strong>{valueProd?.nombre}</strong>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div>
                <strong>Cantidad:</strong>
                <InputNumber
                  value={valueProd?.cantidad}
                  onChange={(value) => {
                    setCurrentOfert((prev) => {
                      const updatedProducts = [...prev.productos];
                      updatedProducts[indexProd].cantidad = value;
                      return { ...prev, productos: updatedProducts };
                    });
                  }}
                  min={1}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <strong>Precio:</strong>
                <InputNumber
                  value={valueProd?.precio}
                  placeholder="Precio"
                  step={0.01}
                  readOnly
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="primary" onClick={handleEditOfert}>
          Guardar
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        pagination
        title="Ofertas"
        highlightOnHover
        width="720px"
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
}

export default Ofertas;
