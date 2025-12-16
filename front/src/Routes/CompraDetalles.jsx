import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Tooltip,
  InputNumber,
  notification,
  Modal,
} from "antd";
import {
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const CompraDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compraInfo, setCompraInfo] = useState({
    proveedor_nombre: "",
    nro_compra: "",
    fecha_compra: "",
    total: "",
  });
  const [openUp, setOpenUp] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState({});
  const [newCosto, setNewCosto] = useState(0);
  const [newPrecioMonotributista, setNewPrecioMonotributista] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const { confirm } = Modal;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getCompraByID/${id}`
        );

        const {
          detalles,
          compra_id,
          proveedor_nombre,
          nro_compra,
          fecha_compra,
          articulo_id,
          total,
        } = response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setCompraInfo({
            compra_id,
            proveedor_nombre,
            nro_compra,
            fecha_compra,
            articulo_id,
            total,
          });
          console.log(response.data);
        } else {
          console.error("Expected 'detalles' to be an array");
        }
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  const handleUpPrice = async (id) => {
    console.log(id);
    const response = await axios.get(
      `http://localhost:3001/detalleCompra/${id}`
    );
    console.log("response.data");
    console.log(response.data);
    setNewCosto(response.data.costo);
    setNewPrecioMonotributista(response.data.precio_monotributista);
    setCantidad(response.data.cantidad);
    setDetalleCompra({
      id: response.data.id,
      costo: response.data.costo,
      precio_monotributista: response.data.precio_monotributista,
      cantidad: response.data.cantidad,
      articulo_id: response.data.articulo_id,
    });
    setOpenUp(true);
  };
  const handleAplyUpFilter = async () => {
    if (newCosto < 0) {
      Modal.warning({
        title: "Advertencia",
        content: "El nuevo costo debe ser mayor o igual a 0",
        icon: <ExclamationCircleOutlined />,
      });
      return;
    }
    try {
      const newData = {
        ID: detalleCompra.id,
        new_costo: newCosto,
        new_precio_monotributista: newPrecioMonotributista,
        cantidad: cantidad,
        compra_id: compraInfo.compra_id,
        articulo_id: detalleCompra.articulo_id,
      };
      console.log(newData);
      confirm({
        title: "Confirmar",
        content: "¿Estás seguro de aplicar este cambio?",
        okText: "Si",
        cancelText: "No",
        onOk: async () => {
          await axios.put("http://localhost:3001/updateDetalleCompra", newData);
          setOpenUp(false);
          notification.success({
            message: "Operación exitosa",
            description: "Costo actualizado correctamente",
            duration: 2,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };
  const columns = [
    {
      name: "Descripción",
      selector: (row) => (
        <Tooltip title={row.nombre}>
          <span>{row.nombre}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Cantidad",
      selector: (row) => (
        <Tooltip title={row.cantidad}>
          <span>{row.cantidad}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Costo",
      selector: (row) => row.costo,
      sortable: true,
      cell: (row) => (
        <Tooltip title={row.costo}>
          <div style={{ padding: "5px", fontSize: "16px" }}>
            {parseFloat(row.costo).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
        </Tooltip>
      ),
    },
    {
      name: "Precio Monotributista",
      selector: (row) => row.precio_monotributista,
      sortable: true,
      cell: (row) => (
        <Tooltip title={row.precio_monotributista}>
          <div style={{ padding: "5px", fontSize: "16px" }}>
            {parseFloat(row.precio_monotributista).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
        </Tooltip>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.subtotal,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.subtotal).toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            className="custom-button"
            onClick={() => handleUpPrice(row.detalle_compra_id)}
            icon={<EditOutlined />}
          ></Button>
        </div>
      ),
    },
  ];

  const totalImporte = data
    .reduce((acc, item) => acc + parseFloat(item.subtotal), 0)
    .toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <MenuLayout>
      <h1>Detalle de Compra {compraInfo.nro_compra}</h1>
      <div>
        <Button onClick={() => window.history.back()} type="primary">
          Volver
        </Button>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div id="pdf-content" style={{ padding: "20px" }}>
            <DataTable
              columns={columns}
              data={data}
              pagination={false}
              customStyles={{
                rows: {
                  style: {
                    minHeight: "60px",
                  },
                },
                headCells: {
                  style: {
                    fontSize: "16px",
                    padding: "12px",
                  },
                },
                cells: {
                  style: {
                    fontSize: "14px",
                    padding: "10px",
                  },
                },
              }}
            />
            <div
              style={{
                textAlign: "right",
                marginTop: "20px",
                fontSize: "18px",
              }}
            >
              <strong>Total Importe: </strong> {totalImporte}
            </div>
          </div>
        )}
      </div>
      <Drawer
        open={openUp}
        onClose={() => setOpenUp(false)}
        title="Cambiar Precio"
      >
        <Tooltip>
          <strong>Costo</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={newCosto}
            onChange={(value) => setNewCosto(value)}
          />
        </div>
        <Tooltip>
          <strong>Precio Monotributista</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={newPrecioMonotributista}
            onChange={(value) => setNewPrecioMonotributista(value)}
          />
        </div>
        <Tooltip>
          <strong>Cantidad</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={cantidad}
            onChange={(value) => setCantidad(value)}
          />
        </div>
        <Button onClick={handleAplyUpFilter}>Aplicar</Button>
      </Drawer>
    </MenuLayout>
  );
};

export default CompraDetalles;
