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

  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
      console.log("params", params);

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
        </div>
        {showTables && (
          <>
            <h2>
              Cliente: {selectedCliente?.nombre} {selectedCliente?.apellido}
            </h2>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Ventas"
                    value={totales.totalVentas}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
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
            <Button
              type="primary"
              onClick={() => setDrawerVisible(true)}
              style={{ margin: "20px 0" }}
            >
              Agregar Pago
            </Button>
            <DataTable title="Ventas" columns={columns} data={ventas} />
            <DataTable title="Pagos" columns={columns2} data={pagos} />
            <AgregarPagoDrawer
              visible={drawerVisible}
              onClose={() => setDrawerVisible(false)}
              clienteId={selectedCliente.id}
              nextNroPago={nextNroPago}
              onPagoAdded={(nuevoPago) => {
                console.log("Nuevo Pago:", nuevoPago);
                message.success("Pago agregado exitosamente");

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
          </>
        )}
      </div>
    </MenuLayout>
  );
};

export default ResumenCuenta;
