import React, { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Select,
  Button,
  DatePicker,
  Tooltip,
} from "antd";
import { Column } from "@ant-design/charts";
import MenuLayout from "../components/MenuLayout";
import ChequesTable from "./ChequesTable";
import moment from "moment";
import axios from "axios";
import { set } from "date-fns";

const { Header, Content } = Layout;
const { Option } = Select;
// const { RangePicker } = DatePicker;

const Inicio = () => {
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalEntregas, setTotalEntregas] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalVentas");
        const formattedTotal = formatNumber(response.data[0].total);
        console.log("ventas", formattedTotal);
        setTotalIngresos(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
      }
    };
    fetchVentas();
  });
  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalPagos");
        const formattedTotal = formatNumber(response.data[0].total);
        console.log("entregas", formattedTotal);
        setTotalEntregas(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las pagos:", error);
      }
    };
    fetchEntregas();
  });
  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalGastos");
        const formattedTotal = formatNumber(response.data[0].total);
        console.log("gastos", formattedTotal);
        setTotalGastos(formattedTotal);
      } catch (error) {
        console.error("Error al obtener el total de gastos:", error);
      }
    };
    fetchGastos();
  });
  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const response = await axios.get("http://localhost:3001/totalCompras");
        const formattedTotal = formatNumber(response.data[0].total);
        console.log("compras", formattedTotal);
        setTotalCompras(formattedTotal);
      } catch (error) {
        console.error("Error al obtener las el total de compras:", error);
      }
    };
    fetchCompras();
  });
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
  });
  const formatNumber = (num) => {
    if (!num) return "0"; // Manejar valores nulos o indefinidos
    return new Intl.NumberFormat("es-ES").format(num);
  };
  const parseToNumber = (value) => {
    if (!value) return 0; // Si el valor es null, undefined o 0, retorna 0
    return parseFloat(value.toString().replace(/\./g, "").replace(",", "."));
  };

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtroTiempo, setFiltroTiempo] = useState("dia");
  const [rangoFechas, setRangoFechas] = useState("");

  const clientes = [
    { id: "all", nombre: "Todos los Clientes" },
    { id: 1, nombre: "Jessica Bareto" },
    { id: 2, nombre: "Armando Pérez" },
    { id: 3, nombre: "Carolina Gabalgio" },
  ];

  const dataVentas = [
    // Ventas simuladas para Cliente A
    {
      clienteId: 1,
      fecha: "2024-01-05",
      ventas: 200,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-01-15",
      ventas: 250,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-01-25",
      ventas: 300,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-10",
      ventas: 400,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-20",
      ventas: 450,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-02-28",
      ventas: 500,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-05",
      ventas: 600,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-15",
      ventas: 650,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 1,
      fecha: "2024-03-25",
      ventas: 700,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    // Ventas simuladas para Cliente B
    {
      clienteId: 2,
      fecha: "2024-01-07",
      ventas: 220,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-01-17",
      ventas: 270,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-01-27",
      ventas: 320,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-02-12",
      ventas: 420,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-02-22",
      ventas: 470,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-02-28",
      ventas: 520,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-03-08",
      ventas: 620,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-03-18",
      ventas: 670,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 2,
      fecha: "2024-03-28",
      ventas: 720,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    // Ventas simuladas para Cliente C
    {
      clienteId: 3,
      fecha: "2024-01-10",
      ventas: 240,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-01-20",
      ventas: 290,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-01-30",
      ventas: 340,
      mes: "Enero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-02-14",
      ventas: 440,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-02-24",
      ventas: 490,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-02-28",
      ventas: 540,
      mes: "Febrero",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-03-11",
      ventas: 640,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-03-21",
      ventas: 690,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    {
      clienteId: 3,
      fecha: "2024-03-31",
      ventas: 740,
      mes: "Marzo",
      cuatrimestre: "Q1",
    },
    // Repetir este patrón para los meses restantes
  ];

  const handleClienteChange = (value) => {
    setClienteSeleccionado(value);
  };

  const handleFiltroTiempoChange = (filtro) => {
    setFiltroTiempo(filtro);
  };

  const handleRangoFechasChange = (dates) => {
    if (dates && dates.length === 2) {
      // Formatea las fechas en el formato "DD/MM/YYYY"
      const formattedDates = dates.map((date) => date.format("DD/MM/YYYY"));
      setRangoFechas(formattedDates); // Guarda las fechas originales en el estado
      console.log("Fechas seleccionadas:", formattedDates);
    } else {
      setRangoFechas([]); // Restablece el estado como un arreglo vacío
    }
  };

  const filtrarYProcesarVentas = (
    ventas = [],
    clienteId = "all",
    rangoFechas = []
  ) => {
    // 1. Filtrado por cliente
    const filtradoPorCliente =
      clienteId !== "all"
        ? ventas.filter((venta) => venta.clienteId === clienteId)
        : ventas;

    // 2. Filtrado por rango de fechas
    const fechasValidas =
      Array.isArray(rangoFechas) && rangoFechas.length === 2;
    const filtradoPorFechas = fechasValidas
      ? filtradoPorCliente.filter((venta) => {
          const fechaVenta = moment(venta.fecha, "YYYY-MM-DD");
          const [fechaInicio, fechaFin] = rangoFechas.map((fecha) =>
            moment(fecha, "DD/MM/YYYY")
          );
          return (
            fechaVenta.isSameOrAfter(fechaInicio) &&
            fechaVenta.isSameOrBefore(fechaFin)
          );
        })
      : filtradoPorCliente;

    // 3. Agrupación y suma de ventas por día
    const ventasAgrupadas = filtradoPorFechas.reduce((acumulador, venta) => {
      const fecha = moment(venta.fecha).format("YYYY-MM-DD");
      if (!acumulador[fecha]) {
        acumulador[fecha] = { fecha, ventas: 0 };
      }
      acumulador[fecha].ventas += venta.ventas;
      return acumulador;
    }, {});

    // 4. Convertir a array y ordenar por fecha
    return Object.values(ventasAgrupadas).sort((a, b) =>
      moment(a.fecha).isBefore(moment(b.fecha)) ? -1 : 1
    );
  };

  const configVentas = {
    data: filtrarYProcesarVentas(dataVentas, clienteSeleccionado, rangoFechas),
    xField: "fecha",
    yField: "ventas",
    label: { style: { fill: "#FFFFFF", opacity: 0.6 } },
    xAxis: {
      title: { text: "Fecha" },
      label: {
        rotate: -45,
        style: { fill: "#AAAAAA" },
        formatter: (text) => text.replace(/\/\d{4}$/, ""),
      },
    },
    yAxis: { title: { text: "Ventas" } },
    color: "#1979C9",
  };
  const comprasxgastos = formatNumber(
    parseToNumber(totalGastos) + parseToNumber(totalCompras)
  );
  console.log("compras y gastos", formatNumber(comprasxgastos));

  const totalEnLimpio = formatNumber(
    parseToNumber(totalIngresos) - parseToNumber(comprasxgastos)
  );
  console.log("total en limpio", formatNumber(totalEnLimpio));

  const TotalConEntrega = formatNumber(
    parseToNumber(totalIngresos) - parseToNumber(totalEntregas)
  );
  console.log("total con entregas", formatNumber(TotalConEntrega));

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
              <Card title="Seleccionar Rango de Fechas">
                <DatePicker.RangePicker
                  onChange={(dates) => handleRangoFechasChange(dates)}
                  // format="DD/MM/YYYY"
                />
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
