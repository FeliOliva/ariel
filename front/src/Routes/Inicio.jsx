import React, { useState } from "react";
import { Layout, Row, Col, Card, Select, Button } from "antd";
import { Column, Line } from "@ant-design/charts";
import MenuLayout from "../components/MenuLayout";
import ChequesTable from "./ChequesTable";

const { Header, Content } = Layout;
const { Option } = Select;

const Inicio = () => {
  const totalClientes = 120;
  const totalIngresos = 50000;
  const totalGastos = 15000;
  const totalLimpio = totalIngresos - totalGastos;
  const nuevosClientes = 20;
  const chequesPendientes = 10;
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtroTiempo, setFiltroTiempo] = useState("dia");

  const clientes = [
    { id: 1, nombre: "Cliente A" },
    { id: 2, nombre: "Cliente B" },
    { id: 3, nombre: "Cliente C" },
  ];

  const dataVentas = [
    // Ventas simuladas para Cliente A en diferentes meses
    {
      clienteId: 1,
      fecha: "2024-01-01",
      ventas: 200,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-01-15",
      ventas: 300,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-01-25",
      ventas: 250,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-05",
      ventas: 400,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-15",
      ventas: 450,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-25",
      ventas: 500,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-10",
      ventas: 600,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-20",
      ventas: 700,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-30",
      ventas: 750,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    // Datos adicionales para otros meses hasta 8 meses
    {
      clienteId: 1,
      fecha: "2024-04-15",
      ventas: 800,
      mes: "Abril",
      cuatrimestre: "Q2",
    },
    {
      clienteId: 1,
      fecha: "2024-05-05",
      ventas: 850,
      mes: "Mayo",
      cuatrimestre: "Q2",
    },
    {
      clienteId: 1,
      fecha: "2024-06-15",
      ventas: 900,
      mes: "Junio",
      cuatrimestre: "Q2",
    },
    {
      clienteId: 1,
      fecha: "2024-07-05",
      ventas: 950,
      mes: "Julio",
      cuatrimestre: "Q3",
    },
    {
      clienteId: 1,
      fecha: "2024-08-10",
      ventas: 1000,
      mes: "Agosto",
      cuatrimestre: "Q3",
    },
  ];

  const handleClienteChange = (value) => {
    setClienteSeleccionado(value);
  };

  const handleFiltroTiempoChange = (filtro) => {
    setFiltroTiempo(filtro);
  };

  const filtrarVentas = () => {
    if (!clienteSeleccionado) return [];

    return dataVentas
      .filter((venta) => venta.clienteId === clienteSeleccionado)
      .map((venta) => {
        if (filtroTiempo === "mes") {
          return { ...venta, fecha: venta.mes };
        } else if (filtroTiempo === "cuatrimestre") {
          return { ...venta, fecha: venta.cuatrimestre };
        }
        return venta;
      });
  };

  const configVentas = {
    data: filtrarVentas(),
    xField: "fecha",
    yField: "ventas",
    label: { style: { fill: "#FFFFFF", opacity: 0.6 } },
    xAxis: {
      title: { text: "Fecha" },
      label: { rotate: -30, style: { fill: "#AAAAAA" } },
    },
    yAxis: { title: { text: "Ventas" } },
    color: "#1979C9",
  };

  return (
    <MenuLayout>
      <Header style={{ color: "#fff", textAlign: "center", fontSize: "1.5em" }}>
        Dashboard de Ventas y Finanzas
      </Header>
      <Content style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          <Col span={4}>
            <Card title="Total de Clientes" bordered={false}>
              {totalClientes}
            </Card>
          </Col>
          <Col span={4}>
            <Card title="Ingresos Totales" bordered={false}>
              {`$${totalIngresos}`}
            </Card>
          </Col>
          <Col span={4}>
            <Card title="Gastos Totales" bordered={false}>
              {`$${totalGastos}`}
            </Card>
          </Col>
          <Col span={4}>
            <Card title="Total en Limpio" bordered={false}>
              {`$${totalLimpio}`}
            </Card>
          </Col>
          <Col span={4}>
            <Card title="Nuevos Clientes" bordered={false}>
              {nuevosClientes}
            </Card>
          </Col>
          <Col span={4}>
            <Card title="Cheques Pendientes" bordered={false}>
              {chequesPendientes}
            </Card>
          </Col>
        </Row>

        <Content style={{ padding: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Seleccionar Cliente">
                <Select
                  placeholder="Seleccione un cliente"
                  style={{ width: "100%" }}
                  onChange={handleClienteChange}
                >
                  {clientes.map((cliente) => (
                    <Option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </Option>
                  ))}
                </Select>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Filtro de Tiempo">
                <Button onClick={() => handleFiltroTiempoChange("dia")}>
                  Día
                </Button>
                <Button
                  onClick={() => handleFiltroTiempoChange("mes")}
                  style={{ marginLeft: "10px" }}
                >
                  Mes
                </Button>
                <Button
                  onClick={() => handleFiltroTiempoChange("cuatrimestre")}
                  style={{ marginLeft: "10px" }}
                >
                  Cuatrimestre
                </Button>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col span={24}>
              <Card
                title={`Ventas por ${
                  filtroTiempo === "dia"
                    ? "Día"
                    : filtroTiempo === "mes"
                    ? "Mes"
                    : "Cuatrimestre"
                }`}
              >
                <Column {...configVentas} /> {/* Cambiado de Line a Column */}
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
