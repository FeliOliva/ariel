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
    nro_compra: "",
    fecha_compra: "",
    total: "",
  });
  const [openUp, setOpenUp] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState({});
  const [newCosto, setNewCosto] = useState(0);
  const [newPrecioMonotributista, setNewPrecioMonotributista] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [porcentajeAumentoCosto, setPorcentajeAumentoCosto] = useState(0);
  const [porcentajeAumentoPrecio, setPorcentajeAumentoPrecio] = useState(0);
  const [costoOriginal, setCostoOriginal] = useState(0);
  const [precioOriginal, setPrecioOriginal] = useState(0);
  const [costoInicial, setCostoInicial] = useState(0); // Valor inicial cuando se abre el drawer
  const [precioInicial, setPrecioInicial] = useState(0); // Valor inicial cuando se abre el drawer
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
          nro_compra,
          fecha_compra,
          articulo_id,
          total,
        } = response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setCompraInfo({
            compra_id,
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
    const costo = parseFloat(response.data.costo) || 0;
    const precio = parseFloat(response.data.precio_monotributista) || 0;
    const porcentajeCosto = parseFloat(response.data.porcentaje_aumento_costo) || 0;
    const porcentajePrecio = parseFloat(response.data.porcentaje_aumento_precio) || 0;
    
    setNewCosto(costo);
    setNewPrecioMonotributista(precio);
    setCantidad(response.data.cantidad);
    setPorcentajeAumentoCosto(porcentajeCosto);
    setPorcentajeAumentoPrecio(porcentajePrecio);
    
    // Guardar valores iniciales para detectar cambios manuales
    setCostoInicial(costo);
    setPrecioInicial(precio);
    
    // Calcular valores originales (antes del aumento)
    // Usamos una aproximación ya que el redondeo hacia arriba hace que la inversa no sea exacta
    let costoOriginal = costo;
    let precioOriginal = precio;
    
    if (porcentajeCosto > 0) {
      // Aproximación: dividir por el factor (puede no ser exacto por el redondeo)
      costoOriginal = costo / (1 + porcentajeCosto / 100);
    }
    
    if (porcentajePrecio > 0) {
      precioOriginal = precio / (1 + porcentajePrecio / 100);
    }
    
    setCostoOriginal(costoOriginal);
    setPrecioOriginal(precioOriginal);
    
    setDetalleCompra({
      id: response.data.id,
      costo: costo,
      precio_monotributista: precio,
      cantidad: response.data.cantidad,
      articulo_id: response.data.articulo_id,
    });
    setOpenUp(true);
  };
  const handleAplyUpFilter = async () => {
    // Detectar si el usuario modificó manualmente los valores
    // Comparando con el valor inicial cuando se abrió el drawer
    const tolerancia = 0.01; // Tolerancia para comparaciones de punto flotante
    const costoFueModificadoManual = Math.abs(newCosto - costoInicial) > tolerancia;
    const precioFueModificadoManual = Math.abs(newPrecioMonotributista - precioInicial) > tolerancia;
    
    // Calcular valores esperados si se aplicaran los porcentajes
    let costoEsperadoConPorcentaje = newCosto;
    let precioEsperadoConPorcentaje = newPrecioMonotributista;
    
    if (porcentajeAumentoCosto > 0 && costoOriginal > 0) {
      const factorCosto = 1 + porcentajeAumentoCosto / 100;
      costoEsperadoConPorcentaje = Math.ceil(costoOriginal * factorCosto * 100) / 100;
    }
    
    if (porcentajeAumentoPrecio > 0 && precioOriginal > 0) {
      const factorPrecio = 1 + porcentajeAumentoPrecio / 100;
      precioEsperadoConPorcentaje = Math.ceil(precioOriginal * factorPrecio * 100) / 100;
    }
    
    // Si fue modificado manualmente, usar el valor manual directamente
    // Si no fue modificado manualmente y hay porcentaje, aplicar el porcentaje
    const costoAGuardar = costoFueModificadoManual || porcentajeAumentoCosto === 0 
      ? newCosto 
      : costoEsperadoConPorcentaje;
    
    const precioAGuardar = precioFueModificadoManual || porcentajeAumentoPrecio === 0
      ? newPrecioMonotributista
      : precioEsperadoConPorcentaje;
    
    // Determinar qué porcentajes guardar
    // Si el valor fue modificado manualmente, no guardar porcentaje (null)
    // Si no fue modificado manualmente y hay porcentaje, guardar el porcentaje
    const porcentajeCostoAGuardar = costoFueModificadoManual ? null : (porcentajeAumentoCosto > 0 ? porcentajeAumentoCosto : null);
    const porcentajePrecioAGuardar = precioFueModificadoManual ? null : (porcentajeAumentoPrecio > 0 ? porcentajeAumentoPrecio : null);
    
    if (costoAGuardar < 0 || precioAGuardar < 0) {
      Modal.warning({
        title: "Advertencia",
        content: "Los valores deben ser mayores o iguales a 0",
        icon: <ExclamationCircleOutlined />,
      });
      return;
    }
    try {
      const newData = {
        ID: detalleCompra.id,
        new_costo: costoAGuardar,
        new_precio_monotributista: precioAGuardar,
        cantidad: cantidad,
        compra_id: compraInfo.compra_id,
        articulo_id: detalleCompra.articulo_id,
        porcentaje_aumento_costo: porcentajeCostoAGuardar,
        porcentaje_aumento_precio: porcentajePrecioAGuardar,
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
            description: "Detalle actualizado correctamente",
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
            {Math.ceil(parseFloat(row.costo) || 0).toLocaleString("es-ES", {
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
            {Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString("es-ES", {
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
      name: "Aumento Costo %",
      selector: (row) => row.porcentaje_aumento_costo,
      sortable: true,
      cell: (row) => (
        <Tooltip title={row.porcentaje_aumento_costo ? `Aumento aplicado al costo: ${row.porcentaje_aumento_costo}%` : "Sin aumento"}>
          <div style={{ padding: "5px", fontSize: "16px" }}>
            {row.porcentaje_aumento_costo ? `${Math.round(row.porcentaje_aumento_costo)}%` : "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      name: "Aumento Precio %",
      selector: (row) => row.porcentaje_aumento_precio,
      sortable: true,
      cell: (row) => (
        <Tooltip title={row.porcentaje_aumento_precio ? `Aumento aplicado al precio: ${row.porcentaje_aumento_precio}%` : "Sin aumento"}>
          <div style={{ padding: "5px", fontSize: "16px" }}>
            {row.porcentaje_aumento_precio ? `${Math.round(row.porcentaje_aumento_precio)}%` : "-"}
          </div>
        </Tooltip>
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
        title="Modificar Detalle de Compra"
        width={400}
      >
        <div style={{ marginBottom: "16px" }}>
          <strong>Cantidad</strong>
          <div style={{ marginTop: "8px" }}>
            <InputNumber
              value={cantidad}
              onChange={(value) => setCantidad(value)}
              min={0}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <strong style={{ marginBottom: "8px", display: "block" }}>Aumento por Porcentaje:</strong>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ marginBottom: "4px" }}>
              <strong style={{ fontSize: "12px" }}>Aumento Costo %:</strong>
            </div>
            <InputNumber
              value={porcentajeAumentoCosto}
              onChange={(value) => {
                setPorcentajeAumentoCosto(value || 0);
              }}
              min={0}
              max={1000}
              formatter={(value) => value ? `${value}%` : ''}
              parser={(value) => value.replace('%', '').replace(/\s/g, '')}
              style={{ width: "100%" }}
              placeholder="%"
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ marginBottom: "4px" }}>
              <strong style={{ fontSize: "12px" }}>Aumento Precio %:</strong>
            </div>
            <InputNumber
              value={porcentajeAumentoPrecio}
              onChange={(value) => {
                setPorcentajeAumentoPrecio(value || 0);
              }}
              min={0}
              max={1000}
              formatter={(value) => value ? `${value}%` : ''}
              parser={(value) => value.replace('%', '').replace(/\s/g, '')}
              style={{ width: "100%" }}
              placeholder="%"
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Costo</strong>
          <div style={{ marginTop: "8px" }}>
            <InputNumber
              value={newCosto}
              onChange={(value) => setNewCosto(value)}
              min={0}
              style={{ width: "100%" }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              precision={2}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Precio Monotributista</strong>
          <div style={{ marginTop: "8px" }}>
            <InputNumber
              value={newPrecioMonotributista}
              onChange={(value) => setNewPrecioMonotributista(value)}
              min={0}
              style={{ width: "100%" }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              precision={2}
            />
          </div>
        </div>

        <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#e6f7ff", borderRadius: "4px" }}>
          <strong>Subtotal: </strong>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            ${(newCosto * cantidad).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <div style={{ marginTop: "16px" }}>
          <Button 
            type="primary" 
            onClick={handleAplyUpFilter}
            style={{ width: "100%" }}
            size="large"
          >
            Guardar Cambios
          </Button>
        </div>
      </Drawer>
    </MenuLayout>
  );
};

export default CompraDetalles;
