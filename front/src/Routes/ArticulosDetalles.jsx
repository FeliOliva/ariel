import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Radio, Checkbox, Space } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import imageUrl from "../logoRenacer.png";
import LineaInput from "../components/LineaInput";
import "../style/style.css";

const ArticulosDetalles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  // Opciones de precio globales
  const [precioOption, setPrecioOption] = useState("venta");

  // Modal imprimir en bloque
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSelections, setBulkSelections] = useState(["lista"]);
  const [bulkLinea, setBulkLinea] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getArticulosOrdenados`
        );
        const filteredData = response.data.filter((item) => item.estado === 1);

        const groupedData = filteredData.reduce((acc, item) => {
          const key = `${item.linea_nombre} > ${item.sublinea_nombre}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});

        Object.keys(groupedData).forEach((key) => {
          groupedData[key].sort((a, b) =>
            a.articulo_nombre.localeCompare(b.articulo_nombre)
          );
        });

        const sortedData = Object.entries(groupedData)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .flatMap(([, items]) => items);

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        if (isMounted) setLogoDataUrl(dataUrl);
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    };
    loadLogo();
    return () => { isMounted = false; };
  }, []);

  // ─── Helpers de PDF ──────────────────────────────────────────────

  const getTableConfig = (option) => {
    switch (option) {
      case "venta":
        return {
          head: [["Código", "Artículo", "Precio"]],
          colSpan: 3,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 28, halign: "right" },
          },
        };
      case "costo":
        return {
          head: [["Código", "Artículo", "Precio"]],
          colSpan: 3,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 28, halign: "right" },
          },
        };
      case "ambos":
        return {
          head: [["Código", "Artículo", "Precio", "Costo"]],
          colSpan: 4,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 28, halign: "right" },
            3: { cellWidth: 28, halign: "right" },
          },
        };
      default:
        return {
          head: [["Código", "Artículo"]],
          colSpan: 2,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
          },
        };
    }
  };

  const fmt = (val) =>
    "$" +
    Math.ceil(parseFloat(val) || 0).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const buildRow = (row, option) => {
    const medicion =
      row.articulo_medicion === "-" ? "" : row.articulo_medicion || "";
    const base = [
      row.codigo_producto,
      (row.articulo_nombre + " " + medicion).trim(),
    ];
    switch (option) {
      case "venta":  return [...base, fmt(row.precio_monotributista)];
      case "costo":  return [...base, fmt(row.costo)];
      case "ambos":  return [...base, fmt(row.precio_monotributista), fmt(row.costo)];
      default:       return base;
    }
  };

  const buildBodyRows = (sublineasData, option) => {
    const { colSpan } = getTableConfig(option);
    const sortedSublineas = Object.keys(sublineasData).sort();
    const bodyRows = [];

    sortedSublineas.forEach((sublinea) => {
      const sublineaItems = [...sublineasData[sublinea]].sort((a, b) =>
        a.articulo_nombre.localeCompare(b.articulo_nombre)
      );

      const subRow = [
        {
          content: sublinea,
          colSpan,
          styles: {
            fillColor: [230, 230, 230],
            textColor: 0,
            fontStyle: "bold",
            halign: "center",
            fontSize: 9,
          },
        },
      ];
      subRow.__isSublineaHeader = true;
      bodyRows.push(subRow);

      sublineaItems.forEach((row) => bodyRows.push(buildRow(row, option)));
    });

    return bodyRows;
  };

  const getLogoForPdf = async () => {
    if (logoDataUrl) return logoDataUrl;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const makeAddHeader = (logoForPdf, logoWidth, logoHeight, phone, instagram) =>
    (doc, isFirstPage = false) => {
      if (logoForPdf) doc.addImage(logoForPdf, "PNG", 5, 5, logoWidth, logoHeight);
      if (isFirstPage) {
        doc.setFontSize(20);
        doc.text("Distribuidora Renacer", logoWidth + 10, 20);
        doc.setFontSize(12);
        doc.text(phone, logoWidth + 10, 30);
        doc.text(instagram, logoWidth + 10, 37);
      }
    };

  // ─── Agrupar ───────────────────────────────────────────────────

  const groupByLine = (items) =>
    items.reduce((acc, item) => {
      if (!acc[item.linea_nombre]) acc[item.linea_nombre] = [];
      acc[item.linea_nombre].push(item);
      return acc;
    }, {});

  const groupBySublinea = (items) =>
    items.reduce((acc, item) => {
      const sublinea = item.sublinea_nombre || "Sin sublínea";
      if (!acc[sublinea]) acc[sublinea] = [];
      acc[sublinea].push(item);
      return acc;
    }, {});

  // ─── Generadores de PDF ────────────────────────────────────────

  const handleGeneratePDF = async (option = precioOption) => {
    const excludedLineIds = [69];
    const pageHeight = 297;
    const pageWidth = 210;
    const marginTop = 40;
    const titleHeight = 10;
    const rowHeight = 7;
    const logoWidth = 30;
    const logoHeight = 30;
    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    const logoForPdf = await getLogoForPdf();
    const pdf = new jsPDF("p", "mm", "a4");
    const addHeader = makeAddHeader(logoForPdf, logoWidth, logoHeight, phone, instagram);
    const { head, columnStyles } = getTableConfig(option);

    if (data.length === 0) return;

    addHeader(pdf, true);

    const filteredData = data.filter(
      (item) => !excludedLineIds.includes(item.linea_id)
    );
    const groupedData = groupByLine(filteredData);

    Object.keys(groupedData).forEach((line) => {
      groupedData[line].sort((a, b) =>
        a.articulo_nombre.localeCompare(b.articulo_nombre)
      );
    });

    let currentY = marginTop;

    Object.keys(groupedData).forEach((line) => {
      const lineTitle = `LÍNEA ${line}`;
      const sublineasData = groupBySublinea(groupedData[line]);

      if (pdf.internal.getNumberOfPages() === 1 && currentY === marginTop) {
        currentY += 20;
      }

      const minAfterTitle = titleHeight + 5 + rowHeight * 4;
      if (currentY + minAfterTitle > pageHeight) {
        pdf.addPage();
        addHeader(pdf, false);
        currentY = marginTop;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.setFillColor(255, 255, 255);
      const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
      pdf.rect(0, currentY - 5, pageWidth, titleHeight + 10, "F");
      pdf.text(lineTitle, titleX, currentY);
      currentY += titleHeight + 5;

      const bodyRows = buildBodyRows(sublineasData, option);

      pdf.autoTable({
        startY: currentY,
        head,
        body: bodyRows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
        tableWidth: pageWidth - 10,
        columnStyles,
        didDrawPage: () => addHeader(pdf, false),
        didParseCell: (d) => {
          if (d.row?.raw?.__isSublineaHeader) {
            d.cell.styles.fillColor = [230, 230, 230];
            d.cell.styles.textColor = 0;
            d.cell.styles.fontStyle = "bold";
            d.cell.styles.halign = "center";
            d.cell.styles.fontSize = 9;
          }
        },
      });

      currentY = pdf.lastAutoTable.finalY + 15;
    });

    pdf.save("articulos.pdf");
  };

  const handleGeneratePDFlinea = async (lineaData, linea, option = precioOption) => {
    if (!lineaData || lineaData.length === 0 || !linea) return;

    const pageWidth = 210;
    const marginTop = 40;
    const titleHeight = 10;
    const logoWidth = 30;
    const logoHeight = 30;
    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    const logoForPdf = await getLogoForPdf();
    const pdf = new jsPDF("p", "mm", "a4");
    const addHeader = makeAddHeader(logoForPdf, logoWidth, logoHeight, phone, instagram);
    const { head, columnStyles } = getTableConfig(option);

    addHeader(pdf, true);

    pdf.setFontSize(16);
    pdf.setTextColor(0);
    const lineTitle = `LÍNEA: ${linea.nombre}`;
    const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
    pdf.text(lineTitle, titleX, 50);

    const currentY = marginTop + titleHeight + 5;
    const sublineasData = groupBySublinea(lineaData);
    const bodyRows = buildBodyRows(sublineasData, option);

    pdf.autoTable({
      startY: currentY,
      head,
      body: bodyRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
      tableWidth: pageWidth - 10,
      columnStyles,
      didDrawPage: () => addHeader(pdf, false),
      didParseCell: (d) => {
        if (d.row?.raw?.__isSublineaHeader) {
          d.cell.styles.fillColor = [230, 230, 230];
          d.cell.styles.textColor = 0;
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.halign = "center";
          d.cell.styles.fontSize = 9;
        }
      },
    });

    pdf.save(`Articulos_${linea.nombre}.pdf`);
  };

  const handleGeneratePDFMedicamentos = (lineaData, option = precioOption) => {
    if (!lineaData || lineaData.length === 0) return;

    const pageWidth = 210;
    const { head, columnStyles } = getTableConfig(option);
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(16);
    pdf.setTextColor(0);
    const lineTitle = "LÍNEA: MEDICAMENTOS";
    const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
    pdf.text(lineTitle, titleX, 20);

    const sublineasData = groupBySublinea(lineaData);
    const bodyRows = buildBodyRows(sublineasData, option);

    pdf.autoTable({
      startY: 30,
      head,
      body: bodyRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20, right: 5, bottom: 5, left: 5 },
      tableWidth: pageWidth - 10,
      columnStyles,
      didParseCell: (d) => {
        if (d.row?.raw?.__isSublineaHeader) {
          d.cell.styles.fillColor = [230, 230, 230];
          d.cell.styles.textColor = 0;
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.halign = "center";
          d.cell.styles.fontSize = 9;
        }
      },
    });

    pdf.save("Articulos_Medicamentos.pdf");
  };

  // ─── Imprimir en bloque ────────────────────────────────────────

  const handleBulkPrint = async () => {
    setBulkLoading(true);
    try {
      if (bulkSelections.includes("lista")) {
        await handleGeneratePDF(precioOption);
      }
      if (bulkSelections.includes("linea") && bulkLinea) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getArticulosByLineaID/${bulkLinea.id}`
        );
        await handleGeneratePDFlinea(response.data, bulkLinea, precioOption);
      }
      if (bulkSelections.includes("medicamentos")) {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getArticulosByLineaID/69`
        );
        handleGeneratePDFMedicamentos(response.data, precioOption);
      }
    } catch (error) {
      console.error("Error en impresión en bloque:", error);
    } finally {
      setBulkLoading(false);
      setBulkModalOpen(false);
    }
  };

  // ─── Tabla pantalla ────────────────────────────────────────────

  const columns = [
    {
      name: "Código",
      selector: (row) => row.codigo_producto,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) =>
        `${row.articulo_nombre} ${row.linea_nombre} ${row.sublinea_nombre}`,
      sortable: true,
    },
    {
      name: "Precio",
      selector: (row) =>
        Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString(
          "es-ES",
          { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        ),
      sortable: true,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────

  return (
    <MenuLayout>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <Button onClick={() => window.history.back()} type="primary">
          Volver
        </Button>
        <Button
          onClick={() => setBulkModalOpen(true)}
          type="default"
          icon={<PrinterOutlined />}
          style={{ borderColor: "#722ed1", color: "#722ed1" }}
        >
          Imprimir en bloque
        </Button>
      </div>

      {/* Modal: imprimir en bloque */}
      <Modal
        title={
          <Space>
            <PrinterOutlined />
            Imprimir en bloque
          </Space>
        }
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setBulkModalOpen(false)}>
            Cancelar
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            loading={bulkLoading}
            disabled={
              bulkSelections.length === 0 ||
              (bulkSelections.includes("linea") && !bulkLinea)
            }
            onClick={handleBulkPrint}
          >
            Generar PDFs
          </Button>,
        ]}
        width={480}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Selección de reportes */}
          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              ¿Qué deseas imprimir?
            </div>
            <Checkbox.Group
              value={bulkSelections}
              onChange={setBulkSelections}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <Checkbox value="lista">Lista general de artículos</Checkbox>
              <Checkbox value="linea">Por línea específica</Checkbox>
              <Checkbox value="medicamentos">Medicamentos</Checkbox>
            </Checkbox.Group>
          </div>

          {/* LineaInput condicional */}
          {bulkSelections.includes("linea") && (
            <div>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>
                Seleccionar línea:
              </div>
              <LineaInput onChangeLinea={setBulkLinea} />
            </div>
          )}

          <Radio.Group
            value={precioOption}
            onChange={(e) => setPrecioOption(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="ninguno">Ninguno</Radio.Button>
            <Radio.Button value="venta">Precio</Radio.Button>
            <Radio.Button value="costo">Costo</Radio.Button>
            <Radio.Button value="ambos">Ambos</Radio.Button>
          </Radio.Group>
        </Space>
      </Modal>

      {/* Tabla */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination
          customStyles={{
            rows: { style: { minHeight: "60px" } },
            headCells: { style: { fontSize: "20px", padding: "12px" } },
            cells: { style: { fontSize: "18px", padding: "10px" } },
          }}
        />
      )}
    </MenuLayout>
  );
};

export default ArticulosDetalles;
