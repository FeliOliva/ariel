import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import imageUrl from "../logoRenacer.png";

const ArticulosDetalles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/getArticulosOrdenados"
        );

        // Ordenar los datos por línea y sublínea
        const sortedData = response.data.sort((a, b) => {
          if (a.linea_nombre < b.linea_nombre) return -1;
          if (a.linea_nombre > b.linea_nombre) return 1;
          if (a.sublinea_nombre < b.sublinea_nombre) return -1;
          if (a.sublinea_nombre > b.sublinea_nombre) return 1;
          return 0;
        });

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const handleGeneratePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const marginTop = 40;
    const titleHeight = 10;
    const rowHeight = 7;
    const minRowsOnPage = 2;
    const logoWidth = 30;
    const logoHeight = 30;

    const phone = "Teléfono: +123 456 789";
    const instagram = "Instagram: @distribuidoraRenacer";

    // Function to add header with image and text
    const addHeader = (doc, isFirstPage = false) => {
      // Add logo to the top-left corner on all pages
      doc.addImage(imageUrl, "PNG", 5, 5, logoWidth, logoHeight);

      if (isFirstPage) {
        // First page: add text to the right of the logo
        doc.setFontSize(20);
        doc.text("Distribuidora Renacer", logoWidth + 10, 20);
        doc.setFontSize(12);
        doc.text(phone, logoWidth + 10, 30);
        doc.text(instagram, logoWidth + 10, 37);
      }
    };

    if (data.length > 0) {
      addHeader(pdf, true); // Header on the first page

      pdf.setFontSize(14);

      const groupedData = groupByLine(data);
      let currentY = marginTop;

      Object.keys(groupedData).forEach((line) => {
        const lineTitle = `LÍNEA ${line}`;
        const tableData = groupedData[line].map((row) => ({
          codigo: row.codigo_producto,
          nombre: row.articulo_nombre,
          sublinea: row.sublinea_nombre,
          precio: parseFloat(row.precio_monotributista).toLocaleString(
            "es-ES",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ),
        }));
        // Ajustar espacio si estamos en la primera página
        if (pdf.internal.getNumberOfPages() === 1 && currentY === marginTop) {
          currentY += 20; // Añadir espacio extra al primer título en la primera página
        }
        // If there's not enough space on the page, add a new one
        if (currentY + titleHeight + rowHeight * minRowsOnPage > pageHeight) {
          pdf.addPage();
          addHeader(pdf, false);
          currentY = marginTop;
        }

        // Print the title
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.setFillColor(255, 255, 255);
        const titleX = (pageWidth - pdf.getTextWidth(lineTitle)) / 2;
        pdf.rect(0, currentY - 5, pageWidth, titleHeight + 10, "F");
        pdf.text(lineTitle, titleX, currentY);
        currentY += titleHeight + 5;

        // Table configuration
        pdf.autoTable({
          startY: currentY,
          head: [["Código", "Artículo", "Sublínea", "Precio"]],
          body: tableData.map((row) => [
            row.codigo,
            row.nombre,
            row.sublinea,
            row.precio,
          ]),
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 1 },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: 0,
            fontStyle: "bold",
          },
          margin: { top: marginTop, right: 5, bottom: 5, left: 5 },
          tableWidth: pageWidth - 10,
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
          },
          didDrawPage: (data) => {
            addHeader(pdf, false);
          },
          willDrawCell: (data) => {
            const { row, column, section } = data;
            if (section === "body") {
              if (row.index % 2 === 0) {
                pdf.setFillColor(240, 240, 240);
              } else {
                pdf.setFillColor(255, 255, 255);
              }
            }
          },
        });

        // Update position for the next group
        currentY = pdf.lastAutoTable.finalY + 10;
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
        parseFloat(row.precio_monotributista).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }), // Aplicar formato de precio
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <Button
        onClick={() => window.history.back()}
        type="primary"
        style={{ marginBottom: 10 }}
      >
        Volver
      </Button>
      <div>
        <Button
          onClick={handleGeneratePDF}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Generar PDF
        </Button>

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
      </div>
    </MenuLayout>
  );
};

export default ArticulosDetalles;
