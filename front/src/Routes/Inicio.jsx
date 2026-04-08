import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Col,
  Row,
  DatePicker,
  Spin,
  message,
  Typography,
  Tooltip,
  Select,
  Checkbox,
  Space,
  Tabs,
  Collapse,
  Statistic,
} from "antd";
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
import EstadisticasDashboard from "./EstadisticasDashboard";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const parseToNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, ""));
};

const formatNumber = (num) => {
  const rounded = Math.ceil(Number(num) || 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
};

/** Agrupa puntos del gráfico por día (sin cambio), semana o mes. */
const aggregateVentasChart = (rows, mode) => {
  if (!rows?.length || mode === "dia") return [...rows];
  const map = {};
  rows.forEach((item) => {
    const d = dayjs(item.fecha);
    const key =
      mode === "semana"
        ? d.startOf("week").format("YYYY-MM-DD")
        : d.startOf("month").format("YYYY-MM-DD");
    if (!map[key]) {
      map[key] = {
        fecha: key,
        total_vendido: 0,
        ganancia: 0,
        diferencia_promedio: 0,
        precio_promedio: 0,
        costo_promedio: 0,
        _n: 0,
      };
    }
    const m = map[key];
    m.total_vendido += parseFloat(item.total_vendido) || 0;
    m.ganancia += parseFloat(item.ganancia) || 0;
    m.diferencia_promedio += parseFloat(item.diferencia_promedio) || 0;
    m.precio_promedio += parseFloat(item.precio_promedio) || 0;
    m.costo_promedio += parseFloat(item.costo_promedio) || 0;
    m._n += 1;
  });
  return Object.values(map)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((m) => ({
      fecha: m.fecha,
      total_vendido: m.total_vendido,
      ganancia: m.ganancia,
      diferencia_promedio: m._n ? m.diferencia_promedio / m._n : 0,
      precio_promedio: m._n ? m.precio_promedio / m._n : 0,
      costo_promedio: m._n ? m.costo_promedio / m._n : 0,
    }));
};

function InfoHelp({ text }) {
  return (
    <Tooltip
      title={<div style={{ maxWidth: 400, whiteSpace: "pre-wrap" }}>{text}</div>}
      placement="topLeft"
    >
      <InfoCircleOutlined style={{ marginLeft: 6, color: "#1890ff", cursor: "help" }} />
    </Tooltip>
  );
}

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

  const [usarMismoRangoGrafico, setUsarMismoRangoGrafico] = useState(true);
  const [agregacionGrafico, setAgregacionGrafico] = useState("dia");

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
            `${process.env.REACT_APP_API_URL}/totalVentas?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/totalPagos?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/totalGastos?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/filterComprasByFecha?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/totalNotasCredito?startDate=${startDate}&endDate=${endDate}`
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/totalClientes`),
          axios.get(`${process.env.REACT_APP_API_URL}/cierre-masivo/saldo-total`, {
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

  // Polling para actualizar el saldo inicial cuando se modifican ventas que afectan el cierre
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Solo actualizar el saldo inicial si hay un rango de fechas seleccionado
      if (rangoFechas && rangoFechas.length === 2) {
        axios.get(`${process.env.REACT_APP_API_URL}/cierre-masivo/saldo-total`, {
          params: { fecha_corte: "2026-01-01" }
        })
          .then((response) => {
            const nuevoSaldo = parseToNumber(response.data.saldo_total || 0);
            // Solo actualizar si el valor cambió para evitar re-renders innecesarios
            setSaldoInicial((prevSaldo) => {
              if (prevSaldo !== nuevoSaldo) {
                return nuevoSaldo;
              }
              return prevSaldo;
            });
          })
          .catch((error) => {
            console.error("Error al actualizar saldo inicial:", error);
          });
      }
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(intervalId);
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
        `${process.env.REACT_APP_API_URL}/getVentasConGananciaFiltradas`,
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

  useEffect(() => {
    if (
      usarMismoRangoGrafico &&
      rangoFechas?.length === 2 &&
      rangoFechas[0] &&
      rangoFechas[1]
    ) {
      setRangoFechasGrafico([rangoFechas[0], rangoFechas[1]]);
    }
  }, [usarMismoRangoGrafico, rangoFechas]);

  const graficoProcesado = useMemo(
    () => aggregateVentasChart(graficoVentasData, agregacionGrafico),
    [graficoVentasData, agregacionGrafico]
  );

  const graficoResumen = useMemo(() => {
    if (!graficoProcesado.length) return null;
    let maxV = 0;
    let maxD = null;
    let sumV = 0;
    let sumG = 0;
    graficoProcesado.forEach((d) => {
      const v = parseFloat(d.total_vendido) || 0;
      const g = parseFloat(d.ganancia) || 0;
      sumV += v;
      sumG += g;
      if (v >= maxV) {
        maxV = v;
        maxD = d.fecha;
      }
    });
    const n = graficoProcesado.length;
    return {
      sumVendido: sumV,
      sumGanancia: sumG,
      promedioVendidoBucket: n ? sumV / n : 0,
      mejorBucket: maxD,
      mejorBucketMonto: maxV,
    };
  }, [graficoProcesado]);

  const comprasYGastos = totalCompras + totalGastos;

  // Si la fecha de inicio es >= 2026-01-01, usar el saldo inicial del cierre
  const fechaInicio = rangoFechas?.[0];
  const usarSaldoInicial = fechaInicio && dayjs(fechaInicio).isAfter(dayjs("2025-12-31"));

  // Ingreso limpio (ganancia neta): Ventas - (Compras + Gastos)
  // Esto representa la ganancia teórica, pero no considera el flujo de caja real
  const ingresoLimpio = totalVentas - comprasYGastos;

  // Flujo de caja real: Dinero que realmente entró menos gastos
  // Solo cuenta los pagos recibidos, no las ventas pendientes de cobro
  const flujoCajaReal = totalPagos - comprasYGastos;

  // Saldo pendiente de cobro: Ventas - Pagos - Notas de Crédito + Saldo Inicial (si aplica)
  // Representa el total que los clientes deben (cuentas por cobrar)
  const totalConEntrega = totalVentas - totalPagos - totalNotasCredito + (usarSaldoInicial ? saldoInicial : 0);

  // Ingreso efectivo neto: Flujo de caja real menos el saldo inicial pendiente
  // Muestra cuánto dinero realmente entró después de considerar lo que ya estaba pendiente
  const ingresoEfectivoNeto = flujoCajaReal - (usarSaldoInicial ? saldoInicial : 0);

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    background: "#f0f4ff",
    border: "1px solid #dbe2f2",
    color: "#1d3b72",
    fontWeight: 600,
    textAlign: "center",
  };

  const cardStylePrimary = {
    ...cardStyle,
    minHeight: 108,
    background: "#e8eeff",
    border: "1px solid #c7d4f0",
  };

  const tabNegocio = (
    <Spin spinning={loading}>
      <div style={{ padding: "1rem" }}>
        <Title level={2} style={{ color: "#1d3b72" }}>
          Inicio
        </Title>
        <h3 style={{ marginBottom: "1rem" }}>
          Rango principal (tarjetas y sincronización con «Ventas y productos»)
        </h3>
        <Space wrap style={{ marginBottom: "1rem" }} align="center">
          <RangePicker
            value={rangoFechas}
            onChange={(dates) => setRangoFechas(dates)}
          />
          <Text type="secondary">
            Elegí el período: las tarjetas muestran totales y comparaciones para esas fechas. El ícono ℹ️ explica qué significa cada indicador.
          </Text>
        </Space>

        {!rangoFechas ? (
          <Text type="secondary">
            Seleccioná un rango de fechas para ver la información.
          </Text>
        ) : (
          <>
            <Title level={4} style={{ marginTop: 8, marginBottom: 12, color: "#1d3b72" }}>
              Indicadores principales
            </Title>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} lg={6}>
                <Card
                  title={
                    <span>
                      Total de ventas
                      <InfoHelp text="Suma de todas las ventas registradas en el rango de fechas que elegiste (montos con descuento aplicado). Sirve para ver el volumen de facturación del período, aunque parte del dinero pueda estar aún por cobrar." />
                    </span>
                  }
                  style={cardStylePrimary}
                >
                  {formatNumber(totalVentas)}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  title={
                    <span>
                      Cuentas por cobrar
                      <InfoHelp
                        text={
                          usarSaldoInicial
                            ? "Cuánto te deben los clientes en conjunto al cierre del período: se parte de las ventas del rango, se restan los pagos recibidos y las notas de crédito, y si el período arranca desde 2026 se suma el saldo que venía del cierre anterior. Es deuda pendiente de cobro, no plata que ya tenés en caja."
                            : "Saldo que los clientes adeudan según ventas del período, menos lo que ya pagaron y las notas de crédito. Si comparás con un cierre de cuentas hasta fin de 2025, este número debería alinearse con esa deuda."
                        }
                      />
                    </span>
                  }
                  style={cardStylePrimary}
                >
                  {formatNumber(totalConEntrega)}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  title={
                    <span>
                      Flujo de caja real
                      <InfoHelp text="Dinero que realmente ingresó por cobros de clientes, menos lo que salió en compras de mercadería y gastos del mismo período. Refleja el movimiento de caja operativo: no es lo mismo que las ventas facturadas si todavía hay facturas sin cobrar." />
                    </span>
                  }
                  style={cardStylePrimary}
                >
                  {formatNumber(flujoCajaReal)}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  title={
                    <span>
                      Utilidad neta (teórica)
                      <InfoHelp text="Resultado ‘contable’ del período: todo lo vendido menos el costo de la mercadería comprada y los gastos. Mide si el negocio dejó margen sobre lo facturado, aunque el cobro de esas ventas pueda estar pendiente." />
                    </span>
                  }
                  style={cardStylePrimary}
                >
                  {formatNumber(ingresoLimpio)}
                </Card>
              </Col>
            </Row>

            <Collapse
              style={{ marginTop: 20 }}
              items={[
                {
                  key: "mas",
                  label: "Más indicadores financieros",
                  children: (
                    <Row gutter={[16, 16]} justify="center">
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                          title={
                            <span>
                              Total de compras
                              <InfoHelp text="Total invertido en compras de mercadería en el período seleccionado. Se usa junto con ventas y gastos para ver si el negocio cubre costos." />
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
                              Total de gastos
                              <InfoHelp text="Total de gastos cargados en el mismo rango de fechas (alquileres, servicios, etc.). Resta del resultado junto con las compras." />
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
                              Total de pagos
                              <InfoHelp text="Dinero efectivamente cobrado a clientes en el período. Para ver el flujo real de caja conviene compararlo con ventas: si es menor, hay ventas aún sin cobrar." />
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
                              Notas de crédito
                              <InfoHelp text="Montos de notas de crédito emitidas en el período. Reducen la deuda del cliente respecto de las ventas, igual que si hubieran pagado esa parte." />
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
                              <InfoHelp text="Cantidad de clientes activos cargados en el sistema. No cambia según el rango de fechas de arriba: es un dato de base, útil como contexto del negocio." />
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
                              Compras + gastos
                              <InfoHelp text="Suma de compras más gastos del período. Es el ‘costo total’ que se compara contra las ventas para la utilidad teórica y contra los pagos para el flujo de caja." />
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
                              Saldo inicial (cierre)
                              <InfoHelp text="Deuda que los clientes traían arrastrada al inicio de 2026 según el cierre de cuentas. Se usa en cuentas por cobrar cuando el período que mirás empieza desde 2026. El valor se refresca automáticamente cada pocos segundos por si hubo cambios." />
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
                              Ingreso efectivo neto
                              <InfoHelp text="Ajuste del flujo de caja cuando aplica el saldo inicial de apertura: resta ese saldo heredado del cierre para ver cuánto quedó ‘libre’ después de descontar lo que ya estaba pendiente al empezar el año." />
                            </span>
                          }
                          style={cardStyle}
                        >
                          {formatNumber(ingresoEfectivoNeto)}
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
          </>
        )}

        {/* Gráfico de Ventas y Ganancia */}
          <Card
            title={
              <span>
                Evolución de ventas y ganancia
                <InfoHelp text="Cómo evolucionan las ventas y la ganancia día a día (o agrupado por semana/mes). Podés filtrar por producto, línea, sublínea o proveedor para ver un segmento. Las fechas pueden ser las mismas que el resumen de arriba o un intervalo distinto." />
              </span>
            }
            style={{ marginTop: "2rem", marginBottom: "2rem" }}
          >
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col xs={24}>
                <Checkbox
                  checked={usarMismoRangoGrafico}
                  onChange={(e) => setUsarMismoRangoGrafico(e.target.checked)}
                >
                  Usar el mismo rango de fechas que el resumen principal
                  <InfoHelp text="Si está marcado, el gráfico toma las mismas fechas que el RangePicker de arriba y el selector de fechas del gráfico queda deshabilitado. Desmarcá para analizar otro período sin cambiar las tarjetas." />
                </Checkbox>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>
                    Agrupar puntos
                    <InfoHelp text="Con muchos días el gráfico se vuelve denso: agrupá por semana o mes para ver la tendencia. En cada barra de tiempo se suman ventas y ganancia; los promedios (precio, costo, etc.) se promedian dentro de ese bloque." />
                  </strong>
                </div>
                <Select
                  style={{ width: "100%" }}
                  value={agregacionGrafico}
                  onChange={setAgregacionGrafico}
                  options={[
                    { value: "dia", label: "Por día" },
                    { value: "semana", label: "Por semana" },
                    { value: "mes", label: "Por mes" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={16}>
                {graficoResumen && (
                  <Row gutter={8}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span>
                            Suma vendido (gráfico)
                            <InfoHelp text="Suma de lo vendido en todos los puntos que ves en el gráfico (según el agrupamiento elegido). Útil para contrastar con las tarjetas del resumen si usás el mismo rango." />
                          </span>
                        }
                        value={Math.ceil(graficoResumen.sumVendido)}
                        prefix="$"
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span>
                            Suma ganancia
                            <InfoHelp text="Suma de la ganancia asociada a esas ventas en el mismo período y filtros del gráfico." />
                          </span>
                        }
                        value={Math.ceil(graficoResumen.sumGanancia)}
                        prefix="$"
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title={
                          <span>
                            Mejor período (vendido)
                            <InfoHelp text="El día, semana o mes (según agrupación) en que más vendiste en este gráfico. El monto entre paréntesis es ese pico." />
                          </span>
                        }
                        value={
                          graficoResumen.mejorBucket
                            ? dayjs(graficoResumen.mejorBucket).format("DD/MM/YYYY")
                            : "—"
                        }
                        suffix={
                          graficoResumen.mejorBucketMonto
                            ? ` (${formatNumber(graficoResumen.mejorBucketMonto)})`
                            : ""
                        }
                        valueStyle={{ fontSize: 14 }}
                      />
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>
                    Tipo de filtro
                    <InfoHelp text="Acotá la curva a un solo producto, una línea, una sublínea o un proveedor. Sin filtro ves el total general del período." />
                  </strong>
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
                  <strong>
                    Rango del gráfico
                    <InfoHelp text="Desde cuándo hasta cuándo querés ver la curva. Si tenés marcado ‘mismo rango que el resumen’, este selector se desactiva y sigue al calendario principal." />
                  </strong>
                </div>
                <RangePicker
                  value={rangoFechasGrafico}
                  onChange={(dates) => setRangoFechasGrafico(dates)}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabled={usarMismoRangoGrafico}
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
                  <strong>
                    Series visibles
                    <InfoHelp text="Por defecto se muestran ventas y ganancia para no saturar el gráfico. Podés sumar líneas de precio promedio, costo o diferencia si querés comparar márgenes; todas comparten la misma escala de pesos." />
                  </strong>
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
              {graficoProcesado && graficoProcesado.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <LineChart
                    data={graficoProcesado.map(item => ({
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
                        if (graficoProcesado.length === 0) return [];
                        const maxValue = Math.max(
                          ...graficoProcesado.map(d =>
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
            <Title level={5} style={{ marginBottom: 8 }}>
              Cheques
              <InfoHelp text="Listado de cheques con fechas de cobro, importes y banco. Los colores ayudan a ver cuáles ya vencieron, cuáles vencen pronto y cuáles están más lejanos. Podés filtrar activos o dados de baja." />
            </Title>
            <ChequeTable />
          </div>
      </div>
    </Spin>
  );

  return (
    <MenuLayout>
      <Tabs
        defaultActiveKey="negocio"
        items={[
          {
            key: "negocio",
            label: "Resumen y finanzas",
            children: tabNegocio,
          },
          {
            key: "ventas",
            label: "Ventas y productos",
            children: (
              <div style={{ padding: "1rem" }}>
                <Title level={4} style={{ color: "#1d3b72" }}>
                  Estadísticas de ventas
                </Title>
                <p style={{ color: "#666", marginBottom: 16 }}>
                  El ranking general y el rango del detalle por línea se alinean al rango principal de la pestaña
                  «Resumen y finanzas». Podés cambiar períodos y consultar desde aquí sin salir del inicio.
                </p>
                <EstadisticasDashboard embedded sharedDateRange={rangoFechas} />
              </div>
            ),
          },
        ]}
      />
    </MenuLayout>
  );
};

export default Inicio;
