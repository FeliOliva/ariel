import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Drawer } from "antd";
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
  const [open, setOpen] = useState(false);
  const [lineaId, setLineaId] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/getArticulosOrdenados`
        );
        // Filtrar los artículos activos (estado = 1)
        const filteredData = response.data.filter((item) => item.estado === 1);

        // Agrupar y ordenar los datos
        const groupedData = filteredData.reduce((acc, item) => {
          const key = `${item.linea_nombre} > ${item.sublinea_nombre}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});

        // Ordenar los artículos dentro de cada grupo estrictamente por nombre
        Object.keys(groupedData).forEach((key) => {
          groupedData[key].sort((a, b) =>
            a.articulo_nombre.localeCompare(b.articulo_nombre)
          );
        });

        // Aplanar los datos para renderizarlos en orden
        const sortedData = Object.entries(groupedData)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Ordenar las claves (línea > sublínea)
          .flatMap(([key, items]) => items); // Aplanar los artículos

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

  // Agrupar los artículos por línea
  const groupByLine = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.linea_nombre]) {
        acc[item.linea_nombre] = [];
      }
      acc[item.linea_nombre].push(item);
      return acc;
    }, {});
  };

  // Agrupar los artículos por sublínea dentro de una línea
  const groupBySublinea = (data) => {
    return data.reduce((acc, item) => {
      const sublinea = item.sublinea_nombre || "Sin sublínea";
      if (!acc[sublinea]) {
        acc[sublinea] = [];
      }
      acc[sublinea].push(item);
      return acc;
    }, {});
  };

  const handleGeneratePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const marginTop = 40;
    const titleHeight = 10;
    const rowHeight = 7;
    const minRowsOnPage = 2;
    const logoWidth = 30;
    const logoHeight = 30;

    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    // Lista de IDs a excluir
    const excludedLineIds = [69]; // IDs de línea a excluir

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

    if (data.length > 0) {
      addHeader(pdf, true);

      // Filtrar los artículos excluyendo los IDs especificados
      const filteredData = data.filter(
        (item) => !excludedLineIds.includes(item.linea_id)
      );

      const groupedData = groupByLine(filteredData);

      // Ordenar artículos dentro de cada línea
      Object.keys(groupedData).forEach((line) => {
        groupedData[line].sort((a, b) =>
          a.articulo_nombre.localeCompare(b.articulo_nombre)
        );
      });

      let currentY = marginTop;

      Object.keys(groupedData).forEach((line) => {
        const lineTitle = `LÍNEA ${line}`;
        
        // Agrupar por sublínea dentro de esta línea
        const sublineasData = groupBySublinea(groupedData[line]);
        
        // Ordenar sublíneas alfabéticamente
        const sortedSublineas = Object.keys(sublineasData).sort();

        if (pdf.internal.getNumberOfPages() === 1 && currentY === marginTop) {
          currentY += 20;
        }

        // Evitar que quede el título al final de página sin tabla
        // (título + espacio + header tabla + banda sublínea + 1 producto aprox.)
        const minAfterTitle =
          titleHeight + 5 + rowHeight * 4; // ~ tabla mínima visible
        if (currentY + minAfterTitle > pageHeight) {
          pdf.addPage();
          addHeader(pdf, false);
          currentY = marginTop;
        }

        // Título de la línea
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.setFillColor(255, 255, 255);
        const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
        pdf.rect(0, currentY - 5, pageWidth, titleHeight + 10, "F");
        pdf.text(lineTitle, titleX, currentY);
        currentY += titleHeight + 5;

        // Armar una sola tabla por línea e insertar la sublínea como "fila separadora" dentro de la tabla
        const bodyRows = [];
        sortedSublineas.forEach((sublinea) => {
          const sublineaItems = sublineasData[sublinea];
          sublineaItems.sort((a, b) =>
            a.articulo_nombre.localeCompare(b.articulo_nombre)
          );

          const subRow = [
            {
              content: sublinea,
              colSpan: 4,
              styles: {
                fillColor: [230, 230, 230],
                textColor: 0,
                fontStyle: "bold",
                halign: "center",
                fontSize: 9,
              },
            },
          ];
          // marcador para hooks
          subRow.__isSublineaHeader = true;
          bodyRows.push(subRow);

          sublineaItems.forEach((row) => {
            const medicion =
              row.articulo_medicion === "-" ? "" : row.articulo_medicion;
            bodyRows.push([
              row.codigo_producto,
              row.articulo_nombre + " " + medicion,
              "$" +
                Math.ceil(parseFloat(row.costo) || 0).toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }),
              "$" +
                Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString(
                  "es-ES",
                  { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                ),
            ]);
          });
        });

        pdf.autoTable({
          startY: currentY,
          head: [["Código", "Artículo", "Costo", "Precio"]],
          body: bodyRows,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 1 },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: 0,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          // IMPORTANTE: deja margen superior en páginas siguientes para no chocar con el header/logo
          margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
          tableWidth: pageWidth - 10,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
          },
          didDrawPage: () => {
            addHeader(pdf, false);
          },
          didParseCell: (data) => {
            if (data.row?.raw?.__isSublineaHeader) {
              data.cell.styles.fillColor = [230, 230, 230];
              data.cell.styles.textColor = 0;
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.halign = "center";
              data.cell.styles.fontSize = 9;
            }
          },
        });

        currentY = pdf.lastAutoTable.finalY + 10;

        // Espacio adicional después de cada línea
        currentY += 5;
      });

      pdf.save("articulos.pdf");
    }
  };

  const columns = [
    {
      name: "Código",
      selector: (row) => row.codigo_producto,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) =>
        row.articulo_nombre +
        " " +
        row.linea_nombre +
        " " +
        row.sublinea_nombre,
      sortable: true,
    },
    {
      name: "Precio",
      selector: (row) =>
        Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }), // Aplicar formato de precio redondeado hacia arriba
      sortable: true,
    },
  ];
  const openDrawer = () => {
    setOpen(true);
  };
  const getArticulosByLineaID = async () => {
    if (!lineaId) {
      console.warn("ID de línea inválido");
      return;
    }
    const linea_id = lineaId.id;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getArticulosByLineaID/${linea_id}`
      );
      const data = response.data;
      await handleGeneratePDFlinea(data, lineaId);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleGeneratePDFlinea = async (data, lineaId) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const marginTop = 40;
    const titleHeight = 10;
    const rowHeight = 7;
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

    if (!data || data.length === 0 || !lineaId) {
      console.warn("No hay datos para generar el PDF");
      return;
    }

    addHeader(pdf, true);

    // Agregar el nombre de la línea
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    const lineTitle = `LÍNEA: ${lineaId.nombre}`;
    const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
    const titleY = 50;
    pdf.text(lineTitle, titleX, titleY);

    let currentY = marginTop + titleHeight + 5;

    // Agrupar por sublínea
    const sublineasData = groupBySublinea(data);
    const sortedSublineas = Object.keys(sublineasData).sort();

    // Una sola tabla: la sublínea como fila dentro de la grilla
    const bodyRows = [];
    sortedSublineas.forEach((sublinea) => {
      const sublineaItems = sublineasData[sublinea];
      sublineaItems.sort((a, b) =>
        a.articulo_nombre.localeCompare(b.articulo_nombre)
      );

      const subRow = [
        {
          content: sublinea,
          colSpan: 4,
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

      sublineaItems.forEach((row) => {
        const medicion =
          row.articulo_medicion === "-" ? "" : row.articulo_medicion;
        bodyRows.push([
          row.codigo_producto,
          row.articulo_nombre + " " + medicion,
          "$" +
            Math.ceil(parseFloat(row.costo) || 0).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
          "$" +
            Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString(
              "es-ES",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            ),
        ]);
      });
    });

    pdf.autoTable({
      startY: currentY,
      head: [["Código", "Artículo", "Costo", "Precio"]],
      body: bodyRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      // IMPORTANTE: deja margen superior en páginas siguientes para no chocar con el header/logo
      margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
      tableWidth: pageWidth - 10,
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
      },
      didDrawPage: () => {
        addHeader(pdf, false);
      },
      didParseCell: (data) => {
        if (data.row?.raw?.__isSublineaHeader) {
          data.cell.styles.fillColor = [230, 230, 230];
          data.cell.styles.textColor = 0;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
          data.cell.styles.fontSize = 9;
        }
      },
    });

    pdf.save(`Articulos_${lineaId.nombre}.pdf`);
  };
  const handleImprimirMedicamentos = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getArticulosByLineaID/69`
      );
      const data = response.data;
      const linea = "Medicamentos"; // Ahora es solo un string
      handleGeneratePDFMedicamentos(data, linea);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleGeneratePDFMedicamentos = (data, lineaId) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;

    if (!data || data.length === 0 || !lineaId) {
      console.warn("No hay datos para generar el PDF");
      return;
    }

    // Agregar el nombre de la línea centrado en la parte superior
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    const lineTitle = `LÍNEA: ${lineaId.toUpperCase()}`;
    const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
    pdf.text(lineTitle, titleX, 20);

    let currentY = 30; // Espacio antes de la tabla

    // Agrupar por sublínea
    const sublineasData = groupBySublinea(data);
    const sortedSublineas = Object.keys(sublineasData).sort();

    const bodyRows = [];
    sortedSublineas.forEach((sublinea) => {
      const sublineaItems = sublineasData[sublinea];
      sublineaItems.sort((a, b) =>
        a.articulo_nombre.localeCompare(b.articulo_nombre)
      );

      const subRow = [
        {
          content: sublinea,
          colSpan: 4,
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

      sublineaItems.forEach((row) => {
        const medicion =
          row.articulo_medicion === "-" ? "" : row.articulo_medicion;
        bodyRows.push([
          row.codigo_producto,
          row.articulo_nombre + " " + medicion,
          "$" +
            Math.ceil(parseFloat(row.costo) || 0).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
          "$" +
            Math.ceil(parseFloat(row.precio_monotributista) || 0).toLocaleString(
              "es-ES",
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            ),
        ]);
      });
    });

    pdf.autoTable({
      startY: currentY,
      head: [["Código", "Artículo", "Costo", "Precio"]],
      body: bodyRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      // En Medicamentos no hay logo, pero dejamos margen para que no pegue al borde
      margin: { top: 20, right: 5, bottom: 5, left: 5 },
      tableWidth: pageWidth - 10,
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.row?.raw?.__isSublineaHeader) {
          data.cell.styles.fillColor = [230, 230, 230];
          data.cell.styles.textColor = 0;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
          data.cell.styles.fontSize = 9;
        }
      },
    });

    pdf.save(`Articulos_${lineaId}.pdf`);
  };

  return (
    <MenuLayout>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={() => window.history.back()}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Volver
        </Button>
        <Button
          onClick={handleGeneratePDF}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Generar Lista de Artículos
        </Button>
        <Button
          onClick={openDrawer}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Imprimir por linea
        </Button>
        <Button
          onClick={handleImprimirMedicamentos}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Imprimir Medicamentos
        </Button>
      </div>
      <Drawer
        title="Imprimir por línea"
        placement="right"
        closable={true}
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        <LineaInput onChangeLinea={setLineaId} />
        <Button
          onClick={getArticulosByLineaID}
          type="primary"
          style={{ marginTop: 10 }}
        >
          Imprimir
        </Button>
      </Drawer>
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
