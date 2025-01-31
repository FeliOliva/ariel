import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Button,
  message,
  DatePicker,
  Drawer,
  InputNumber,
  Modal,
  notification,
} from "antd";
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
import ArticulosInput from "../components/ArticulosInput";
import DynamicListNC from "../components/DynamicListNC";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const ResumenCuenta = () => {
  const [ventas, setVentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [notasCredito, setNotasCredito] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerNCVisible, setDrawerNCVisible] = useState(false);
  const [nextNroPago, setNextNroPago] = useState("00001");
  const [rangoFechas, setRangoFechas] = useState([]);
  const [showTables, setShowTables] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [articuloValue, setArticuloValue] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [notaCredito, setNotaCredito] = useState({
    articulos: [],
  });
  const { RangePicker } = DatePicker;
  const [totales, setTotales] = useState({
    totalVentas: 0,
    totalPagos: 0,
    saldoPendiente: 0,
  });
  const { confirm } = Modal;

  const generateNotaCreditoPDF = () => {
    if (!notasCredito || notasCredito.length === 0) {
      console.error("No hay notas de crédito disponibles.");
      return;
    }
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }

    // Filtrar solo notas de crédito activas
    const notasCreditoActivas = notasCredito.filter(
      (nota) => nota.estado === 1
    );

    if (notasCreditoActivas.length === 0) {
      return message.warning("No hay notas de crédito activas para imprimir.");
    }

    const doc = new jsPDF();
    const nota = notasCreditoActivas[0]; // Tomar la primera nota activa

    doc.setFontSize(14);
    doc.text(`Cliente: ${selectedCliente.nombre}`, 14, 20);
    doc.text(
      `Fecha: ${new Date(nota.fecha).toLocaleDateString("es-ES")}`,
      150,
      20
    );

    doc.setFontSize(16);
    doc.text("Nota de Crédito", 80, 35);

    const tableData = [
      [
        nota.nroNC,
        `$${parseFloat(nota.total).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ],
    ];

    doc.autoTable({
      startY: 45,
      head: [["Nro NC", "Total"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 12 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } },
    });

    doc.save(`nota_credito_${nota.nroNC}.pdf`);
  };

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

    // Tabla de Notas de Crédito Activas
    const notasCreditoActivas = notasCredito.filter(
      (nota) => nota.estado === 1
    );
    if (notasCreditoActivas.length > 0) {
      const notasY = doc.lastAutoTable.finalY + 10;
      doc.text("Notas de Crédito", 10, notasY);
      const notasCreditoTable = notasCreditoActivas.map((nota) => [
        format(new Date(nota.fecha), "dd/MM/yyyy"),
        nota.nroNC,
        `$${parseFloat(nota.total).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ]);
      doc.autoTable({
        head: [["Fecha", "Nro. NC", "Total"]],
        body: notasCreditoTable,
        startY: notasY + 5,
      });
    }

    // Totales
    const totalesY = doc.lastAutoTable.finalY + 10;
    doc.text("Totales", 10, totalesY);
    doc.text(`Total Ventas: $${totales.totalVentas}`, 10, totalesY + 10);
    doc.text(`Total Pagos: $${totales.totalPagos}`, 10, totalesY + 20);
    doc.text(`Total Notas de Crédito: $${totales.totalNC}`, 10, totalesY + 30);
    doc.text(`Saldo Pendiente: $${totales.saldoPendiente}`, 10, totalesY + 40);

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

      const [ventasResponse, pagosResponse, totalNotasCreditoResponse] =
        await Promise.all([
          axios.get(`http://localhost:3001/ventasxclientexfecha/${clienteId}`, {
            params,
          }),
          axios.get(`http://localhost:3001/getPagosByClienteId/${clienteId}`, {
            params,
          }),
          axios.get(
            `http://localhost:3001/notasCreditoByClienteId/${clienteId}`
          ),
        ]);

      // Verifica que totalNotasCreditoResponse.data sea un array
      const notasCreditoData = Array.isArray(totalNotasCreditoResponse.data)
        ? totalNotasCreditoResponse.data
        : [];
      console.log("notas credito data", notasCreditoData);
      // Filtrar notas activas (estado = 1)
      const notasCreditoActivas = notasCreditoData.filter(
        (nota) => nota.estado === 1
      );
      console.log("notas credito activas", notasCreditoActivas);

      // Calcular total de notas de crédito activas
      const totalNotasCreditoActivas = notasCreditoActivas.reduce(
        (sum, nota) => sum + (parseFloat(nota.total) || 0),
        0
      );
      console.log("total notas credito activas", totalNotasCreditoActivas);

      const ventasData = ventasResponse.data || [];
      const pagosData = pagosResponse.data || [];

      setVentas(ventasData);
      setPagos(pagosData);
      setNotasCredito(notasCreditoData);

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

        const saldoPendiente =
          totalVentas - totalPagos - totalNotasCreditoActivas;

        setTotales({
          totalVentas: totalVentas,
          totalPagos: totalPagos,
          totalNC: totalNotasCreditoActivas,
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
  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
    console.log(selectedArticulo);
    console.log(articulo);
  };

  const handleAddArticulo = () => {
    if (selectedArticulo && cantidad > 0) {
      //ESTO ERA PARA VALIDAR QUE NO ENTRE MAS DE UN ARTICULO
      // const articuloExiste = venta.articulos.some(
      //   (articulo) => articulo.id === selectedArticulo.id
      // );

      // if (articuloExiste) {
      //   Modal.warning({
      //     title: "Advertencia",
      //     content: "Este artículo ya fue agregado en la venta.",
      //     icon: <ExclamationCircleOutlined />,
      //   });
      //   return;
      // }

      const uniqueId = `${selectedArticulo.id}-${Date.now()}`; // Generación del ID único
      setNotaCredito((prev) => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            ...selectedArticulo,
            quantity: cantidad,
            price: selectedArticulo.precio_monotributista,
            label:
              selectedArticulo.nombre +
              " - " +
              selectedArticulo.linea_nombre +
              " - " +
              selectedArticulo.sublinea_nombre,
            value: selectedArticulo.id,
            uniqueId,
            isGift: false,
          },
        ],
      }));
      console.log(notaCredito);
      setSelectedArticulo(null);
      setCantidad(0);
      setArticuloValue("");
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Seleccione un articulo y una cantidad valida",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  const handleDeleteArticulo = (uniqueId) => {
    setNotaCredito((prev) => ({
      ...prev,
      articulos: prev.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      ),
    }));
  };

  const handleEditPrecio = (uniqueId, newPrice) => {
    const updatedArticulos = notaCredito.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, precio_monotributista: newPrice, price: newPrice }
        : item
    );
    setNotaCredito((prevNC) => ({ ...prevNC, articulos: updatedArticulos }));
    console.log("Artículos actualizados: ", updatedArticulos);
  };

  const handleAddNotaCredito = async () => {
    console.log("nota credito", notaCredito);
    console.log("cliente", selectedCliente.nombre);
    console.log(notaCredito.articulos.length);
    if (notaCredito.articulos.length > 0) {
      console.log("hola");
      try {
        const payLoad = {
          cliente_id: selectedCliente.id,
          detalles: notaCredito.articulos.map((articulo) => ({
            articulo_id: articulo.id, // Usamos el ID del artículo
            cantidad: articulo.quantity,
            precio: articulo.precio_monotributista
              ? articulo.precio_monotributista
              : articulo.price,
          })),
        };
        console.log("nota cred data", payLoad);
        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la nota de credito?",
          okText: "Si",
          cancelText: "No",
          onOk: async () => {
            await axios.post("http://localhost:3001/addNotaCredito", payLoad);
            notification.success({
              message: "Exito",
              description: "Nota de credito registrada con exito",
              duration: 2,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
        });
      } catch (error) {
        console.error("Error al enviar la nota de credito:", error);
        alert("Error al registrar la nota de credito");
      }
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, complete todos los campos",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Esta seguro de cancelar esta nota de credito?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropNotaCredito/${id}`);
            notification.success({
              message: "La nota de credito se ha desactivado",
              description: "La nota de credito se ha desactivado exitosamente",
              duration: 1,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        });
      } else {
        confirm({
          title: "¿Esta seguro de activar esta nota de credito?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upNotaCredito/${id}`);
            notification.success({
              message: "Nota de credito activada",
              description: "El Nota de credito se activo exitosamente",
              duration: 1,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        });
      }
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the article:`,
        error
      );
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

  const columns3 = [
    {
      name: "Fecha",
      selector: (row) => {
        const fecha = new Date(row.fecha);
        return isValid(fecha) ? (
          <Tooltip
            className={row.estado === 0 ? "strikethrough" : ""}
            title={format(fecha, "dd/MM/yyyy")}
          >
            <span>{format(fecha, "dd/MM/yyyy")}</span>
          </Tooltip>
        ) : (
          "Fecha no válida"
        );
      },
      sortable: true,
    },
    {
      name: "Nro. Nota de Credito",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nroNC}
        >
          <span>
            <span>{row.nroNC}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={formatNumber(row.total)}
        >
          <span>{"$" + formatNumber(row.total)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
        </Button>
      ),
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
                onClick={() => setDrawerNCVisible(true)}
                style={{
                  margin: "20px 0",
                  backgroundColor: "green",
                  color: "white",
                }}
              >
                Agregar Nota Credito
              </Button>
              <Button
                onClick={generateNotaCreditoPDF}
                type="primary"
                style={{
                  marginLeft: "10px",
                }}
              >
                Generar nota credito
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
            <div style={{ marginBottom: "20px" }}>
              <DataTable
                title="Notas de credito"
                columns={columns3}
                data={notasCredito}
              />
            </div>
            <Drawer
              title="Agregar Nota de Credito"
              open={drawerNCVisible}
              onClose={() => setDrawerNCVisible(false)}
              width={500}
            >
              <ArticulosInput
                value={articuloValue}
                onChangeArticulo={handleArticuloChange}
                onInputChange={setArticuloValue} // Update input value
              />
              <InputNumber
                min={0}
                onChange={(value) => setCantidad(value)}
                style={{ marginTop: "10px" }}
                value={cantidad}
              />
              <Button
                className="custom-button"
                onClick={handleAddArticulo}
                style={{ marginTop: 10 }}
              >
                Agregar Artículo
              </Button>
              <DynamicListNC
                items={notaCredito.articulos}
                onDelete={handleDeleteArticulo}
                onEdit={handleEditPrecio}
              />
              <Button onClick={handleAddNotaCredito} type="primary">
                Registrar Nota de Credito
              </Button>
            </Drawer>
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
              <Col span={5}>
                <Card style={{ backgroundColor: "#F8D7DA" }}>
                  <Statistic
                    title="Total Ventas"
                    value={totales.totalVentas}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card style={{ backgroundColor: "#D4EDDA " }}>
                  <Statistic
                    title="Total Pagos"
                    value={totales.totalPagos}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={5}>
                <Card>
                  <Statistic
                    title="Total Notas Credito"
                    value={totales.totalNC}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={5}>
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
