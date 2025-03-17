import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Button,
  DatePicker,
  Tooltip,
  Empty,
  message,
  Spin,
} from "antd";
import { Column } from "@ant-design/charts";
import MenuLayout from "../components/MenuLayout";
import ChequesTable from "./ChequesTable";
import moment from "moment";
import axios from "axios";
import ClienteInput from "../components/ClienteInput";

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

const Inicio = () => {
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalEntregas, setTotalEntregas] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [clienteValue, setClienteValue] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState(null);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  // Para forzar el re-renderizado del gráfico cuando cambia
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalVentas");
        const formattedTotal = formatNumber(response.data[0].total);
        setTotalIngresos(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
      }
    };
    fetchVentas();
  }, []);

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalPagos");
        const formattedTotal = formatNumber(response.data[0].total);
        setTotalEntregas(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las pagos:", error);
      }
    };
    fetchEntregas();
  }, []);

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalGastos");
        const formattedTotal = formatNumber(response.data[0].total);
        setTotalGastos(formattedTotal);
      } catch (error) {
        console.error("Error al obtener el total de gastos:", error);
      }
    };
    fetchGastos();
  }, []);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalCompras");
        const formattedTotal = formatNumber(response.data[0].total);
        setTotalCompras(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las el total de compras:", error);
      }
    };
    fetchCompras();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalClientes");
        setTotalClientes(response.data[0].total);
      } catch (error) {
        console.error("Error al obtener el total de clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  // Función para formatear números con separador de miles (usando puntos)
  const formatNumber = (num) => {
    if (!num) return "0";
    // Esto formatea el número con puntos como separadores de miles y coma para decimales (formato español)
    return new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const parseToNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/\./g, "").replace(",", "."));
  };

  const handleRangoFechasChange = (dates) => {
    setRangoFechas(dates);
  };

  const handleClienteChange = async (cliente) => {
    setClienteValue(cliente?.id || "");
    setClienteSeleccionado(cliente);
  };

  const fetchVentasFiltradas = async () => {
    if (!clienteSeleccionado || !rangoFechas || rangoFechas.length !== 2) {
      message.warning("Por favor seleccione un cliente y un rango de fechas");
      return;
    }

    setLoading(true);
    try {
      const startDate = rangoFechas[0].format("YYYY-MM-DD");
      const endDate = rangoFechas[1].format("YYYY-MM-DD");

      const response = await axios.post(
        "http://localhost:3001/filterVentasByCliente",
        {
          startDate: startDate,
          endDate: endDate,
          clienteId: clienteSeleccionado.id,
        }
      );
      console.log("response", response.data);

      // Procesar los datos para el gráfico - Asegurarse que total_importe es un número
      const processedData = response.data.map((item) => {
        // Convertir cadena a número
        const ventasValue = parseFloat(item.total_importe);
        return {
          fecha: moment(item.fecha_venta).format("DD/MM/YYYY"),
          ventas: ventasValue,
        };
      });

      // Combinar ventas de la misma fecha
      const ventasPorFecha = {};
      processedData.forEach((item) => {
        if (ventasPorFecha[item.fecha]) {
          ventasPorFecha[item.fecha] += item.ventas;
        } else {
          ventasPorFecha[item.fecha] = item.ventas;
        }
      });

      // Convertir de nuevo a array
      const ventasCombinadas = Object.keys(ventasPorFecha).map((fecha) => ({
        fecha,
        ventas: ventasPorFecha[fecha],
      }));

      setVentasFiltradas(ventasCombinadas);
      // Forzar re-render del gráfico con un nuevo key
      setChartKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error al filtrar ventas por cliente:", error);
      message.error("Error al obtener datos de ventas");
      setVentasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  const configVentas = {
    data: ventasFiltradas,
    xField: "fecha",
    yField: "ventas",
    // Configuración para barras más delgadas
    columnWidthRatio: 0.3, // Reduce el ancho de las barras (0-1)
    columnStyle: {
      // Estilo personalizado para las barras
      radius: [4, 4, 0, 0], // Bordes redondeados en la parte superior
    },
    // Configuración para etiquetas con formato de moneda
    label: {
      position: "top",
      content: (data) => {
        // Formatear con símbolo de moneda y separadores de miles
        return `$${formatNumber(data.ventas)}`;
      },
      style: {
        fill: "#000000",
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    xAxis: {
      title: { text: "Fecha" },
      label: {
        rotate: -45,
        style: { fill: "#555555" },
      },
    },
    yAxis: {
      title: { text: "Ventas ($)" },
      label: {
        formatter: (v) => `$${formatNumber(v)}`,
      },
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return `<div></div>`;
        const item = items[0];
        return `
          <div style="padding: 10px; font-family: Arial;">
            <div style="margin-bottom: 5px; font-weight: bold;">${title}</div>
            <div>
              <span>Ventas: </span>
              <span style="font-weight: bold;">$$${formatNumber(
                item.value
              )}</span>
            </div>
          </div>
        `;
      },
    },
    color: "#1979C9",
    interactions: [
      {
        type: "element-active",
      },
    ],
    animation: {
      appear: {
        animation: "wave-in",
        duration: 1000,
      },
    },
  };

  const comprasxgastos = formatNumber(
    parseToNumber(totalGastos) + parseToNumber(totalCompras)
  );

  const totalEnLimpio = formatNumber(
    parseToNumber(totalIngresos) - parseToNumber(comprasxgastos)
  );

  const TotalConEntrega = formatNumber(
    parseToNumber(totalIngresos) - parseToNumber(totalEntregas)
  );

  return (
    <MenuLayout>
      <Header style={{ color: "#fff", textAlign: "center", fontSize: "1.5em" }}>
        Dashboard de Ventas y Finanzas
      </Header>
      <Content style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          {/* Tarjetas de estadísticas */}
          <Col span={4}>
            <Card title="Total de Clientes" bordered={false}>
              {totalClientes}
            </Card>
          </Col>
          <Col span={4}>
            <Tooltip title="Total de la suma de Ventas">
              <Card title="Ingresos totales" bordered={false}>
                {`$${totalIngresos}`}
              </Card>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip title="Total de la suma de Compras y la suma de gastos">
              <Card title="Gastos Totales" bordered={false}>
                {`$${comprasxgastos}`}
              </Card>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip title="Diferencia entre las ventas y el total de gastos">
              <Card title="Total en Limpio" bordered={false}>
                {`$${totalEnLimpio}`}
              </Card>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip title="Total de las entregas realizadas por clientes">
              <Card title="Entregas" bordered={false}>
                {`$${totalEntregas}`}
              </Card>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip title="Diferencia entre entregas de clientes y ventas">
              <Card title="Total con Entrega" bordered={false}>
                {`$${TotalConEntrega}`}
              </Card>
            </Tooltip>
          </Col>
        </Row>

        <Content style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Seleccionar Cliente">
                <ClienteInput
                  value={clienteValue}
                  onChangeCliente={handleClienteChange}
                  onInputChange={setClienteValue}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Seleccionar Rango de Fechas">
                <Row gutter={[16, 16]} align="middle">
                  <Col span={18}>
                    <RangePicker
                      onChange={handleRangoFechasChange}
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Button
                      type="primary"
                      onClick={fetchVentasFiltradas}
                      style={{ width: "100%" }}
                      loading={loading}
                    >
                      Buscar
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col span={24}>
              <Card
                title={
                  clienteSeleccionado
                    ? `Ventas de ${
                        clienteSeleccionado.nombre || "Cliente Seleccionado"
                      }`
                    : "Ventas por Cliente y Fecha"
                }
              >
                {loading ? (
                  <div style={{ padding: "50px", textAlign: "center" }}>
                    <Spin size="large" />
                    <p style={{ marginTop: "16px" }}>
                      Cargando datos de ventas...
                    </p>
                  </div>
                ) : ventasFiltradas.length > 0 ? (
                  <div
                    style={{ height: "400px", width: "100%" }}
                    key={chartKey}
                  >
                    <Column {...configVentas} />
                  </div>
                ) : (
                  <Empty
                    description="Seleccione un cliente y un rango de fechas para visualizar las ventas"
                    style={{ padding: "40px" }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Content>

        <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
          <Col span={24}>
            <Card title="Historial de Cheques (Ordenado por Vencimiento)">
              <ChequesTable />
            </Card>
          </Col>
        </Row>
      </Content>
    </MenuLayout>
  );
};

export default Inicio;
