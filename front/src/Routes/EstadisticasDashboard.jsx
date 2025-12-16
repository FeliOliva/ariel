import React, { useState } from "react";
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
} from "antd";
import { FilePdfOutlined, BarChartOutlined } from "@ant-design/icons";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import LineaInput from "../components/LineaInput"; // Ajusta la ruta según tu estructura
import MenuLayout from "../components/MenuLayout";
import imageUrl from "../logoRenacer.png";

const { RangePicker } = DatePicker;

export default function EstadisticasDashboard() {
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChangeLinea = (linea) => {
    setSelectedLinea(linea);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
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

      const response = await axios.get(
        `http://localhost:3001/getArticulosVendidosPorLinea?linea_id=${selectedLinea.id}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );

      const { productos } = response.data;
      setEstadisticas(productos);
      message.success("Estadísticas cargadas correctamente");
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
      message.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!estadisticas || estadisticas.length === 0) {
      return {
        totalArticulos: 0,
        totalVendido: 0,
        totalCantidad: 0,
        promedioVenta: 0,
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
    const promedioVentaRaw =
      totalArticulos > 0 ? totalVendidoRaw / totalArticulos : 0;

    return {
      totalArticulos,
      totalVendido: Math.ceil(totalVendidoRaw),
      totalCantidad,
      promedioVenta: Math.ceil(promedioVentaRaw),
    };
  };

  const handleGeneratePDF = () => {
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

    const addHeader = (doc, isFirstPage = false) => {
      doc.addImage(imageUrl, "PNG", 5, 5, logoWidth, logoHeight);
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
    currentY += 15;

    // Ordenar los datos por total vendido (descendente)
    const sortedData = [...estadisticas].sort(
      (a, b) => parseFloat(b.total_vendido) - parseFloat(a.total_vendido)
    );

    const tableData = sortedData.map((row) => [
      row.codigo_articulo || "",
      row.nombre_completo || "",
      parseInt(row.stock) || 0,
      parseInt(row.unidades_vendidas) || 0,
      "$" + Math.ceil(parseFloat(row.subtotal)).toLocaleString("es-ES"),
      "$" +
        Math.ceil(parseFloat(row.precio_monotributista || 0)).toLocaleString(
          "es-ES"
        ),
    ]);

    pdf.autoTable({
      startY: currentY,
      head: [
        [
          "Código",
          "Artículo",
          "Stock",
          "Cantidad Vendida",
          "Total Vendido",
          "Precio Monotributista",
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
        0: { cellWidth: 25 }, // Código
        1: { cellWidth: "auto" }, // Artículo
        3: { cellWidth: 25, halign: "center" }, // Stock
        2: { cellWidth: 25, halign: "center" }, // Cantidad Vendida
        4: { cellWidth: 30, halign: "right" }, // Total Vendido
        5: { cellWidth: 30, halign: "right" }, // Precio Promedio
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
      title: "Código",
      dataIndex: "codigo_articulo",
      key: "codigo_articulo",
      width: 100,
    },
    {
      title: "Artículo",
      dataIndex: "nombre_completo",
      key: "nombre_completo",
      ellipsis: true,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      align: "center",
      render: (_, record) => parseInt(record.stock) || 0,
    },
    {
      title: "Cantidad Vendida",
      dataIndex: "unidades_vendidas",
      key: "unidades_vendidas",
      width: 120,
      align: "center",
      render: (_, record) => parseInt(record.unidades_vendidas) || 0,
    },
    {
      title: "Total Vendido",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.subtotal || 0)).toLocaleString("es-ES"),
    },
    {
      title: "Precio Monotributista",
      dataIndex: "precio_monotributista",
      key: "precio_monotributista",
      align: "right",
      render: (_, record) =>
        "$" +
        Math.ceil(parseFloat(record.precio_monotributista || 0)).toLocaleString(
          "es-ES"
        ),
    },
  ];

  const totals = calculateTotals();

  return (
    <MenuLayout>
      <div style={{ padding: "20px" }}>
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChartOutlined />
              Estadísticas de Ventas por Línea
            </div>
          }
        >
          {/* Controles */}
          <Row gutter={16} style={{ marginBottom: "20px" }}>
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: "8px" }}>
                <strong>Seleccionar Línea:</strong>
              </div>
              <LineaInput onChangeLinea={handleChangeLinea} />
            </Col>
            <Col xs={24} sm={10}>
              <div style={{ marginBottom: "8px" }}>
                <strong>Rango de Fechas:</strong>
              </div>
              <RangePicker
                style={{ width: "100%" }}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ marginBottom: "8px" }}>
                <strong>Acciones:</strong>
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
              <Row gutter={16} style={{ marginBottom: "20px" }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Total Artículos"
                      value={totals.totalArticulos}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Cantidad Vendida"
                      value={totals.totalCantidad}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Total Vendido"
                      value={totals.totalVendido}
                      precision={0} // ← sin decimales
                      prefix="$"
                      valueStyle={{ color: "#f5222d" }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="Promedio por Artículo"
                      value={totals.promedioVenta}
                      precision={0} // ← sin decimales
                      prefix="$"
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Tabla de Datos */}
              <Card title="Detalle de Ventas">
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
    </MenuLayout>
  );
}
