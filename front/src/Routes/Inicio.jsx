import React, { useEffect, useState } from "react";
import { Card, Col, Row, DatePicker, Spin, message, Typography, Tooltip, Select, Checkbox, Space } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MenuLayout from "../components/MenuLayout";
import ChequeTable from "./ChequesTable";
import ArticulosInput from "../components/ArticulosInput";
import LineaInput from "../components/LineaInput";
import SubLineasInput from "../components/InputSubLineas";
import ProveedoresInput from "../components/ProveedoresInput";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const parseToNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, ""));
};

const formatNumber = (num) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(num);
};

const Inicio = () => {
  const [rangoFechas, setRangoFechas] = useState([
    dayjs("2026-01-01"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);

  const [totalVentas, setTotalVentas] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalPagos, setTotalPagos] = useState(0);
  const [totalNotasCredito, setTotalNotasCredito] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [saldoInicial, setSaldoInicial] = useState(0);
  
  // Estados para el gráfico de ventas
  const [graficoVentasData, setGraficoVentasData] = useState([]);
  const [loadingGrafico, setLoadingGrafico] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("ninguno");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
  const [articuloValue, setArticuloValue] = useState(null);
  const [rangoFechasGrafico, setRangoFechasGrafico] = useState([
    dayjs("2026-01-01"),
    dayjs(),
  ]);
  
  // Estados para controlar qué líneas mostrar en el gráfico
  const [lineasVisibles, setLineasVisibles] = useState({
    total_vendido: true,
    ganancia: true,
    diferencia_promedio: false,
    precio_promedio: false,
    costo_promedio: false,
  });

  const fetchTotales = async () => {
    if (!rangoFechas || rangoFechas.length !== 2) {
      message.warning("Por favor seleccione un rango de fechas");
      return;
    }

    setLoading(true);

    const startDate = rangoFechas[0]?.format("YYYY-MM-DD");
    const endDate = rangoFechas[1]?.format("YYYY-MM-DD");

    try {
      const [ventasRes, pagosRes, gastosRes, comprasRes, notasCreditoRes, clientesRes, saldoInicialRes] =
        await Promise.all([
          axios.get(
            `http://localhost:3001/totalVentas?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `http://localhost:3001/totalPagos?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `http://localhost:3001/totalGastos?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `http://localhost:3001/filterComprasByFecha?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `http://localhost:3001/totalNotasCredito?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(`http://localhost:3001/totalClientes`),
          axios.get(`http://localhost:3001/cierre-masivo/saldo-total`, {
            params: { fecha_corte: "2026-01-01" }
          }),
        ]);

      setTotalVentas(parseToNumber(ventasRes.data.suma_total));
      setTotalPagos(parseToNumber(pagosRes.data.suma_total));
      setTotalGastos(parseToNumber(gastosRes.data.suma_total));
      setTotalCompras(parseToNumber(comprasRes.data.suma_total));
      setTotalNotasCredito(parseToNumber(notasCreditoRes.data.suma_total));
      setTotalClientes(clientesRes.data.total || 0);
      setSaldoInicial(parseToNumber(saldoInicialRes.data.saldo_total || 0));
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Ocurrió un error al obtener los totales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoFechas]);

  const fetchGraficoVentas = async () => {
    if (!rangoFechasGrafico || rangoFechasGrafico.length !== 2) {
      message.warning("Por favor seleccione un rango de fechas para el gráfico");
      return;
    }

    setLoadingGrafico(true);
    try {
      const fechaInicio = rangoFechasGrafico[0].format("YYYY-MM-DD");
      const fechaFin = rangoFechasGrafico[1].format("YYYY-MM-DD");

      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      };

      if (filtroTipo === "articulo" && filtroSeleccionado?.id) {
        params.articulo_id = filtroSeleccionado.id;
      } else if (filtroTipo === "linea" && filtroSeleccionado?.id) {
        params.linea_id = filtroSeleccionado.id;
      } else if (filtroTipo === "sublinea" && filtroSeleccionado?.id) {
        params.sublinea_id = filtroSeleccionado.id;
      } else if (filtroTipo === "proveedor" && filtroSeleccionado?.id) {
        params.proveedor_id = filtroSeleccionado.id;
      }

      const response = await axios.get(
        `http://localhost:3001/getVentasConGananciaFiltradas`,
        { params }
      );

      setGraficoVentasData(response.data.ventas || []);
    } catch (error) {
      console.error("Error fetching gráfico ventas:", error);
      message.error("Error al cargar los datos del gráfico");
    } finally {
      setLoadingGrafico(false);
    }
  };

  useEffect(() => {
    if (rangoFechasGrafico && rangoFechasGrafico.length === 2) {
      fetchGraficoVentas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoFechasGrafico, filtroTipo, filtroSeleccionado]);

  const comprasYGastos = totalCompras + totalGastos;
  const ingresoLimpio = totalVentas - comprasYGastos;
  // Si la fecha de inicio es >= 2026-01-01, sumar el saldo inicial al total con entrega
  const fechaInicio = rangoFechas?.[0];
  const usarSaldoInicial = fechaInicio && dayjs(fechaInicio).isAfter(dayjs("2025-12-31"));
  const totalConEntrega = totalVentas - totalPagos - totalNotasCredito + (usarSaldoInicial ? saldoInicial : 0);

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    background: "#f0f4ff",
    border: "1px solid #dbe2f2",
    color: "#1d3b72",
    fontWeight: 600,
    textAlign: "center",
  };

  return (
    <MenuLayout>
      <Spin spinning={loading}>
        <div style={{ padding: "1rem" }}>
          <Title level={2} style={{ color: "#1d3b72" }}>
            Inicio
          </Title>
          <h3 style={{ marginBottom: "1rem", display: "flex" }}>
            Seleccioná un rango de fechas para ver los totales.
          </h3>
          <RangePicker
            value={rangoFechas}
            onChange={(dates) => setRangoFechas(dates)}
            style={{ marginBottom: "1rem" }}
          />

          {!rangoFechas ? (
            <Text type="secondary">
              Seleccioná un rango de fechas para ver la información.
            </Text>
          ) : (
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total de Ventas
                      <Tooltip title="Suma de todas las ventas (total_con_descuento) en el rango de fechas seleccionado">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalVentas)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total de Compras
                      <Tooltip title="Suma de todas las compras en el rango de fechas seleccionado">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalCompras)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total de Gastos
                      <Tooltip title="Suma de todos los gastos en el rango de fechas seleccionado">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalGastos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total de Pagos
                      <Tooltip title="Suma de todos los pagos recibidos de clientes en el rango de fechas seleccionado. Se resta del total de ventas para calcular el saldo pendiente.">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalPagos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total Notas de Crédito
                      <Tooltip title="Suma de todas las notas de crédito emitidas en el rango de fechas seleccionado. Se resta del total de ventas para calcular el saldo pendiente.">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalNotasCredito)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Clientes registrados
                      <Tooltip title="Cantidad total de clientes activos en el sistema">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {totalClientes}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Compras + Gastos
                      <Tooltip title="Suma de compras y gastos. Se resta de las ventas para calcular el ingreso limpio.">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(comprasYGastos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Ingreso limpio
                      <Tooltip title="Ventas - (Compras + Gastos). Representa la ganancia neta después de descontar los costos operativos.">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(ingresoLimpio)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Saldo Inicial (Cierre 2026)
                      <Tooltip title="Saldo total del cierre masivo de cuentas al 01/01/2026. Este es el saldo que tenían los clientes al inicio de 2026.">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(saldoInicial)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={
                    <span>
                      Total con entrega
                      <Tooltip title={usarSaldoInicial 
                        ? "Ventas - Pagos - Notas de Crédito + Saldo Inicial. Representa el saldo total que deben los clientes incluyendo el saldo inicial del cierre de 2026." 
                        : "Ventas - Pagos - Notas de Crédito. Representa el saldo total que deben los clientes (cuentas corrientes pendientes). Este valor debería coincidir con la suma de los saldos del cierre de cuentas si el rango de fechas es hasta el 31/12/2025."}>
                        <InfoCircleOutlined style={{ marginLeft: 8, color: "#1890ff" }} />
                      </Tooltip>
                    </span>
                  } 
                  style={cardStyle}
                >
                  {formatNumber(totalConEntrega)}
                </Card>
              </Col>

            </Row>
          )}

          {/* Gráfico de Ventas y Ganancia */}
          <Card 
            title="Gráfico de Ventas y Ganancia"
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
          >
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Tipo de Filtro:</strong>
                </div>
                <Select
                  style={{ width: "100%" }}
                  value={filtroTipo}
                  onChange={(value) => {
                    setFiltroTipo(value);
                    setFiltroSeleccionado(null);
                    setArticuloValue(null);
                  }}
                >
                  <Select.Option value="ninguno">Sin Filtro (Todos)</Select.Option>
                  <Select.Option value="articulo">Por Producto</Select.Option>
                  <Select.Option value="linea">Por Línea</Select.Option>
                  <Select.Option value="sublinea">Por Sublínea</Select.Option>
                  <Select.Option value="proveedor">Por Proveedor</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={filtroTipo !== "ninguno" ? 6 : 12}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Rango de Fechas:</strong>
                </div>
                <RangePicker
                  value={rangoFechasGrafico}
                  onChange={(dates) => setRangoFechasGrafico(dates)}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Col>
              {filtroTipo === "articulo" && (
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Producto:</strong>
                  </div>
                  <ArticulosInput
                    value={articuloValue}
                    onChangeArticulo={(articulo) => {
                      setFiltroSeleccionado(articulo);
                    }}
                    onInputChange={setArticuloValue}
                  />
                </Col>
              )}
              {filtroTipo === "linea" && (
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Línea:</strong>
                  </div>
                  <LineaInput
                    onChangeLinea={(linea) => setFiltroSeleccionado(linea)}
                  />
                </Col>
              )}
              {filtroTipo === "sublinea" && (
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Sublínea:</strong>
                  </div>
                  <SubLineasInput
                    onChangeSubLinea={(sublinea) => setFiltroSeleccionado(sublinea)}
                  />
                </Col>
              )}
              {filtroTipo === "proveedor" && (
                <Col xs={24} sm={12} md={6}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Proveedor:</strong>
                  </div>
                  <ProveedoresInput
                    onChangeProveedor={(proveedor) => setFiltroSeleccionado(proveedor)}
                  />
                </Col>
              )}
            </Row>
            
            {/* Selector de líneas a mostrar */}
            <Row gutter={16} style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <Col span={24}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Mostrar en el gráfico:</strong>
                </div>
                <Space wrap>
                  <Checkbox
                    checked={lineasVisibles.total_vendido}
                    onChange={(e) => setLineasVisibles({ ...lineasVisibles, total_vendido: e.target.checked })}
                  >
                    <span style={{ color: "#f5222d", fontWeight: 500 }}>Total Vendido</span>
                  </Checkbox>
                  <Checkbox
                    checked={lineasVisibles.ganancia}
                    onChange={(e) => setLineasVisibles({ ...lineasVisibles, ganancia: e.target.checked })}
                  >
                    <span style={{ color: "#fa8c16", fontWeight: 500 }}>Ganancia</span>
                  </Checkbox>
                  <Checkbox
                    checked={lineasVisibles.diferencia_promedio}
                    onChange={(e) => setLineasVisibles({ ...lineasVisibles, diferencia_promedio: e.target.checked })}
                  >
                    <span style={{ color: "#52c41a", fontWeight: 500 }}>Diferencia Promedio</span>
                  </Checkbox>
                  <Checkbox
                    checked={lineasVisibles.precio_promedio}
                    onChange={(e) => setLineasVisibles({ ...lineasVisibles, precio_promedio: e.target.checked })}
                  >
                    <span style={{ color: "#1890ff", fontWeight: 500 }}>Precio Promedio</span>
                  </Checkbox>
                  <Checkbox
                    checked={lineasVisibles.costo_promedio}
                    onChange={(e) => setLineasVisibles({ ...lineasVisibles, costo_promedio: e.target.checked })}
                  >
                    <span style={{ color: "#722ed1", fontWeight: 500 }}>Costo Promedio</span>
                  </Checkbox>
                </Space>
              </Col>
            </Row>
            
            <Spin spinning={loadingGrafico}>
              {graficoVentasData && graficoVentasData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart
                    data={graficoVentasData.map(item => ({
                      ...item,
                      fecha: new Date(item.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    }))}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `$${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `$${(value / 1000).toFixed(0)}K`;
                        }
                        return `$${value}`;
                      }}
                      width={90}
                      domain={[0, 'dataMax + 100000']}
                      allowDataOverflow={false}
                      ticks={(() => {
                        // Calcular ticks dinámicamente basado en el máximo valor
                        if (graficoVentasData.length === 0) return [];
                        const maxValue = Math.max(
                          ...graficoVentasData.map(d => 
                            Math.max(
                              d.total_vendido || 0,
                              d.ganancia || 0,
                              d.precio_promedio || 0,
                              d.costo_promedio || 0,
                              d.diferencia_promedio || 0
                            )
                          )
                        );
                        const step = maxValue > 1000000 
                          ? 200000 
                          : maxValue > 500000 
                          ? 100000 
                          : maxValue > 100000 
                          ? 50000 
                          : 25000;
                        const ticks = [];
                        for (let i = 0; i <= maxValue + step; i += step) {
                          ticks.push(i);
                        }
                        return ticks;
                      })()}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        const numValue = parseFloat(value);
                        return [`$${numValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`, name];
                      }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    {lineasVisibles.total_vendido && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="total_vendido"
                        stroke="#f5222d"
                        strokeWidth={2.5}
                        name="Total Vendido"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    )}
                    {lineasVisibles.ganancia && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ganancia"
                        stroke="#fa8c16"
                        strokeWidth={2.5}
                        name="Ganancia"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    )}
                    {lineasVisibles.diferencia_promedio && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="diferencia_promedio"
                        stroke="#52c41a"
                        strokeWidth={2}
                        name="Diferencia Promedio"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        strokeDasharray="5 5"
                      />
                    )}
                    {lineasVisibles.precio_promedio && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="precio_promedio"
                        stroke="#1890ff"
                        strokeWidth={2}
                        name="Precio Promedio"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        strokeDasharray="5 5"
                      />
                    )}
                    {lineasVisibles.costo_promedio && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="costo_promedio"
                        stroke="#722ed1"
                        strokeWidth={2}
                        name="Costo Promedio"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        strokeDasharray="5 5"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
                  {loadingGrafico ? "Cargando datos..." : "No hay datos para mostrar. Selecciona un rango de fechas y filtros."}
                </div>
              )}
            </Spin>
          </Card>

          <div style={{ marginTop: "2rem" }}>
            <ChequeTable />
          </div>
        </div>
      </Spin>
    </MenuLayout>
  );
};

export default Inicio;
