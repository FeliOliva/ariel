import React, { useState, useEffect } from "react";
import MenuLayout from "../components/MenuLayout";
import axios from "axios";
import {
  Drawer,
  Button,
  InputNumber,
  Tooltip,
  Modal,
  notification,
} from "antd";
import ArticulosInput from "../components/ArticulosInput";
import { Link, useNavigate } from "react-router-dom";
import "../style/style.css";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import CustomPagination from "../components/CustomPagination";
import DataTable from "react-data-table-component";
import { format, set } from "date-fns";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import DynamicListPedido from "../components/DynamicListPedido";
const Pedido = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [articuloValue, setArticuloValue] = useState("");
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [pedido, setPedido] = useState({
    articulos: [],
  });
  const { confirm } = Modal;

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/pedidos");
      setData(response.data);
      console.log("data", response.data);
    } catch (error) {
      console.error(error);
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
          title: "¿Esta seguro de desactivar este pedido?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.delete(`http://localhost:3001/dropPedido/${id}`);
            notification.success({
              message: "Pedido desactivado",
              description: "El pedido se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Esta seguro de activar esta pedido?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.post(`http://localhost:3001/upPedido/${id}`);
            notification.success({
              message: "Pedido activado",
              description: "El pedido se activo exitosamente",
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
      name: "Fecha",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={format(new Date(row.fecha_pedido), "dd/MM/yyyy")}
        >
          <span>{format(new Date(row.fecha_pedido), "dd/MM/yyyy")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Nro Pedido",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nro_pedido}
        >
          <span>{row.nro_pedido}</span>
        </Tooltip>
      ),
    },
    {
      name: "Acciones",
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
      name: "Detalle",
      selector: (row) => (
        <Link to={`/pedido/${row.id}`}>
          <button>Ver Detalles</button>
        </Link>
      ),
    },
  ];
  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
    console.log(selectedArticulo);
    console.log(articulo);
  };
  const handleAddArticulo = () => {
    if (selectedArticulo && cantidad > 0) {
      const uniqueId = `${selectedArticulo.id}-${Date.now()}`; // Generación del ID único
      setPedido((prev) => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            ...selectedArticulo,
            quantity: cantidad,
            label:
              selectedArticulo.nombre +
              " - " +
              selectedArticulo.linea_nombre +
              " - " +
              selectedArticulo.sublinea_nombre,
            value: selectedArticulo.id,
            uniqueId,
          },
        ],
      }));
      console.log(pedido);
      setSelectedArticulo(null);
      setCantidad(0);
      setArticuloValue("");
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Seleccione un articulo y una cantidad valida",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };
  const handleDeleteArticulo = (uniqueId) => {
    setPedido((prev) => ({
      ...prev,
      articulos: prev.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      ),
    }));
  };
  const handleAddPedido = async () => {
    if (pedido.articulos.length > 0) {
      const pedidoData = {
        estado: 1,
        detalles: pedido.articulos.map((articulo) => ({
          articulo_id: articulo.id,
          cantidad: articulo.quantity,
        })),
      };
      console.log("Datos a enviar:", pedidoData);
      confirm({
        title: "Confirmar",
        content: "¿Desea registrar este pedido?",
        okText: "Si",
        cancelText: "No",
        onOk: async () => {
          try {
            const response = await axios.post(
              "http://localhost:3001/pedidos",
              pedidoData
            );
            notification.success({
              message: "Exito",
              description: "pedido registrada con exito",
              duration: 2,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (error) {
            console.error("Error al registrar el pedido:", error);
          }
        },
      });
    } else {
      console.warn("No hay artículos en el pedido");
    }
  };
  return (
    <MenuLayout>
      <h1>Pedidos</h1>
      <Button
        type="primary"
        style={{ marginBottom: "10px" }}
        onClick={() => setOpen(true)}
      >
        Agregar Pedido
      </Button>
      <Drawer
        open={open}
        title="Nuevo Pedido"
        closable={true}
        maskClosable={false}
        onClose={() => setOpen(false)}
        width={700}
      >
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
          className="custom-button"
          onClick={handleAddArticulo}
          style={{ marginBottom: 20 }}
        >
          Agregar Artículo
        </Button>
        <DynamicListPedido
          items={pedido.articulos}
          onDelete={handleDeleteArticulo}
        />
        <Button onClick={handleAddPedido} type="primary">
          Registrar Pedido
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        pagination={true}
        paginationComponent={CustomPagination}
        responsive={true}
        customStyles={{
          rows: {
            style: {
              fontSize: "12px",
              padding: "0px 0px",
            },
          },
          headCells: {
            style: customHeaderStyles,
          },
          cells: {
            style: customCellsStyles,
          },
        }}
      ></DataTable>
    </MenuLayout>
  );
};

export default Pedido;
