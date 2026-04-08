import React, { useEffect, useState, useMemo } from "react";
import {
  DatePicker,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Table,
  message,
  Spin,
  Select,
  Tooltip,
  Checkbox,
  Space,
  Typography,
} from "antd";
import { FilePdfOutlined, BarChartOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
import LineaInput from "../components/LineaInput";
import MenuLayout from "../components/MenuLayout";
import imageUrl from "../logoRenacer.png";

const { Title } = Typography;
const { RangePicker } = DatePicker;

function InfoHelp({ text }) {
  return (
    <Tooltip
      title={<div style={{ maxWidth: 380, whiteSpace: "pre-wrap" }}>{text}</div>}
      placement="topLeft"
    >
      <InfoCircleOutlined style={{ marginLeft: 6, color: "#1890ff", cursor: "help" }} />
    </Tooltip>
  );
}

export default function EstadisticasDashboard({
  embedded = false,
  sharedDateRange = null,
}) {
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [evolucionData, setEvolucionData] = useState([]);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [rankingGeneral, setRankingGeneral] = useState([]);
  const [rankingGeneralLoading, setRankingGeneralLoading] = useState(false);
  const [rankingPeriodo, setRankingPeriodo] = useState("mensual");
  const [rankingDateRange, setRankingDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [rankingTotales, setRankingTotales] = useState({
    totalProductos: 0,
    totalUnidades: 0,
    totalSubtotal: 0,
  });

  const [evoLineVisibility, setEvoLineVisibility] = useState({
    ganancia: true,
    total_vendido: true,
    diferencia_promedio: false,
    precio_promedio: false,
    costo_promedio: false,
    cantidad_vendida: false,
  });

  useEffect(() => {
    let isMounted = true;
    const loadLogo = async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (isMounted) {
          setLogoDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    };

    loadLogo();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeLinea = (linea) => {
    setSelectedLinea(linea);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const getPresetRange = (periodo) => {
    const hoy = dayjs();
    switch (periodo) {
      case "diario":
        return [hoy.startOf("day"), hoy.endOf("day")];
      case "semanal":
        return [hoy.subtract(6, "day").startOf("day"), hoy.endOf("day")];
      case "mensual":
        return [hoy.startOf("month"), hoy.endOf("day")];
      case "cuatrimestral":
        return [hoy.subtract(3, "month").startOf("month"), hoy.endOf("day")];
      default:
        return [hoy.startOf("month"), hoy.endOf("day")];
    }
  };

  const fetchRankingGeneral = async (rangeOverride = null) => {
    const sourceRange = Array.isArray(rangeOverride)
      ? rangeOverride
      : Array.isArray(rankingDateRange)
      ? rankingDateRange
      : [];
    const [fechaInicioRaw, fechaFinRaw] = sourceRange;
    if (!fechaInicioRaw || !fechaFinRaw) return;

    setRankingGeneralLoading(true);
    try {
      const fecha_inicio = fechaInicioRaw.format("YYYY-MM-DD");
      const fecha_fin = fechaFinRaw.format("YYYY-MM-DD");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getRankingProductosVendidosGeneral`,
        {
          params: { fecha_inicio, fecha_fin, limit: 200 },
        }
      );

      const productos = response.data?.productos || [];
      setRankingGeneral(productos);

      const totalUnidades = productos.reduce(
        (acc, item) => acc + (parseFloat(item.cantidad_vendida) || 0),
        0
      );
      const totalSubtotal = productos.reduce(
        (acc, item) => acc + (parseFloat(item.subtotal) || 0),
        0
      );

      setRankingTotales({
        totalProductos: productos.length,
        totalUnidades: Math.ceil(totalUnidades),
        totalSubtotal: Math.ceil(totalSubtotal),
      });
    } catch (error) {
      console.error("Error fetching productos vendidos general:", error);
      message.error("Error al cargar productos vendidos");
    } finally {
      setRankingGeneralLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    if (!selectedLinea || !dateRange || dateRange.length !== 2) {
      message.warning("Por favor selecciona una línea y un rango de fechas");
      return;
    }

    setLoading(true);
    try {
      const fechaInicio = dateRange[0].format("YYYY-MM-DD");
      const fechaFin = dateRange[1].format("YYYY-MM-DD");

      const [productosRes, evolucionRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/getArticulosVendidosPorLinea?linea_id=${selectedLinea.id}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/getEvolucionGananciaPorLinea?linea_id=${selectedLinea.id}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
        ),
      ]);

      const { productos } = productosRes.data;
      setEstadisticas(productos);
      
      const { evolucion } = evolucionRes.data;
      setEvolucionData(evolucion);
      
      message.success("Estadísticas cargadas correctamente");
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
      message.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingGeneral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!embedded || !sharedDateRange || sharedDateRange.length !== 2) return;
    const [a, b] = sharedDateRange;
    if (!a || !b) return;
    setRankingDateRange([a, b]);
    setRankingPeriodo("personalizado");
    setDateRange([a, b]);
    fetchRankingGeneral([a, b]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    embedded,
    sharedDateRange?.[0]?.format?.("YYYY-MM-DD"),
    sharedDateRange?.[1]?.format?.("YYYY-MM-DD"),
  ]);

  const handleRankingPeriodoChange = (value) => {
    setRankingPeriodo(value);
    if (value !== "personalizado") {
      const nextRange = getPresetRange(value);
      setRankingDateRange(nextRange);
      fetchRankingGeneral(nextRange);
    }
  };

  const handleRankingRangeChange = (dates) => {
    setRankingDateRange(Array.isArray(dates) ? dates : []);
  };

  const calculateTotals = () => {
    if (!estadisticas || estadisticas.length === 0) {
      return {
        totalArticulos: 0,
        totalVendido: 0,
        totalCantidad: 0,
        promedioVenta: 0,
        totalGanancia: 0,
      };
    }

    const totalArticulos = estadisticas.length;
    const totalVendidoRaw = estadisticas.reduce(
      (sum, item) => sum + (parseFloat(item.subtotal) || 0),
      0
    );
    const totalCantidad = estadisticas.reduce(
      (sum, item) => sum + (parseInt(item.unidades_vendidas) || 0),
      0
    );
    const totalGananciaRaw = estadisticas.reduce(
      (sum, item) => sum + (parseFloat(item.ganancia) || 0),
      0
    );
    const promedioVentaRaw =
      totalArticulos > 0 ? totalVendidoRaw / totalArticulos : 0;

    return {
      totalArticulos,
      totalVendido: Math.ceil(totalVendidoRaw),
      totalCantidad,
      promedioVenta: Math.ceil(promedioVentaRaw),
      totalGanancia: Math.ceil(totalGananciaRaw),
    };
  };

  const handleGeneratePDF = async () => {
    if (!estadisticas || estadisticas.length === 0 || !selectedLinea) {
      message.warning("No hay datos para generar el PDF");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const marginTop = 40;
    const logoWidth = 30;
    const logoHeight = 30;
    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    const logoForPdf =
      logoDataUrl ||
      (await (async () => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error loading logo for PDF:", error);
          return null;
        }
      })());

    const addHeader = (doc, isFirstPage = false) => {
      if (logoForPdf) {
        doc.addImage(logoForPdf, "PNG", 5, 5, logoWidth, logoHeight);
      }
      if (isFirstPage) {
        doc.setFontSize(20);
        doc.text("Distribuidora Renacer", logoWidth + 10, 20);
        doc.setFontSize(12);
        doc.text(phone, logoWidth + 10, 30);
        doc.text(instagram, logoWidth + 10, 37);
      }
    };

    addHeader(pdf, true);

    // Título del reporte
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    const fechaInicio = dateRange[0].format("DD/MM/YYYY");
    const fechaFin = dateRange[1].format("DD/MM/YYYY");
    const reportTitle = `ESTADÍSTICAS DE VENTAS - LÍNEA: ${selectedLinea.nombre}`;
    const dateTitle = `Período: ${fechaInicio} - ${fechaFin}`;

    const titleX = (pageWidth - pdf.getTextWidth(reportTitle)) / 2;
    pdf.text(reportTitle, titleX, 50);

    pdf.setFontSize(12);
    const dateTitleX = (pageWidth - pdf.getTextWidth(dateTitle)) / 2;
    pdf.text(dateTitle, dateTitleX, 58);

    let currentY = 70;

    // Agregar estadísticas generales
    const totals = calculateTotals();
    pdf.setFontSize(14);
    pdf.text("RESUMEN GENERAL", 10, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.text(`Total de Artículos: ${totals.totalArticulos}`, 10, currentY);
    pdf.text(
      `Total Vendido: $${totals.totalVendido.toLocaleString("es-ES")}`,
      105,
      currentY
    );
    currentY += 7;
    pdf.text(`Cantidad Total Vendida: ${totals.totalCantidad}`, 10, currentY);
    pdf.text(
      `Promedio por Artículo: $${totals.promedioVenta.toLocaleString("es-ES")}`,
      105,
      currentY
    );
    currentY += 7;
    pdf.text(
      `Ganancia Total: $${totals.totalGanancia.toLocaleString("es-ES")}`,
      10,
      currentY
    );
    currentY += 15;

    // Ordenar los datos por total vendido (descendente)
    const sortedData = [...estadisticas].sort(
      (a, b) => parseFloat(b.total_vendido) - parseFloat(a.total_vendido)
    );

    const tableData = sortedData.map((row) => {
      const costo = parseFloat(row.costo || 0);
      const precio = parseFloat(row.precio_monotributista || 0);
      const diferencia = precio - costo;
      return [
        row.codigo_articulo || "",
        row.nombre_completo || "",
        parseInt(row.stock) || 0,
        parseInt(row.unidades_vendidas) || 0,
        "$" + Math.ceil(parseFloat(row.subtotal)).toLocaleString("es-ES"),
        "$" + Math.ceil(costo).toLocaleString("es-ES"),
        "$" + Math.ceil(precio).toLocaleString("es-ES"),
        "$" + Math.ceil(diferencia).toLocaleString("es-ES"),
        "$" + Math.ceil(parseFloat(row.ganancia || 0)).toLocaleString("es-ES"),
      ];
    });

    pdf.autoTable({
      startY: currentY,
      head: [
        [
          "Código",
          "Artículo",
          "Stock",
          "Cantidad Vendida",
          "Total Vendido",
          "Costo",
          "Precio Monotributista",
          "Diferencia",
          "Ganancia",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
        halign: "center", 
      },
      margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
      tableWidth: pageWidth - 10,
      columnStyles: {
        0: { cellWidth: 18 }, // Código
        1: { cellWidth: "auto" }, // Artículo
        2: { cellWidth: 18, halign: "center" }, // Stock
        3: { cellWidth: 18, halign: "center" }, // Cantidad Vendida
        4: { cellWidth: 22, halign: "right" }, // Total Vendido
        5: { cellWidth: 20, halign: "right" }, // Costo
        6: { cellWidth: 22, halign: "right" }, // Precio Monotributista
        7: { cellWidth: 20, halign: "right" }, // Diferencia
        8: { cellWidth: 22, halign: "right" }, // Ganancia
      },
      didDrawPage: (data) => {
        addHeader(pdf, false);
      },
    });

    const fileName = `Estadisticas_${
      selectedLinea.nombre
    }_${fechaInicio.replace(/\//g, "-")}_${fechaFin.replace(/\//g, "-")}.pdf`;
    pdf.save(fileName);
    message.success("PDF generado correctamente");
  };

  const columns = [
    {
      title: (
        <span>
          Código
          <InfoHelp text="Identificador del producto dentro del detalle de la línea." />
        </span>
      ),
      dataIndex: "codigo_articulo",
      key: "codigo_articulo",
      width: 100,
    },
    {
      title: (
        <span>
          Artículo
          <InfoHelp text="Nombre completo del artículo para reconocerlo en la lista." />
        </span>
      ),
      dataIndex: "nombre_completo",
      key: "nombre_completo",
      ellipsis: true,
    },
    {
      title: (
        <span>
          Stock
          <InfoHelp text="Stock actual del artículo en el momento del reporte." />
        </span>
      ),
      dataIndex: "stock",
      key: "stock",
      width: 100,
      align: "center",
      render: (_, record) => parseInt(record.stock) || 0,
    },
    {
      title: (
        <span>
          Cant. vendida
          <InfoHelp text="Cuántas unidades se vendieron de ese producto en el período y línea elegidos." />
        </span>
      ),
      dataIndex: "unidades_vendidas",
      key: "unidades_vendidas",
      width: 120,
      align: "center",
      render: (_, record) => parseInt(record.unidades_vendidas) || 0,
    },
    {
      title: (
        <span>
          Total vendido
          <InfoHelp text="Monto total vendido de ese artículo en el período (antes de mirar costos)." />
        </span>
      ),
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.subtotal || 0)).toLocaleString("es-ES"),
    },
    {
      title: (
        <span>
          Costo
          <InfoHelp text="Costo de referencia del producto para comparar con el precio y la ganancia." />
        </span>
      ),
      dataIndex: "costo",
      key: "costo",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.costo || 0)).toLocaleString("es-ES"),
    },
    {
      title: (
        <span>
          Precio monotributista
          <InfoHelp text="Precio de venta tipo monotributista del artículo (referencia de lista)." />
        </span>
      ),
      dataIndex: "precio_monotributista",
      key: "precio_monotributista",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.precio_monotributista || 0)).toLocaleString(
          "es-ES"
        ),
    },
    {
      title: (
        <span>
          Diferencia
          <InfoHelp text="Brecha entre precio de lista y costo: muestra cuánto ‘aire’ hay entre costo y precio de referencia." />
        </span>
      ),
      key: "diferencia",
      align: "right",
      render: (_, record) => {
        const costo = parseFloat(record.costo || 0);
        const precio = parseFloat(record.precio_monotributista || 0);
        const diferencia = precio - costo;
        return "$" + Math.ceil(diferencia).toLocaleString("es-ES");
      },
    },
    {
      title: (
        <span>
          Ganancia
          <InfoHelp text="Estimación de ganancia de ese producto en el período según los datos de venta y costos cargados." />
        </span>
      ),
      dataIndex: "ganancia",
      key: "ganancia",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.ganancia || 0)).toLocaleString("es-ES"),
    },
  ];

  const rankingGeneralColumns = [
    {
      title: (
        <span>
          #
          <InfoHelp text="Orden en el ranking (1 = más arriba en la tabla según el criterio del listado)." />
        </span>
      ),
      key: "ranking",
      width: 90,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: (
        <span>
          Producto
          <InfoHelp text="Código y nombre para identificar cada producto del ranking." />
        </span>
      ),
      dataIndex: "nombre_completo",
      key: "nombre_completo",
      ellipsis: true,
      render: (_, record) =>
        `${record.codigo_producto || "-"} - ${record.nombre_completo || "-"}`,
    },
    {
      title: (
        <span>
          Cantidad
          <InfoHelp text="Unidades vendidas de ese producto en el período del ranking." />
        </span>
      ),
      dataIndex: "cantidad_vendida",
      key: "cantidad_vendida",
      width: 120,
      align: "right",
      render: (value) => Math.ceil(parseFloat(value || 0)).toLocaleString("es-ES"),
    },
    {
      title: (
        <span>
          Precio promedio
          <InfoHelp text="Precio medio al que se vendió ese producto en el período (ponderado por las ventas)." />
        </span>
      ),
      dataIndex: "precio_promedio",
      key: "precio_promedio",
      width: 140,
      align: "right",
      render: (value) =>
        "$" + Math.ceil(parseFloat(value || 0)).toLocaleString("es-ES"),
    },
    {
      title: (
        <span>
          Subtotal
          <InfoHelp text="Facturación total de ese producto en el período del ranking." />
        </span>
      ),
      dataIndex: "subtotal",
      key: "subtotal",
      width: 140,
      align: "right",
      render: (value) =>
        "$" + Math.ceil(parseFloat(value || 0)).toLocaleString("es-ES"),
    },
  ];

  const handleGeneratePDFGeneral = async () => {
    if (!rankingGeneral || rankingGeneral.length === 0) {
      message.warning("No hay datos para generar el PDF");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const logoWidth = 30;
    const logoHeight = 30;
    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    const logoForPdf =
      logoDataUrl ||
      (await (async () => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error loading logo for PDF:", error);
          return null;
        }
      })());

    const addHeader = (doc, isFirstPage = false) => {
      if (logoForPdf) {
        doc.addImage(logoForPdf, "PNG", 5, 5, logoWidth, logoHeight);
      }
      if (isFirstPage) {
        doc.setFontSize(20);
        doc.text("Distribuidora Renacer", logoWidth + 10, 20);
        doc.setFontSize(12);
        doc.text(phone, logoWidth + 10, 30);
        doc.text(instagram, logoWidth + 10, 37);
      }
    };

    addHeader(pdf, true);

    const [inicio, fin] = rankingDateRange || [];
    const fechaInicio = inicio ? inicio.format("DD/MM/YYYY") : "-";
    const fechaFin = fin ? fin.format("DD/MM/YYYY") : "-";

    pdf.setFontSize(16);
    const title = "PRODUCTOS MAS VENDIDOS - GENERAL";
    const titleX = (pageWidth - pdf.getTextWidth(title)) / 2;
    pdf.text(title, titleX, 50);
    pdf.setFontSize(12);
    const subtitle = `Periodo: ${fechaInicio} - ${fechaFin}`;
    const subtitleX = (pageWidth - pdf.getTextWidth(subtitle)) / 2;
    pdf.text(subtitle, subtitleX, 58);

    const body = rankingGeneral.map((item, index) => [
      index + 1,
      `${item.codigo_producto || "-"} - ${item.nombre_completo || "-"}`,
      Math.ceil(parseFloat(item.cantidad_vendida || 0)).toLocaleString("es-ES"),
      "$" + Math.ceil(parseFloat(item.precio_promedio || 0)).toLocaleString("es-ES"),
      "$" + Math.ceil(parseFloat(item.subtotal || 0)).toLocaleString("es-ES"),
    ]);

    pdf.autoTable({
      startY: 68,
      head: [["#", "Producto", "Cantidad", "Precio Promedio", "Subtotal"]],
      body,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
      },
      margin: { top: 40, left: 5, right: 5, bottom: 5 },
      didDrawPage: () => addHeader(pdf, false),
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 22, halign: "right" },
        3: { cellWidth: 32, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
      },
    });

    const finalY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(11);
    pdf.text(
      `Total productos: ${rankingTotales.totalProductos}`,
      10,
      finalY
    );
    pdf.text(
      `Total unidades: ${Math.ceil(rankingTotales.totalUnidades || 0).toLocaleString("es-ES")}`,
      80,
      finalY
    );
    pdf.text(
      `Subtotal total: $${Math.ceil(rankingTotales.totalSubtotal || 0).toLocaleString("es-ES")}`,
      140,
      finalY
    );

    pdf.save(`Productos_Mas_Vendidos_${fechaInicio.replace(/\//g, "-")}_${fechaFin.replace(/\//g, "-")}.pdf`);
  };

  const totals = calculateTotals();

  const rankingDiasIncluidos = useMemo(() => {
    const rng = rankingDateRange;
    if (!rng || rng.length !== 2 || !rng[0] || !rng[1]) return 0;
    return Math.max(1, rng[1].diff(rng[0], "day") + 1);
  }, [rankingDateRange]);

  const rankingExtra = useMemo(() => {
    const p = rankingTotales.totalProductos || 0;
    const u = rankingTotales.totalUnidades || 0;
    const s = rankingTotales.totalSubtotal || 0;
    const d = rankingDiasIncluidos || 1;
    return {
      ventaPromedioDiaria: Math.ceil(s / d),
      valorPorUnidad: u > 0 ? Math.ceil(s / u) : 0,
      facturacionPorProductoRanking: p > 0 ? Math.ceil(s / p) : 0,
      unidadesPorProducto: p > 0 ? Math.round((u / p) * 10) / 10 : 0,
    };
  }, [rankingTotales, rankingDiasIncluidos]);

  const concentracionTop10Pct = useMemo(() => {
    if (!rankingGeneral?.length || !rankingTotales.totalSubtotal) return null;
    const sumTop = rankingGeneral
      .slice(0, 10)
      .reduce((acc, r) => acc + (parseFloat(r.subtotal) || 0), 0);
    const t = rankingTotales.totalSubtotal;
    return t > 0 ? Math.round((sumTop / t) * 10000) / 100 : null;
  }, [rankingGeneral, rankingTotales.totalSubtotal]);

  const lineaExtra = useMemo(() => {
    const tv = totals.totalVendido;
    const tg = totals.totalGanancia;
    const tc = totals.totalCantidad;
    if (!tc && !tv) return null;
    return {
      margenSobreVentasPct: tv > 0 ? Math.round((tg / tv) * 1000) / 10 : 0,
      gananciaPorUnidad: tc > 0 ? Math.ceil(tg / tc) : 0,
      ventaPorUnidad: tc > 0 ? Math.ceil(tv / tc) : 0,
    };
  }, [totals.totalVendido, totals.totalGanancia, totals.totalCantidad]);

  const dashboardInner = (
    <>
      <style>
        {`
          .selected-row {
            background-color: #e6f7ff !important;
          }
          .selected-row:hover {
            background-color: #bae7ff !important;
          }
          .ant-table-tbody > tr:hover {
            background-color: #f0f0f0;
          }
          .ant-table-tbody > tr.selected-row:hover {
            background-color: #bae7ff !important;
          }
        `}
      </style>
      <div style={{ padding: embedded ? 0 : "20px" }}>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <BarChartOutlined />
              Estadísticas de venta
              <InfoHelp
                text={
                  embedded
                    ? "Acá ves qué productos vendieron más en general y podés bajar al detalle de una línea. Si entraste desde Inicio, las fechas del ranking y del detalle arrancan iguales que en el resumen financiero."
                    : "Ranking de productos más vendidos y, abajo, análisis por línea: elegí línea y fechas y pulsá Consultar para ver tabla, totales y evolución en el tiempo."
                }
              />
            </div>
          }
        >
          <Card
            title={
              <span>
                Productos más vendidos (general)
                <InfoHelp text="Listado de los productos que más facturaron o movieron unidades en el período que elijas. Sirve para ver concentración, comparar con otras épocas y detectar dependencia de pocos ítems." />
              </span>
            }
            style={{ marginBottom: "20px" }}
          >
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={8}>
                <strong>
                  Seleccionar período
                  <InfoHelp text="Atajos de fecha para el ranking. Si elegís «Rango personalizado», habilita el selector de fechas manual." />
                </strong>
                <Select
                  value={rankingPeriodo}
                  onChange={handleRankingPeriodoChange}
                  style={{ width: "100%", marginTop: "8px" }}
                  options={[
                    { value: "diario", label: "Diario" },
                    { value: "semanal", label: "Semanal (últimos 7 días)" },
                    { value: "mensual", label: "Mensual" },
                    { value: "cuatrimestral", label: "Cuatrimestral" },
                    { value: "personalizado", label: "Rango personalizado" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={10}>
                <strong>
                  Rango de fechas
                  <InfoHelp text="Define el intervalo para el ranking general. Solo editable cuando el período es «Rango personalizado»." />
                </strong>
                <RangePicker
                  style={{ width: "100%", marginTop: "8px" }}
                  value={rankingDateRange}
                  onChange={handleRankingRangeChange}
                  disabled={rankingPeriodo !== "personalizado"}
                  format="DD/MM/YYYY"
                />
              </Col>
              <Col xs={24} sm={6}>
                <strong>
                  Acciones
                  <InfoHelp text="Consultar actualiza el ranking con el período elegido. Generar PDF descarga el listado actual para archivo o impresión." />
                </strong>
                <Button
                  type="primary"
                  onClick={() => fetchRankingGeneral()}
                  loading={rankingGeneralLoading}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  Consultar
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={handleGeneratePDFGeneral}
                  disabled={!rankingGeneral || rankingGeneral.length === 0}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  Generar PDF
                </Button>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Productos distintos
                        <InfoHelp text="Cuántos productos distintos aparecen en el ranking (hasta un máximo fijo de ítems). Si el número es bajo, pocas referencias concentran la mayor parte de las ventas del listado." />
                      </span>
                    }
                    value={rankingTotales.totalProductos}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Unidades vendidas
                        <InfoHelp text="Unidades vendidas sumando todos los productos que ves en la tabla del ranking (no es necesariamente todo el catálogo, solo los que entraron al ranking)." />
                      </span>
                    }
                    value={rankingTotales.totalUnidades}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Subtotal total
                        <InfoHelp text="Facturación total asociada a esos productos del ranking en el período. Los importes se muestran redondeados hacia arriba para lectura simple." />
                      </span>
                    }
                    value={rankingTotales.totalSubtotal}
                    prefix="$"
                    precision={0}
                  />
                </Card>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 8, marginBottom: 12 }}>
              Indicadores derivados del ranking
              <InfoHelp text="Cálculos hechos en pantalla a partir del período elegido y de los totales del ranking: te ayudan a entender ritmo diario, ticket por unidad y si pocos productos concentran la facturación." />
            </Title>
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Días del período
                        <InfoHelp text="Cantidad de días calendario entre la fecha desde y hasta del ranking (mínimo 1). Sirve de base para el promedio diario." />
                      </span>
                    }
                    value={rankingDiasIncluidos || "—"}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Venta promedio por día
                        <InfoHelp text="Subtotal total del ranking dividido los días del período. Indica aproximadamente cuánto facturaron esos productos por día en el intervalo." />
                      </span>
                    }
                    value={rankingExtra.ventaPromedioDiaria}
                    prefix="$"
                    precision={0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Valor por unidad vendida
                        <InfoHelp text="Subtotal total dividido unidades vendidas del ranking: precio medio ponderado por unidad en ese conjunto de productos." />
                      </span>
                    }
                    value={rankingExtra.valorPorUnidad}
                    prefix="$"
                    precision={0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Facturación promedio por producto
                        <InfoHelp text="Subtotal total dividido la cantidad de productos en el ranking: cuánto aporta en promedio cada ítem listado." />
                      </span>
                    }
                    value={rankingExtra.facturacionPorProductoRanking}
                    prefix="$"
                    precision={0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Unidades por producto (prom.)
                        <InfoHelp text="Promedio de unidades vendidas por cada producto del ranking: si es alto, esos ítems se mueven en volumen." />
                      </span>
                    }
                    value={rankingExtra.unidadesPorProducto}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        Top 10 concentra
                        <InfoHelp text="Porcentaje del subtotal total del ranking que suman los diez primeros productos de la tabla. Un porcentaje muy alto indica fuerte dependencia de pocos artículos." />
                      </span>
                    }
                    value={concentracionTop10Pct != null ? concentracionTop10Pct : "—"}
                    suffix={concentracionTop10Pct != null ? "%" : ""}
                    precision={1}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={rankingGeneralColumns}
              dataSource={rankingGeneral}
              rowKey="articulo_id"
              loading={rankingGeneralLoading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} productos`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Controles */}
          <Row gutter={16} style={{ marginBottom: "20px" }}>
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: "8px" }}>
                <strong>
                  Línea de productos
                  <InfoHelp text="Elegí la línea de negocio que querés analizar. Sin línea no se puede consultar: acá se arma el detalle por producto y el gráfico de evolución para esa línea y las fechas de abajo." />
                </strong>
              </div>
              <LineaInput onChangeLinea={handleChangeLinea} />
            </Col>
            <Col xs={24} sm={10}>
              <div style={{ marginBottom: "8px" }}>
                <strong>
                  Rango de fechas (detalle por línea)
                  <InfoHelp text="Período para el detalle y la curva de la línea. Si abriste desde Inicio, suele arrancar alineado al calendario del resumen; podés cambiarlo solo para este análisis." />
                </strong>
              </div>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange.length === 2 ? dateRange : null}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ marginBottom: "8px" }}>
                <strong>
                  Acciones
                  <InfoHelp text="Consultar trae la tabla y el gráfico. Generar PDF exporta el detalle actual de la línea en un archivo listo para imprimir o compartir." />
                </strong>
              </div>
              <Button
                type="primary"
                onClick={fetchEstadisticas}
                loading={loading}
                style={{ width: "100%", marginBottom: "8px" }}
              >
                Consultar
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleGeneratePDF}
                disabled={!estadisticas || estadisticas.length === 0}
                style={{ width: "100%" }}
              >
                Generar PDF
              </Button>
            </Col>
          </Row>

          {/* Estadísticas Generales */}
          {estadisticas && estadisticas.length > 0 && (
            <>
              {lineaExtra && (
                <>
                  <Title level={5} style={{ marginTop: 8, marginBottom: 12 }}>
                    Indicadores de la línea seleccionada
                    <InfoHelp text="Se calculan con los totales del detalle ya cargado: útiles para ver margen y rentabilidad por unidad en esa línea y fechas." />
                  </Title>
                  <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title={
                            <span>
                              Margen sobre ventas
                              <InfoHelp text="Ganancia total dividida venta total de la línea en el período, en porcentaje. Indica qué parte de lo facturado queda como margen según los datos cargados." />
                            </span>
                          }
                          value={lineaExtra.margenSobreVentasPct}
                          suffix="%"
                          precision={1}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title={
                            <span>
                              Ganancia por unidad
                              <InfoHelp text="Ganancia total dividida cantidad de unidades vendidas en el detalle: cuánto margen aporta cada unidad vendida en promedio." />
                            </span>
                          }
                          value={lineaExtra.gananciaPorUnidad}
                          prefix="$"
                          precision={0}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title={
                            <span>
                              Venta por unidad
                              <InfoHelp text="Total vendido dividido unidades: precio de venta promedio por unidad movida en esa línea y período." />
                            </span>
                          }
                          value={lineaExtra.ventaPorUnidad}
                          prefix="$"
                          precision={0}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
              <Row gutter={[16, 16]} justify="center" style={{ marginBottom: "20px" }}>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          Total artículos
                          <InfoHelp text="Cuántos productos de la línea tuvieron venta registrada en el período consultado." />
                        </span>
                      }
                      value={totals.totalArticulos}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          Cantidad vendida
                          <InfoHelp text="Unidades vendidas sumando todos los productos del detalle de la línea." />
                        </span>
                      }
                      value={totals.totalCantidad}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          Total vendido
                          <InfoHelp text="Suma de lo facturado por esos productos de la línea en el período." />
                        </span>
                      }
                      value={totals.totalVendido}
                      precision={0}
                      prefix="$"
                      valueStyle={{ color: "#f5222d" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          Promedio por artículo
                          <InfoHelp text="Promedio de facturación por producto: útil para comparar si pocos ítems arrastran el total o si hay muchos con ventas chicas." />
                        </span>
                      }
                      value={totals.promedioVenta}
                      precision={0}
                      prefix="$"
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          Ganancia
                          <InfoHelp text="Suma de la ganancia estimada por producto en esa línea y fechas." />
                        </span>
                      }
                      value={totals.totalGanancia}
                      precision={0}
                      prefix="$"
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Gráfico de Evolución Temporal */}
              {evolucionData && evolucionData.length > 0 && (
                <Card 
                  title={
                    <span>
                      Evolución en el tiempo
                      <InfoHelp text="Cómo cambian ventas, ganancia y otros indicadores día a día (o agregados) para la línea que consultaste. Podés aislar un producto desde el desplegable o haciendo clic en la tabla. Mostrá solo las curvas que necesites para no saturar el gráfico." />
                    </span>
                  }
                  style={{ marginBottom: "20px" }}
                >
                  <Row gutter={16} style={{ marginBottom: "12px" }}>
                    <Col span={24}>
                      <div style={{ marginBottom: 8, fontWeight: 600 }}>
                        Series del gráfico
                        <InfoHelp text="Por defecto se muestran Total vendido y Ganancia. El resto son promedios o cantidades; combinar muchas a la vez puede dificultar la lectura." />
                      </div>
                      <Space wrap>
                        <Checkbox
                          checked={evoLineVisibility.total_vendido}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              total_vendido: e.target.checked,
                            }))
                          }
                        >
                          Total vendido
                        </Checkbox>
                        <Checkbox
                          checked={evoLineVisibility.ganancia}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              ganancia: e.target.checked,
                            }))
                          }
                        >
                          Ganancia
                        </Checkbox>
                        <Checkbox
                          checked={evoLineVisibility.diferencia_promedio}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              diferencia_promedio: e.target.checked,
                            }))
                          }
                        >
                          Diferencia promedio
                        </Checkbox>
                        <Checkbox
                          checked={evoLineVisibility.precio_promedio}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              precio_promedio: e.target.checked,
                            }))
                          }
                        >
                          Precio promedio
                        </Checkbox>
                        <Checkbox
                          checked={evoLineVisibility.costo_promedio}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              costo_promedio: e.target.checked,
                            }))
                          }
                        >
                          Costo promedio
                        </Checkbox>
                        <Checkbox
                          checked={evoLineVisibility.cantidad_vendida}
                          onChange={(e) =>
                            setEvoLineVisibility((p) => ({
                              ...p,
                              cantidad_vendida: e.target.checked,
                            }))
                          }
                        >
                          Cantidad vendida (eje derecho)
                        </Checkbox>
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: "16px" }}>
                    <Col span={24}>
                      <Select
                        placeholder="Selecciona un producto para ver su evolución (o deja vacío para ver todos). También puedes hacer clic en una fila de la tabla."
                        style={{ width: "100%" }}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        onChange={(value) => setSelectedArticulo(value)}
                        value={selectedArticulo}
                      >
                        {estadisticas.map((art) => (
                          <Select.Option key={art.codigo_articulo} value={art.codigo_articulo}>
                            {art.nombre_completo}
                          </Select.Option>
                        ))}
                      </Select>
                      {selectedArticulo && (
                        <div style={{ marginTop: "8px", color: "#1890ff" }}>
                          Mostrando evolución de: {estadisticas.find(a => a.codigo_articulo === selectedArticulo)?.nombre_completo}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={(() => {
                        // Filtrar por artículo si está seleccionado
                        let datosFiltrados = evolucionData;
                        if (selectedArticulo) {
                          datosFiltrados = evolucionData.filter(
                            (d) => d.codigo_articulo === selectedArticulo
                          );
                        }

                        // Si hay un artículo seleccionado, mostrar datos individuales por fecha
                        // Si no, agrupar todos los artículos por fecha
                        if (selectedArticulo) {
                          // Para un artículo específico: agrupar solo sus ventas por fecha
                          const datosPorFecha = {};
                          datosFiltrados.forEach((item) => {
                            const fecha = item.fecha;
                            if (!datosPorFecha[fecha]) {
                              datosPorFecha[fecha] = {
                                fecha: fecha,
                                ganancia: 0,
                                total_vendido: 0,
                                diferencia_promedio: 0,
                                precio_promedio: 0,
                                costo_promedio: 0,
                                cantidad_vendida: 0,
                              };
                            }
                            datosPorFecha[fecha].ganancia += parseFloat(item.ganancia || 0);
                            datosPorFecha[fecha].total_vendido += parseFloat(item.total_vendido || 0);
                            datosPorFecha[fecha].diferencia_promedio += parseFloat(item.diferencia_promedio || 0);
                            datosPorFecha[fecha].precio_promedio += parseFloat(item.precio_promedio || 0);
                            datosPorFecha[fecha].costo_promedio += parseFloat(item.costo_promedio || 0);
                            datosPorFecha[fecha].cantidad_vendida += parseFloat(item.cantidad_vendida || 0);
                          });
                          return Object.values(datosPorFecha).sort((a, b) => 
                            new Date(a.fecha) - new Date(b.fecha)
                          );
                        } else {
                          // Para todos los artículos: agrupar por fecha sumando todos
                          const datosPorFecha = {};
                          datosFiltrados.forEach((item) => {
                            const fecha = item.fecha;
                            if (!datosPorFecha[fecha]) {
                              datosPorFecha[fecha] = {
                                fecha: fecha,
                                ganancia: 0,
                                total_vendido: 0,
                                diferencia_promedio: 0,
                                precio_promedio: 0,
                                costo_promedio: 0,
                                cantidad_vendida: 0,
                              };
                            }
                            datosPorFecha[fecha].ganancia += parseFloat(item.ganancia || 0);
                            datosPorFecha[fecha].total_vendido += parseFloat(item.total_vendido || 0);
                            datosPorFecha[fecha].diferencia_promedio += parseFloat(item.diferencia_promedio || 0);
                            datosPorFecha[fecha].precio_promedio += parseFloat(item.precio_promedio || 0);
                            datosPorFecha[fecha].costo_promedio += parseFloat(item.costo_promedio || 0);
                            datosPorFecha[fecha].cantidad_vendida += parseFloat(item.cantidad_vendida || 0);
                          });
                          return Object.values(datosPorFecha).sort((a, b) => 
                            new Date(a.fecha) - new Date(b.fecha)
                          );
                        }
                      })()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          });
                        }}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (name === 'cantidad_vendida') {
                            return [value, 'Cantidad Vendida'];
                          }
                          return [`$${parseFloat(value).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`, name];
                        }}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return `Fecha: ${date.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}`;
                        }}
                      />
                      <Legend />
                      {evoLineVisibility.ganancia && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ganancia"
                          stroke="#fa8c16"
                          strokeWidth={2}
                          name="Ganancia"
                          dot={{ r: 4 }}
                        />
                      )}
                      {evoLineVisibility.total_vendido && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="total_vendido"
                          stroke="#f5222d"
                          strokeWidth={2}
                          name="Total Vendido"
                          dot={{ r: 4 }}
                        />
                      )}
                      {evoLineVisibility.diferencia_promedio && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="diferencia_promedio"
                          stroke="#52c41a"
                          strokeWidth={2}
                          name="Diferencia Promedio (Precio - Costo)"
                          dot={{ r: 4 }}
                        />
                      )}
                      {evoLineVisibility.precio_promedio && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="precio_promedio"
                          stroke="#1890ff"
                          strokeWidth={2}
                          name="Precio Promedio"
                          dot={{ r: 4 }}
                        />
                      )}
                      {evoLineVisibility.costo_promedio && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="costo_promedio"
                          stroke="#722ed1"
                          strokeWidth={2}
                          name="Costo Promedio"
                          dot={{ r: 4 }}
                        />
                      )}
                      {evoLineVisibility.cantidad_vendida && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="cantidad_vendida"
                          stroke="#13c2c2"
                          strokeWidth={2}
                          name="Cantidad Vendida"
                          dot={{ r: 4 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Tabla de Datos */}
              <Card
                title={
                  <span>
                    Detalle de ventas
                    <InfoHelp text="Una fila por producto con venta en la línea y fechas elegidas: stock, cantidades, montos y márgenes. Clic en una fila acota el gráfico de arriba a ese artículo." />
                  </span>
                }
              >
                <Table
                  columns={columns}
                  dataSource={estadisticas}
                  rowKey="codigo_articulo"
                  scroll={{ x: 800 }}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} artículos`,
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedArticulo(record.codigo_articulo);
                    },
                    style: {
                      cursor: 'pointer',
                      backgroundColor: selectedArticulo === record.codigo_articulo ? '#e6f7ff' : 'transparent',
                    },
                  })}
                  rowClassName={(record) => 
                    selectedArticulo === record.codigo_articulo ? 'selected-row' : ''
                  }
                />
              </Card>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>Cargando estadísticas...</div>
            </div>
          )}

          {/* Sin datos */}
          {!loading && (!estadisticas || estadisticas.length === 0) && (
            <div
              style={{ textAlign: "center", padding: "50px", color: "#999" }}
            >
              <BarChartOutlined
                style={{ fontSize: "48px", marginBottom: "16px" }}
              />
              <div>
                Selecciona una línea y rango de fechas para ver las estadísticas
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );

  return embedded ? (
    dashboardInner
  ) : (
    <MenuLayout>{dashboardInner}</MenuLayout>
  );
}
