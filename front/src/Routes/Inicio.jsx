import React, { useEffect, useState } from "react";
import { Card, Col, Row, DatePicker, Spin, message, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import MenuLayout from "../components/MenuLayout";
import ChequeTable from "./ChequesTable";

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
    dayjs("2025-01-01"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);

  const [totalVentas, setTotalVentas] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalPagos, setTotalPagos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);

  const fetchTotales = async () => {
    if (!rangoFechas || rangoFechas.length !== 2) {
      message.warning("Por favor seleccione un rango de fechas");
      return;
    }

    setLoading(true);

    const startDate = rangoFechas[0]?.format("YYYY-MM-DD");
    const endDate = rangoFechas[1]?.format("YYYY-MM-DD");

    try {
      const [ventasRes, pagosRes, gastosRes, comprasRes, clientesRes] =
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
          axios.get(`http://localhost:3001/totalClientes`),
        ]);

      setTotalVentas(parseToNumber(ventasRes.data.suma_total));
      setTotalPagos(parseToNumber(pagosRes.data.suma_total));
      setTotalGastos(parseToNumber(gastosRes.data.suma_total));
      setTotalCompras(parseToNumber(comprasRes.data.suma_total));
      setTotalClientes(clientesRes.data.total || 0);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Ocurrió un error al obtener los totales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotales();
  }, [rangoFechas]);

  const comprasYGastos = totalCompras + totalGastos;
  const ingresoLimpio = totalVentas - comprasYGastos;
  const totalConEntrega = totalVentas - totalPagos;

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
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Total de Ventas" style={cardStyle}>
                  {formatNumber(totalVentas)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Total de Compras" style={cardStyle}>
                  {formatNumber(totalCompras)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Total de Gastos" style={cardStyle}>
                  {formatNumber(totalGastos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Total de Pagos" style={cardStyle}>
                  {formatNumber(totalPagos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Clientes registrados" style={cardStyle}>
                  {totalClientes}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Compras + Gastos" style={cardStyle}>
                  {formatNumber(comprasYGastos)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Ingreso limpio" style={cardStyle}>
                  {formatNumber(ingresoLimpio)}
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Card title="Total con entrega" style={cardStyle}>
                  {formatNumber(totalConEntrega)}
                </Card>
              </Col>
            </Row>
          )}

          <div style={{ marginTop: "2rem" }}>
            <ChequeTable />
          </div>
        </div>
      </Spin>
    </MenuLayout>
  );
};

export default Inicio;
