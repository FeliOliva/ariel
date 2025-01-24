import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Button, message, DatePicker } from "antd";
import axios from "axios";
import { format } from "date-fns";
import ClienteInput from "../components/ClienteInput";
import AgregarPagoDrawer from "../components/AgregarPagoDrawer";
import { Tooltip } from "antd";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import isValid from "date-fns/isValid";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ResumenCuenta = () => {
  const [ventas, setVentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [nextNroPago, setNextNroPago] = useState("00001");
  const [rangoFechas, setRangoFechas] = useState([]);
  const [showTables, setShowTables] = useState(false);
  const { RangePicker } = DatePicker;
  const [totales, setTotales] = useState({
    totalVentas: 0,
    totalPagos: 0,
    saldoPendiente: 0,
  });

  const generatePDF = () => {
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }
    if (!rangoFechas || rangoFechas.length !== 2) {
      return message.warning("Por favor, seleccione un rango de fechas.");
    }

    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.text("Resumen de Cuenta", 10, 10);

    // Información del cliente
    doc.setFontSize(10);
    doc.text(`Farmacia: ${selectedCliente.farmacia}`, 10, 20);
    doc.text(
      `Cliente: ${selectedCliente.nombre} ${selectedCliente.apellido}`,
      10,
      26
    );
    doc.text(`Rango de Fechas: ${rangoFechas[0]} - ${rangoFechas[1]}`, 10, 32);

    // Tabla de Ventas
    doc.text("Ventas", 10, 40);
    const ventasTable = ventas.map((venta) => [
      format(new Date(venta.fecha_venta), "dd/MM/yyyy"),
      venta.nroVenta,
      `$${venta.total_con_descuento_formateado}`,
    ]);
    doc.autoTable({
      head: [["Fecha", "Nro. Venta", "Total"]],
      body: ventasTable,
      startY: 45,
    });

    // Tabla de Pagos
    const pagosY = doc.lastAutoTable.finalY + 10;
    doc.text("Pagos", 10, pagosY);
    const pagosTable = pagos.map((pago) => [
      format(new Date(pago.fecha_pago), "dd/MM/yyyy"),
      pago.nro_pago,
      `$${pago.monto}`,
      pago.metodo_pago,
    ]);
    doc.autoTable({
      head: [["Fecha", "Nro. Pago", "Monto", "Método de Pago"]],
      body: pagosTable,
      startY: pagosY + 5,
    });

    // Totales
    const totalesY = doc.lastAutoTable.finalY + 10;
    doc.text("Totales", 10, totalesY);
    doc.text(`Total Ventas: $${totales.totalVentas}`, 10, totalesY + 10);
    doc.text(`Total Pagos: $${totales.totalPagos}`, 10, totalesY + 20);
    doc.text(`Saldo Pendiente: $${totales.saldoPendiente}`, 10, totalesY + 30);

    // Guardar PDF
    doc.save(`ResumenCuenta_${selectedCliente.nombre}.pdf`);
  };
  const navigate = useNavigate();

  const goToResumenCuentaXZona = () => {
    navigate("/ResumenCuentaXZona");
  };

  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };

      const [ventasResponse, pagosResponse] = await Promise.all([
        axios.get(`http://localhost:3001/ventasxclientexfecha/${clienteId}`, {
          params,
        }),
        axios.get(`http://localhost:3001/getPagosByClienteId/${clienteId}`, {
          params,
        }),
      ]);

      const ventasData = ventasResponse.data || [];
      const pagosData = pagosResponse.data || [];
      setVentas(ventasData);
      setPagos(pagosData);

      // Calcular el próximo número de pago
      if (pagosData.length > 0) {
        const maxNroPago = Math.max(
          ...pagosData.map((pago) => parseInt(pago.nro_pago, 10))
        );
        setNextNroPago(String(maxNroPago + 1).padStart(5, "0"));
      } else {
        setNextNroPago("00001");
      }

      if (ventasData.length > 0) {
        const totalVentasFormateado =
          ventasData[0].total_ventas_formateado || "0";
        const totalVentas =
          parseFloat(
            totalVentasFormateado.replace(/\./g, "").replace(",", ".")
          ) || 0;

        const totalPagos = pagosData.reduce(
          (sum, pago) => sum + (parseFloat(pago.monto || 0) || 0),
          0
        );

        const saldoPendiente = totalVentas - totalPagos;

        setTotales({
          totalVentas: totalVentas,
          totalPagos: totalPagos,
          saldoPendiente: saldoPendiente,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Hubo un error al cargar los datos.");
    }
  };

  // Llamar a `fetchData` cuando el cliente o las fechas cambien
  useEffect(() => {
    if (selectedCliente && selectedCliente.id && rangoFechas.length === 2) {
      const [fechaInicio, fechaFin] = rangoFechas;
      fetchData(selectedCliente.id, fechaInicio, fechaFin);
      setShowTables(true);
    }
  }, [selectedCliente, rangoFechas]);

  // Manejar búsqueda al hacer clic en "Buscar"
  const handleSearch = () => {
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }
    if (!rangoFechas || rangoFechas.length !== 2) {
      return message.warning("Por favor, seleccione un rango de fechas.");
    }

    const [fechaInicio, fechaFin] = rangoFechas;
    fetchData(selectedCliente.id, fechaInicio, fechaFin);
    setShowTables(true);
  };

  const handleClienteChange = (cliente) => {
    setSelectedCliente(cliente);
    if (cliente && cliente.id) {
      fetchData(cliente.id);
    } else {
      setVentas([]);
      setPagos([]);
      setTotales({
        totalVentas: 0,
        totalPagos: 0,
        saldoPendiente: 0,
      });
    }
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      name: "Fecha",
      selector: (row) => {
        const fecha = new Date(row.fecha_venta);
        return isValid(fecha) ? (
          <Tooltip title={format(fecha, "dd/MM/yyyy")}>
            <span>{format(fecha, "dd/MM/yyyy")}</span>
          </Tooltip>
        ) : (
          "Fecha no válida"
        );
      },
      sortable: true,
    },
    {
      name: "Nro. Venta",
      selector: (row) => (
        <Tooltip title={row.nroVenta}>
          <span>
            <span>{row.nroVenta}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip title={row.total_con_descuento_formateado}>
          <span>{"$" + row.total_con_descuento_formateado}</span>
        </Tooltip>
      ),
      sortable: true,
    },
  ];

  const columns2 = [
    {
      name: "Fecha",
      selector: (row) => {
        const fecha = new Date(row.fecha_pago);
        return isValid(fecha) ? (
          <Tooltip title={format(fecha, "dd/MM/yyyy")}>
            <span>{format(fecha, "dd/MM/yyyy")}</span>
          </Tooltip>
        ) : (
          "Fecha no válida"
        );
      },
      sortable: true,
    },
    {
      name: "Nro. Pago",
      selector: (row) => (
        <Tooltip title={row.nro_pago}>
          <span>
            <span>{row.nro_pago}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => (
        <Tooltip title={formatNumber(row.monto)}>
          <span>{"$" + formatNumber(row.monto)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Metodo de Pago",
      selector: (row) => (
        <Tooltip title={row.metodo_pago}>
          <span>{row.metodo_pago}</span>
        </Tooltip>
      ),
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <div style={{ padding: "20px" }}>
        <h1>Resumen de Cuenta</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ClienteInput onChangeCliente={setSelectedCliente} />
          <RangePicker
            onChange={(dates, dateStrings) => setRangoFechas(dateStrings)}
          />
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
          <Button onClick={goToResumenCuentaXZona} type="primary">
            Resumen de cuenta por zona
          </Button>
        </div>
        {showTables && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <h2>
                Cliente: {selectedCliente?.nombre} {selectedCliente?.apellido}
              </h2>
              <Button
                onClick={() => setDrawerVisible(true)}
                style={{
                  margin: "20px 0",
                  backgroundColor: "green",
                  color: "white",
                }}
              >
                Agregar Pago
              </Button>
              <Button
                onClick={generatePDF}
                type="primary"
                style={{ marginLeft: "10px" }}
              >
                Descargar Resumen
              </Button>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <DataTable title="Ventas" columns={columns} data={ventas} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <DataTable title="Pagos" columns={columns2} data={pagos} />
            </div>
            <AgregarPagoDrawer
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
              clienteId={selectedCliente.id}
              nextNroPago={nextNroPago}
              onPagoAdded={(nuevoPago) => {
                console.log("Nuevo Pago:", nuevoPago);

                // Volver a cargar los datos
                if (
                  selectedCliente &&
                  selectedCliente.id &&
                  rangoFechas.length === 2
                ) {
                  fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
                }

                // Cerrar el drawer
                setDrawerVisible(false);
              }}
            />
            <Row gutter={16}>
              <Col span={8}>
                <Card style={{ backgroundColor: "#F8D7DA" }}>
                  <Statistic
                    title="Total Ventas"
                    value={totales.totalVentas}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card style={{ backgroundColor: "#D4EDDA " }}>
                  <Statistic
                    title="Total Pagos"
                    value={totales.totalPagos}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Saldo Pendiente"
                    value={totales.saldoPendiente}
                    prefix="$"
                    valueStyle={{
                      color: totales.saldoPendiente > 0 ? "#cf1322" : "#3f8600",
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </MenuLayout>
  );
};

export default ResumenCuenta;
