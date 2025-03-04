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
  Dropdown,
  Space,
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
  EyeOutlined,
  DownOutlined,
} from "@ant-design/icons";
import "../style/style.css";

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
  const [expandedRow, setExpandedRow] = useState(null);
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
      console.log("no hay");
      notification.warning({
        message: "No existen notas de credito",
        description: "Para el cliente seleccionado",
        duration: 1,
      });
      return;
    }
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }

    // Filtrar solo notas de crédito activas
    const notasCreditoActivas = notasCredito.filter(
      (nota) => nota.estado === 1
    );

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Resumen de Notas de Crédito", 80, 20);

    // Agregar información del cliente
    doc.setFontSize(14);
    doc.text(
      `Cliente: ${selectedCliente.farmacia} ${selectedCliente.nombre} ${selectedCliente.apellido}`,
      14,
      30
    );

    let yPos = 40; // Posición inicial

    notasCreditoActivas.forEach((nota, index) => {
      if (yPos > 250) {
        // Verifica si hay espacio suficiente en la página
        doc.addPage();
        yPos = 20; // Reinicia la posición en la nueva página
      }

      doc.setFontSize(14);
      doc.text(`Nota de Crédito Nº ${nota.nroNC}`, 14, yPos);
      doc.text(
        `Fecha: ${new Date(nota.fecha).toLocaleDateString("es-ES")}`,
        150,
        yPos
      );

      yPos += 10;
      doc.setFontSize(12);

      // Tabla de detalles de la nota
      const tableData = nota.detalles.map((detalle) => [
        detalle.articulo_nombre,
        detalle.cantidad,
        `$${detalle.precio.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        `$${detalle.subTotal.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["Artículo", "Cantidad", "Precio", "Subtotal"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
      });

      yPos = doc.lastAutoTable.finalY + 10; // Nueva posición después de la tabla
      doc.setFontSize(14);
      doc.text(`Total: $${nota.total}`, 14, yPos);
      yPos += 15;
    });

    // Guardar el PDF con el nombre adecuado
    doc.save(`notas_credito_${selectedCliente.nombre}.pdf`);
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

  const toggleDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Renderizar los detalles solo si la fila está expandida
  const renderDetalles = (row) => {
    if (expandedRow !== row.notaCredito_id) return null;

    return (
      <div className="detalle-container">
        <table>
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {row.detalles.map((detalle, index) => (
              <tr key={index}>
                <td>{detalle.articulo_nombre}</td>
                <td>{detalle.cantidad}</td>
                <td>{"$" + formatNumber(detalle.precio)}</td>
                <td>{"$" + formatNumber(detalle.subTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const navigate = useNavigate();

  const goToResumenCuentaXZona = () => {
    navigate("/ResumenCuentaXZona");
  };
  const goToResumenZona = () => {
    navigate("/ResumenZonas");
  };

  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const params = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
      console.log(fechaInicio, fechaFin);
      // Ejecutar las solicitudes en paralelo con manejo de errores
      const [ventasResponse, pagosResponse, totalNotasCreditoResponse] =
        await Promise.allSettled([
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

      // Manejar respuesta de ventas y filtrar solo las activas (estado === 1)
      const ventasData =
        ventasResponse.status === "fulfilled"
          ? ventasResponse.value.data.filter((venta) => venta.estado === 1) ||
            []
          : [];

      // Manejar respuesta de pagos
      const pagosData =
        pagosResponse.status === "fulfilled"
          ? pagosResponse.value.data || []
          : [];

      // Manejar respuesta de notas de crédito
      let notasCreditoData = [];
      if (totalNotasCreditoResponse.status === "fulfilled") {
        if (Array.isArray(totalNotasCreditoResponse.value.data)) {
          notasCreditoData = totalNotasCreditoResponse.value.data;
        }
      } else {
        console.warn("No se encontraron notas de crédito para este cliente.");
      }

      // Filtrar notas de crédito activas (estado === 1)
      const notasCreditoActivas = notasCreditoData.filter(
        (nota) => nota.estado === 1
      );

      // Calcular total de notas de crédito activas
      const totalNotasCreditoActivas = notasCreditoActivas.reduce(
        (sum, nota) => sum + (parseFloat(nota.total) || 0),
        0
      );
      console.log("ventas", ventasData);
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
          totalVentas,
          totalPagos,
          totalNC: totalNotasCreditoActivas,
          saldoPendiente,
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
      name: "Nro. Nota de Crédito",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nroNC}
        >
          <span>{row.nroNC}</span>
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
      name: "Detalles",
      cell: (row) => (
        <Tooltip title="Ver detalles">
          <Button onClick={() => toggleDetails(row.notaCredito_id)}>
            <EyeOutlined />
          </Button>
        </Tooltip>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleToggleState(row.notaCredito_id, row.estado)}
        >
          {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
        </Button>
      ),
    },
  ];

  const items = [
    {
      label: (
        <a target="_blank" onClick={goToResumenZona}>
          Resumen Total por zonas
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" onClick={goToResumenCuentaXZona}>
          Resumen de clientes por zona
        </a>
      ),
      key: "1",
    },
  ];
  const items2 = [
    {
      label: (
        <a target="_blank" onClick={generateNotaCreditoPDF}>
          Generar Nota de Credito
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" onClick={generatePDF}>
          Descargar Resumen
        </a>
      ),
      key: "1",
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
          <Dropdown
            menu={{
              items,
            }}
          >
            <a
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "5px",
                backgroundColor: "green",
                color: "white",
                textDecoration: "none",
              }}
              onClick={(e) => e.preventDefault()}
            >
              <Space>
                Resumenes
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
        {showTables && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <h2>
                Cliente: {selectedCliente?.nombre} {selectedCliente?.apellido}
              </h2>
              <Dropdown
                menu={{
                  items: items2,
                }}
              >
                <a
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    fontSize: "15px",
                    borderRadius: "5px",
                    padding: "6px 10px",
                    width: "fit-content",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <Space>
                    Descargas
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
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
              ;
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
                expandableRows
                expandableRowExpanded={(row) =>
                  expandedRow === row.notaCredito_id
                }
                expandableRowsComponent={({ data }) => renderDetalles(data)}
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
