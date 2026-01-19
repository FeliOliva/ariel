import React, { useState, useEffect } from "react";
import {
  Button,
  DatePicker,
  message,
  Tooltip,
  Drawer,
  InputNumber,
  Modal,
  notification,
  Dropdown,
  Space,
} from "antd";
import axios from "axios";
import ClienteInput from "../components/ClienteInput";
import AgregarPagoDrawer from "../components/AgregarPagoDrawer";
import MenuLayout from "../components/MenuLayout";
import DataTable from "react-data-table-component";
import isValid from "date-fns/isValid";
import { format } from "date-fns";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import CustomPagination from "../components/CustomPagination";
import ArticulosInput from "../components/ArticulosInput";
import DynamicListNC from "../components/DynamicListNC";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  CreditCardOutlined,
  PlusCircleOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "../style/style.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const ResumenCuenta = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerNCVisible, setDrawerNCVisible] = useState(false);
  const [articuloValue, setArticuloValue] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [notaCredito, setNotaCredito] = useState({
    articulos: [],
  });
  const [nextNroPago] = useState("00001");
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [pagoData, setPagoData] = useState(null);
  const [ventaData, setVentaData] = useState(null);
  const [ncData, setNcData] = useState(null);
  const [open, setOpen] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [openNC, setOpenNC] = useState(false);
  const [tipoEdicion, setTipoEdicion] = useState(null);
  const [notasCreditoSeleccionadas, setNotasCreditoSeleccionadas] = useState(
    []
  );
  const [cierreCuenta, setCierreCuenta] = useState(null);
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [drawerCierreVisible, setDrawerCierreVisible] = useState(false);
  const [saldosClientes, setSaldosClientes] = useState([]);
  const [loadingSaldos, setLoadingSaldos] = useState(false);
  const [cierreYaExiste, setCierreYaExiste] = useState(false);
  const [cantidadCierres, setCantidadCierres] = useState(0);
  const [saldoRestanteBackend, setSaldoRestanteBackend] = useState(0);

  // Fecha de corte para el cierre de cuentas (1 de enero de 2026)
  const FECHA_CORTE = "2026-01-01";

  const { confirm } = Modal;
  const parseMonto = (valor) => {
    if (!valor) return 0;

    // Si viene con formato alemán: "1.234,56"
    if (valor.includes(",")) {
      // Quitar puntos (miles) y reemplazar coma por punto
      const normalizado = valor.replace(/\./g, "").replace(",", ".");
      return parseFloat(normalizado);
    }

    return parseFloat(valor);
  };
  const formatMonto = (numero) => {
    if (numero === null || numero === undefined || isNaN(numero)) return "0,00";

    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
  };

  // Función para verificar si la fecha es posterior o igual al 1 de enero de 2026
  const esFechaPosteriorAlCorte = (fecha) => {
    return new Date(fecha) >= new Date(FECHA_CORTE);
  };

  // Función para obtener el cierre de cuenta de un cliente
  const fetchCierreCuenta = async (clienteId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cierre-cuenta/${clienteId}`,
        { params: { fecha_corte: FECHA_CORTE } }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener cierre de cuenta:", error);
      return null;
    }
  };

  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/resumenCliente/${clienteId}`,
        { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }
      );

      const responseData = response.data || {};
      const items = Array.isArray(responseData.items)
        ? responseData.items
        : [];

      setCierreCuenta(responseData.cierre || null);
      setSaldoRestanteBackend(
        typeof responseData.saldo_final === "number"
          ? responseData.saldo_final
          : 0
      );

      const dataFormateada = items
        .map((item, index) => {
          const monto =
            typeof item.monto_numerico === "number"
              ? item.monto_numerico
              : item.total_con_descuento
              ? parseMonto(item.total_con_descuento)
              : item.monto
              ? parseMonto(item.monto)
              : 0;

          const totalNumerico = item.total_con_descuento
            ? parseMonto(item.total_con_descuento)
            : 0;

          return {
            ...item,
            tipoPlano: typeof item.tipo === "string" ? item.tipo : "",
            uniqueKey: `${item.tipo}-${item.id}-${index}`,
            montoNumerico: monto,
            saldoRestante:
              typeof item.saldo_restante === "number"
                ? item.saldo_restante
                : 0,
            montoFormateado: formatMonto(monto),
            totalFormateado: formatMonto(totalNumerico),
          };
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setData(dataFormateada);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      message.error("No se pudo cargar la información del cliente");
    }
  };

  useEffect(() => {
    const inicio = dayjs("2026-01-01").format("YYYY-MM-DD");
    const fin = dayjs().format("YYYY-MM-DD");
    setRangoFechas([inicio, fin]);
  }, []);

  // Polling para actualizar el cierre de cuenta cuando se modifican ventas
  useEffect(() => {
    // Solo hacer polling si hay un cliente seleccionado y la fecha es posterior al corte
    if (!selectedCliente || !rangoFechas || rangoFechas.length !== 2) {
      return;
    }

    const usarCierre = esFechaPosteriorAlCorte(rangoFechas[0]);
    if (!usarCierre) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const nuevoCierre = await fetchCierreCuenta(selectedCliente.id);
        if (nuevoCierre) {
          // Solo actualizar si el saldo cambió para evitar re-renders innecesarios
          setCierreCuenta((prevCierre) => {
            const saldoAnterior = prevCierre ? parseFloat(prevCierre.saldo_cierre) || 0 : 0;
            const saldoNuevo = parseFloat(nuevoCierre.saldo_cierre) || 0;
            
            if (saldoAnterior !== saldoNuevo) {
              // Si el cierre cambió, recargar todos los datos
              setTimeout(() => {
                fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
              }, 100);
              return nuevoCierre;
            }
            return prevCierre;
          });
        }
      } catch (error) {
        console.error("Error al actualizar cierre de cuenta:", error);
      }
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(intervalId);
  }, [selectedCliente, rangoFechas]);
  const handleSearch = async () => {
    if (!selectedCliente) {
      return message.warning("Seleccione un cliente.");
    }
    if (!rangoFechas || rangoFechas.length !== 2) {
      return message.warning("Seleccione un rango de fechas.");
    }
    setLoading(true);
    await fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
  };
  const handleClienteChange = async (cliente) => {
    setSelectedCliente(cliente);
    setData([]);
    if (cliente && rangoFechas && rangoFechas.length === 2) {
      setLoading(true);
      await fetchData(cliente.id, rangoFechas[0], rangoFechas[1]);
    } else {
      setLoading(false);
    }
  };
  const handleOpenEditDrawer = async (id, tipo) => {
    try {
      setTipoEdicion(tipo);

      if (tipo === "Pago") {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getPagoById/${id}`
        );
        const data = response.data[0];

        setPagoData({
          ...data,
          monto: parseFloat(data.monto),
          fecha_pago: data.fecha_pago ? dayjs(data.fecha_pago) : null,
        });
      } else if (tipo === "Venta") {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getVentaByID/${id}`
        );
        const data = response.data; // La respuesta ya es un objeto
        setVentaData({
          ...data,
          fecha_venta: data.fecha ? dayjs(data.fecha) : null, // Convertimos correctamente la fecha
          descuento: data.descuento,
          total_importe: data.total_importe,
          venta_id: data.venta_id, // Aseguramos que el ID se use correctamente
        });
      } else {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getNotaCreditoByID/${id}`
        );
        const data = response.data[0];

        setNcData({
          ...data,
          fecha: data.fecha ? dayjs(data.fecha) : null,
        });
      }

      setOpen(true);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      message.error("No se pudo cargar la información");
    }
  };

  const handleDetallesNC = async (id, tipo) => {
    try {
      if (tipo !== "Nota de Crédito") {
        notification.warning({
          message: "No se puede ver detalles",
          description: "Solo se pueden ver detalles de notas de crédito",
          duration: 2,
        });
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getDetallesNotaCredito/${id}`
      );
      setDetalles(response.data); // Guarda los detalles en el estado
      setOpenNC(true); // Abre el modal
    } catch (error) {
      console.error("Error al obtener los datos de la nota de crédito:", error);
      message.error("No se pudo cargar la información de la nota de crédito");
    }
  };

  const columns = [
    {
      name: "Fecha",
      selector: (row) => {
        const fecha = new Date(row.fecha);
        return isValid(fecha) ? (
          <Tooltip
            title={format(fecha, "dd/MM/yyyy")}
            className={row.estado === 0 ? "strikethrough" : ""}
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
      name: "Tipo",
      selector: (row) => (
        <Tooltip
          title={row.tipo}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span style={row.esSaldoInicial ? { 
            color: "#1890ff", 
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          } : {}}>
            {row.esSaldoInicial && <LockOutlined />}
            {row.tipo ? row.tipo.toUpperCase() : ""}
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => {
        // Para ventas y NC usamos totalFormateado, para pagos montoFormateado
        const texto =
          row.tipo === "Venta" || row.tipo === "Nota de Crédito"
            ? row.totalFormateado
            : row.montoFormateado;

        return (
          <Tooltip
            title={texto}
            className={row.estado === 0 ? "strikethrough" : ""}
          >
            <span>${texto}</span>
          </Tooltip>
        );
      },
      sortable: true,
    },
    {
      name: "Numero",
      selector: (row) => (
        <Tooltip
          title={row.numero}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>{row.numero}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Metodo de pago",
      selector: (row) => (
        <Tooltip
          title={row.metodo_pago || "N/A"}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>
              {row.metodo_pago ? row.metodo_pago.toUpperCase() : "N/A"}
            </span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Vendedor",
      selector: (row) => (
        <Tooltip
          title={row.vendedor_nombre || "N/A"}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>{row.vendedor_nombre ? row.vendedor_nombre : "N/A"}</span>
          </span>
        </Tooltip>
      ),
    },
    {
      name: "Saldo Restante",
      selector: (row) => {
        const saldoFmt = formatMonto(row.saldoRestante);

        return (
          <Tooltip title={`Saldo: ${saldoFmt}`}>
            <span>${saldoFmt}</span>
          </Tooltip>
        );
      },
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        // No mostrar acciones para la fila de Saldo Inicial
        row.esSaldoInicial ? (
          <span style={{ color: "#999", fontSize: "12px" }}>-</span>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Mostrar el botón de editar solo si el tipo es "pago" */}
            <Button
              className="custom-button"
              onClick={() => handleDetallesNC(row.id, row.tipo)}
              icon={<EyeOutlined />}
            />
            <Button
              className="custom-button"
              onClick={() => handleOpenEditDrawer(row.id, row.tipo)}
              icon={<EditOutlined />}
            />
            <Button
              className="custom-button"
              onClick={() => handleDelete(row.id, row.tipo)}
            >
              {<DeleteOutlined />}
            </Button>
          </div>
        )
      ),
    },
  ];
  const handleDelete = async (id, tipo) => {
    if (!selectedCliente || !rangoFechas || rangoFechas.length !== 2) {
      return message.warning(
        "Debe seleccionar un cliente y un rango de fechas."
      );
    }
    let value;
    if (tipo === "Pago") {
      value = "dropPago";
    } else if (tipo === "Venta") {
      value = "dropVenta";
    } else {
      value = "dropNotaCredito";
    }

    confirm({
      title: `¿Está seguro de eliminar esta ${tipo}?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/${value}/${id}`);

          notification.success({
            message: `${tipo} eliminada`,
            description: `La ${tipo} se eliminó exitosamente.`,
            duration: 1,
          });

          // Recargar datos actualizados
          fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
        } catch (error) {
          console.error(`Error al eliminar la ${tipo}:`, error);
          message.error(`No se pudo eliminar la ${tipo}.`);
        }
      },
    });
  };

  const calcularSaldoRestante = () => {
    const valor = Number(saldoRestanteBackend);
    return Number.isNaN(valor) ? 0 : valor;
  };

  const saldoRestante = calcularSaldoRestante();

  // Función para abrir el drawer de cierre masivo y cargar la vista previa
  const handleOpenCierreMasivo = async () => {
    setDrawerCierreVisible(true);
    setLoadingSaldos(true);
    try {
      // Verificar si ya existe un cierre masivo
      const countResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/cierre-masivo/count`,
        { params: { fecha_corte: FECHA_CORTE } }
      );
      const count = countResponse.data.count || 0;
      setCantidadCierres(count);
      setCierreYaExiste(count > 0);

      // Cargar vista previa de saldos
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/cierre-masivo/preview`,
        { params: { fecha_corte: FECHA_CORTE } }
      );
      setSaldosClientes(response.data);
    } catch (error) {
      console.error("Error al obtener vista previa de saldos:", error);
      message.error("No se pudo cargar la vista previa de saldos");
    } finally {
      setLoadingSaldos(false);
    }
  };

  // Función para ejecutar el cierre masivo
  const handleEjecutarCierreMasivo = async () => {
    confirm({
      title: "Confirmar Cierre Masivo de Cuentas",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>¿Está seguro de ejecutar el cierre masivo de todas las cuentas corrientes?</p>
          <p><strong>Total de clientes:</strong> {saldosClientes.length}</p>
          <p><strong>Fecha de corte:</strong> {FECHA_CORTE}</p>
          <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
            Este proceso guardará el saldo actual de cada cliente como saldo inicial para consultas desde el 1 de enero de 2026.
          </p>
        </div>
      ),
      okText: "Sí, ejecutar cierre masivo",
      cancelText: "Cancelar",
      onOk: async () => {
        setLoadingCierre(true);
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/cierre-masivo`, {
            fecha_corte: FECHA_CORTE,
            observaciones: `Cierre masivo ejecutado el ${dayjs().format("DD/MM/YYYY HH:mm")}`,
          });

          notification.success({
            message: "Cierre masivo exitoso",
            description: `Se procesaron ${response.data.data.total_clientes} clientes. Nuevos: ${response.data.data.nuevos}, Actualizados: ${response.data.data.actualizados}`,
            duration: 5,
          });

          setDrawerCierreVisible(false);
          
          // Si hay un cliente seleccionado, recargar sus datos
          if (selectedCliente && rangoFechas.length === 2) {
            await fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
          }
        } catch (error) {
          console.error("Error en cierre masivo:", error);
          notification.error({
            message: "Error",
            description: "No se pudo ejecutar el cierre masivo.",
            duration: 3,
          });
        } finally {
          setLoadingCierre(false);
        }
      },
    });
  };

  // Columnas para la tabla de vista previa del cierre masivo
  const columnsCierre = [
    {
      name: "Cliente",
      selector: (row) => `${row.farmacia || ""} - ${row.nombre} ${row.apellido}`,
      sortable: true,
      grow: 2,
    },
    {
      name: "Zona",
      selector: (row) => row.zona_nombre || "N/A",
      sortable: true,
    },
    {
      name: "Total Ventas",
      selector: (row) => `$${formatMonto(row.total_ventas)}`,
      sortable: true,
      right: true,
    },
    {
      name: "Total Pagos",
      selector: (row) => `$${formatMonto(row.total_pagos)}`,
      sortable: true,
      right: true,
    },
    {
      name: "Total NC",
      selector: (row) => `$${formatMonto(row.total_nc)}`,
      sortable: true,
      right: true,
    },
    {
      name: "Saldo",
      selector: (row) => (
        <span style={{ 
          color: row.saldo > 0 ? "#cf1322" : row.saldo < 0 ? "#389e0d" : "#000",
          fontWeight: "bold"
        }}>
          ${formatMonto(row.saldo)}
        </span>
      ),
      sortable: true,
      right: true,
    },
  ];

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
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
  };

  const handleAddNotaCredito = async () => {
    if (notaCredito.articulos.length > 0) {
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
        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la nota de credito?",
          okText: "Si",
          cancelText: "No",
          onOk: async () => {
            await axios.post(`${process.env.REACT_APP_API_URL}/addNotaCredito`, payLoad);
            notification.success({
              message: "Exito",
              description: "Nota de credito registrada con exito",
              duration: 2,
            });
            setDrawerNCVisible(false);
            setArticuloValue("");
            setCantidad(0);
            setNotaCredito({ articulos: [] });
            fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
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
  const generateNotaCreditoPDF = async () => {
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }

    if (notasCreditoSeleccionadas.length !== 1) {
      return message.warning(
        "Por favor, seleccione una única nota de crédito."
      );
    }

    const notaSeleccionadaId = notasCreditoSeleccionadas[0].id;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/notasCreditoByClienteId/${selectedCliente.id}`
      );
      const notasCredito = response.data;
      // Buscar solo la nota que coincida con el ID seleccionado
      const nota = notasCredito.find(
        (nc) => Number(nc.notaCredito_id) === Number(notaSeleccionadaId)
      );
      if (!nota) {
        return notification.warning({
          message: "Nota no encontrada",
          description: "No se encontró la nota de crédito seleccionada.",
          duration: 1,
        });
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Nota de Crédito", 90, 20);

      doc.setFontSize(14);
      doc.text(
        `Cliente: ${selectedCliente.farmacia} ${selectedCliente.nombre} ${selectedCliente.apellido}`,
        14,
        30
      );

      let yPos = 40;

      doc.setFontSize(14);
      doc.text(`Nota de Crédito Nº ${nota.nroNC}`, 14, yPos);
      doc.text(
        `Fecha: ${new Date(nota.fecha).toLocaleDateString("es-ES")}`,
        150,
        yPos
      );

      yPos += 10;
      doc.setFontSize(12);

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

      yPos = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(
        `Total: $${nota.total.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        14,
        yPos
      );

      doc.save(`nota_credito_${nota.nroNC}.pdf`);
    } catch (error) {
      notification.warning({
        message: "Error al obtener la nota",
        description: "Verificá que el cliente tenga notas disponibles",
        duration: 1,
      });
    }
  };

  const generateResumenCuentaPDF = () => {
    const doc = new jsPDF();

    const filteredData = data
      .filter((row) => row.estado === 1)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    doc.setFontSize(16);
    doc.text("Resumen de Cuenta", 80, 20);

    doc.setFontSize(14);
    doc.text(`Farmacia: ${selectedCliente.farmacia}`, 14, 30);
    doc.text(
      `Cliente: ${selectedCliente.nombre} ${selectedCliente.apellido}`,
      14,
      40
    );
    doc.text(`Rango de Fechas: ${rangoFechas[0]} - ${rangoFechas[1]}`, 14, 50);

    let yPos = 60;

    if (filteredData.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [
          [
            "Fecha",
            "Tipo",
            "Total",
            "Número",
            "Método de Pago",
            "Saldo Restante",
          ],
        ],
        body: filteredData.map((row) => {
          const monto = row.montoNumerico ?? 0;
          const saldoFila = row.saldoRestante ?? 0;
          return [
            new Date(row.fecha).toLocaleDateString("es-AR"),
            row.tipo,
            `$${formatMonto(monto)}`,
            row.numero || "-",
            row.metodo_pago ? row.metodo_pago : "N/A",
            `$${formatMonto(saldoFila)}`,
          ];
        }),
        theme: "grid",
        styles: { fontSize: 10 },
        // Resaltar la fila de Saldo Inicial
        didParseCell: function(data) {
          if (data.row.raw && data.row.raw[1] === "Saldo Inicial") {
            data.cell.styles.fillColor = [230, 247, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      yPos += 10;
      doc.setFontSize(12);
      doc.text(
        "No hay movimientos en el rango de fechas seleccionado.",
        14,
        yPos
      );
      yPos += 10;
    }

    doc.setFontSize(14);
    doc.text(
      `Saldo Restante Final: $${formatMonto(saldoRestanteBackend)}`,
      14,
      yPos
    );

    doc.save(`ResumenCuenta_${selectedCliente.nombre}.pdf`);
  };

  const navigate = useNavigate();

  const goToResumenCuentaXZona = () => {
    navigate("/ResumenCuentaXZona");
  };
  const goToResumenZona = () => {
    navigate("/ResumenZonas");
  };
  const goToResumenCuentaXVendedor = () => {
    navigate("/ResumenCuentaXVendedor");
  };
  const items = [
    {
      label: (
        <a href="#resumen-zonas" onClick={goToResumenZona}>
          Resumen Total por zonas
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a href="#resumen-clientes-zona" onClick={goToResumenCuentaXZona}>
          Resumen de clientes por zona
        </a>
      ),
      key: "1",
    },
    {
      label: (
        <a href="#resumen-vendedor" onClick={goToResumenCuentaXVendedor}>
          Resumen por vendendor
        </a>
      ),
      key: "2",
    },
  ];
  const pdfItems = [
    {
      label: (
        <a href="#generar-nc" onClick={generateNotaCreditoPDF}>
          <FilePdfOutlined /> Generar Nota de Crédito PDF
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a href="#generar-resumen" onClick={generateResumenCuentaPDF}>
          <FileTextOutlined /> Generar Resumen de Cuenta PDF
        </a>
      ),
      key: "1",
    },
  ];
  const handleUpdate = async () => {
    try {
      let payload = {};
      let url = "";
      if (tipoEdicion === "Pago") {
        payload = {
          monto: pagoData.monto,
          fecha_pago: dayjs(pagoData.fecha_pago).format("DD/MM/YYYY"),
          ID: pagoData.id,
        };
        url = `${process.env.REACT_APP_API_URL}/updatePago`;
      } else if (tipoEdicion === "Venta") {
        payload = {
          fecha_venta: dayjs(ventaData.fecha_venta).format("DD/MM/YYYY"),
          total: ventaData.total_importe,
          descuento: ventaData.descuento,
          ID: ventaData.venta_id,
        };
        url = `${process.env.REACT_APP_API_URL}/updateVenta`;
      } else if (tipoEdicion === "Nota de Crédito") {
        payload = {
          fecha: dayjs(ncData.fecha).format("DD/MM/YYYY"),
          ID: ncData.id,
        };
        url = `${process.env.REACT_APP_API_URL}/updateNotaCredito`;
      }

      await axios.put(url, payload);
      message.success(`${tipoEdicion} actualizado con éxito`);
      fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
      setOpen(false);
    } catch (error) {
      console.error(`Error al actualizar ${tipoEdicion}:`, error);
      message.error(`No se pudo actualizar ${tipoEdicion}`);
    }
  };

  const columns2 = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip
          title={`${row.codigo_producto} ${row.articulo_nombre} ${row.mediciones} ${row.linea_nombre}`}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            {`${row.codigo_producto} ${row.articulo_nombre} ${row.mediciones} ${row.linea_nombre}`}
          </span>
        </Tooltip>
      ),
      width: "60%", // Asigna más espacio a esta columna
    },
    {
      name: "Cantidad",
      selector: (row) => (
        <Tooltip
          title={row.cantidad}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{row.cantidad}</span>
        </Tooltip>
      ),
      width: "10%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
    {
      name: "Precio",
      selector: (row) => (
        <Tooltip
          title={row.precio_monotributista}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{Math.ceil(parseFloat(row.precio_monotributista) || 0)}</span>
        </Tooltip>
      ),
      width: "15%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
    {
      name: "Subtotal",
      selector: (row) => (
        <Tooltip
          title={row.subTotal}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{row.subTotal}</span>
        </Tooltip>
      ),
      width: "15%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
  ];

  return (
    <MenuLayout>
      <div style={{ padding: "20px" }}>
        <h1>Resumen de Cuenta</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <ClienteInput onChangeCliente={handleClienteChange} />
          <RangePicker
            value={
              rangoFechas.length === 2
                ? [dayjs(rangoFechas[0]), dayjs(rangoFechas[1])]
                : null
            }
            onChange={(dates, dateStrings) => {
              if (!dates) {
                setRangoFechas([]); // Limpiamos el estado si se borran las fechas
              } else {
                setRangoFechas(dateStrings);
              }
            }}
            allowClear
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
              href="#resumenes"
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
          <Tooltip title="Cierre Masivo - Guardar saldos de todas las cuentas para 2026">
            <Button
              type="default"
              danger
              icon={<LockOutlined />}
              onClick={handleOpenCierreMasivo}
              loading={loadingCierre}
            >
              Cierre Masivo de Cuentas
            </Button>
          </Tooltip>
        </div>

        {loading && (
          <>
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <Space>
                <Tooltip title="Agregar Pago">
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    onClick={() => setDrawerVisible(true)}
                  >
                    Agregar Pago
                  </Button>
                </Tooltip>

                <Tooltip title="Agregar Nota de Crédito">
                  <Button
                    type="default"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setDrawerNCVisible(true)}
                  >
                    Agregar Nota de Crédito
                  </Button>
                </Tooltip>
              </Space>

              <Dropdown menu={{ items: pdfItems }}>
                <Button type="primary">
                  <Space>
                    Generar PDF
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </Space>

            <DataTable
              columns={columns}
              data={data}
              pagination
              paginationComponent={CustomPagination}
              customStyles={{
                headCells: { style: customHeaderStyles },
                cells: { style: customCellsStyles },
              }}
              keyField="uniqueKey" // Cambiar esto
              selectableRows // 👉 activa los checkboxes
              selectableRowDisabled={(row) =>
                row.tipoPlano !== "Nota de Crédito"
              }
              onSelectedRowsChange={({ selectedRows }) => {
                const notasSeleccionadas = selectedRows.filter(
                  (row) => row.tipoPlano === "Nota de Crédito"
                );
                setNotasCreditoSeleccionadas(notasSeleccionadas);
              }}
            />

            <h2
              style={{
                marginTop: "20px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {(() => {
                const mostrado =
                  Math.abs(saldoRestante) < 1 ? 0 : saldoRestante;
                return `Saldo Restante: $${mostrado.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              })()}
            </h2>
          </>
        )}
        <Modal
          title="Detalles de la Nota de Crédito"
          open={openNC}
          onCancel={() => setOpenNC(false)}
          footer={null}
          width={900}
        >
          <DataTable
            columns={columns2}
            data={detalles}
            keyField="uniqueId"
            pagination={false}
          />
        </Modal>
        <Drawer
          title={`Editar ${tipoEdicion}`}
          open={open}
          onClose={() => setOpen(false)}
          width={500}
        >
          {tipoEdicion === "Pago" && (
            <>
              <Tooltip title="Monto">
                <InputNumber
                  min={0}
                  style={{ marginTop: "10px", width: "100%" }}
                  value={pagoData?.monto}
                  onChange={(value) =>
                    setPagoData({ ...pagoData, monto: value })
                  }
                />
              </Tooltip>
              <Tooltip title="Fecha de pago">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={
                    pagoData?.fecha_pago ? dayjs(pagoData.fecha_pago) : null
                  }
                  onChange={(date) =>
                    setPagoData({ ...pagoData, fecha_pago: date })
                  }
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}

          {tipoEdicion === "Venta" && (
            <>
              <Tooltip title="Fecha de venta">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={
                    ventaData?.fecha_venta ? dayjs(ventaData.fecha_venta) : null
                  }
                  onChange={(date) =>
                    setVentaData({ ...ventaData, fecha_venta: date })
                  }
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}

          {tipoEdicion === "Nota de Crédito" && (
            <>
              <Tooltip title="Fecha">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={ncData?.fecha ? dayjs(ncData.fecha) : null}
                  onChange={(date) => setNcData({ ...ncData, fecha: date })}
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}
        </Drawer>

        <Drawer
          title="Agregar Nota de Crédito"
          open={drawerNCVisible}
          onClose={() => setDrawerNCVisible(false)}
          width={500}
        >
          <ArticulosInput
            value={articuloValue}
            onChangeArticulo={handleArticuloChange}
            onInputChange={setArticuloValue}
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
            Registrar Nota de Crédito
          </Button>
        </Drawer>

        <AgregarPagoDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          clienteId={selectedCliente?.id}
          nextNroPago={nextNroPago}
          saldoRestante={saldoRestante}
          onPagoAdded={async (nuevoPago) => {
            await fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
            setDrawerVisible(false);
          }}
        />

        {/* Drawer para Cierre Masivo de Cuentas */}
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LockOutlined style={{ color: "#ff4d4f" }} />
              <span>Cierre Masivo de Cuentas Corrientes</span>
            </div>
          }
          open={drawerCierreVisible}
          onClose={() => setDrawerCierreVisible(false)}
          width={900}
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Total clientes: </strong>{saldosClientes.length}
                <span style={{ marginLeft: "20px" }}>
                  <strong>Saldo total: </strong>
                  ${formatMonto(saldosClientes.reduce((acc, c) => acc + (parseFloat(c.saldo) || 0), 0))}
                </span>
              </div>
              <Space>
                <Button onClick={() => setDrawerCierreVisible(false)}>
                  {cierreYaExiste ? "Cerrar" : "Cancelar"}
                </Button>
                {!cierreYaExiste && (
                  <Button
                    type="primary"
                    danger
                    icon={<LockOutlined />}
                    onClick={handleEjecutarCierreMasivo}
                    loading={loadingCierre}
                    disabled={saldosClientes.length === 0}
                  >
                    Ejecutar Cierre Masivo
                  </Button>
                )}
              </Space>
            </div>
          }
        >
          {cierreYaExiste ? (
            <div style={{ marginBottom: "15px", padding: "15px", backgroundColor: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: "6px" }}>
              <p style={{ margin: 0, color: "#52c41a", fontWeight: "bold", fontSize: "14px" }}>
                ✓ Cierre masivo ya realizado
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#333" }}>
                Ya existe un cierre de cuentas para la fecha de corte <strong>{FECHA_CORTE}</strong>.
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                Se encontraron <strong>{cantidadCierres}</strong> cierres registrados. 
                Los saldos mostrados abajo son los que se guardaron en el cierre.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fff7e6", border: "1px solid #ffd591", borderRadius: "6px" }}>
              <p style={{ margin: 0 }}>
                <strong>Fecha de corte:</strong> {FECHA_CORTE}
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                Este proceso guardará el saldo actual de cada cliente. Las consultas de resumen de cuenta 
                desde el 1 de enero de 2026 usarán estos saldos como punto de partida.
              </p>
            </div>
          )}

          {loadingSaldos ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <span>Cargando saldos de clientes...</span>
            </div>
          ) : (
            <DataTable
              columns={columnsCierre}
              data={saldosClientes}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={[15, 30, 50, 100]}
              customStyles={{
                headCells: { style: customHeaderStyles },
                cells: { style: customCellsStyles },
              }}
              highlightOnHover
              striped
            />
          )}
        </Drawer>
      </div>
    </MenuLayout>
  );
};

export default ResumenCuenta;
