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
  ArrowUpOutlined,
  ArrowDownOutlined,
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
  const [openDown, setOpenDown] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState({});
  const [newCosto, setNewCosto] = useState(0);
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
    setDetalleCompra({
      id: response.data.id,
      costo: response.data.costo,
      cantidad: response.data.cantidad,
      articulo_id: response.data.articulo_id,
    });
    setOpenUp(true);
  };
  const handleDownPrice = async (id) => {
    const response = await axios.get(
      `http://localhost:3001/detalleCompra/${id}`
    );
    setDetalleCompra({
      id: response.data.id,
      costo: response.data.costo,
      cantidad: response.data.cantidad,
      articulo_id: response.data.articulo_id,
    });
    setOpenDown(true);
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
        cantidad: detalleCompra.cantidad,
        compra_id: compraInfo.compra_id,
        articulo_id: detalleCompra.articulo_id,
      };
      confirm({
        title: "Confirmar",
        content: "¿Estás seguro de que deseas aplicar el descuento?",
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
  const handleAplyDownFilter = async () => {
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
        cantidad: detalleCompra.cantidad,
        compra_id: compraInfo.compra_id,
        articulo_id: detalleCompra.articulo_id,
      };
      confirm({
        title: "Confirmar",
        content: "¿Estás seguro de que deseas aplicar el descuento?",
        okText: "Si",
        cancelText: "No",
        onOk: async () => {
          await axios.put("http://localhost:3001/updateDetalleCompra", newData);
          setOpenDown(false);
          notification.success({
            message: "Operación exitosa",
            description: "El descuento se aplicó correctamente",
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
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>{row.nombre}</div>
      ),
    },
    {
      name: "Cantidad",
      selector: (row) => row.cantidad,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>{row.cantidad}</div>
      ),
    },
    {
      name: "Precio Unitario",
      selector: (row) => row.costo,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.costo).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.subtotal,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "16px" }}>
          {parseFloat(row.subtotal).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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
            icon={<ArrowUpOutlined />}
          ></Button>
          <Button
            className="custom-button"
            onClick={() => handleDownPrice(row.detalle_compra_id)}
            icon={<ArrowDownOutlined />}
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
        title="Aumentar Precio"
      >
        <Tooltip>
          <strong>Costo</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={newCosto}
            onChange={(value) => setNewCosto(value)}
          />
          <Button onClick={handleAplyUpFilter}>Aplicar</Button>
        </div>
      </Drawer>
      <Drawer
        open={openDown}
        onClose={() => setOpenUp(false)}
        title="Bajar Precio"
      >
        <Tooltip>
          <strong>Costo</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={newCosto}
            onChange={(value) => setNewCosto(value)}
          />
          <Button onClick={handleAplyDownFilter}>Aplicar</Button>
        </div>
      </Drawer>
    </MenuLayout>
  );
};

export default CompraDetalles;
