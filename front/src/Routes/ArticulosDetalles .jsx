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

    const phone = "Teléfono: +54 9 3518 16-8151";
    const instagram = "Instagram: @distribuidoraRenacer";

    // Function to add header with image and text
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

    if (data.length > 0) {
      addHeader(pdf, true); // Header on the first page

      pdf.setFontSize(14);

      // Agrupar los datos por línea
      const groupedData = groupByLine(data);

      // Ordenar los artículos por nombre dentro de cada línea
      Object.keys(groupedData).forEach((line) => {
        groupedData[line].sort((a, b) =>
          a.articulo_nombre.localeCompare(b.articulo_nombre)
        );
      });

      let currentY = marginTop;

      Object.keys(groupedData).forEach((line) => {
        const lineTitle = `LÍNEA ${line}`;
        const tableData = groupedData[line].map((row) => ({
          codigo: row.codigo_producto,
          nombre: row.articulo_nombre + " " + row.articulo_medicion,
          sublinea: row.sublinea_nombre,
          precio:
            "$" +
            parseFloat(row.precio_monotributista).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
        }));

        if (pdf.internal.getNumberOfPages() === 1 && currentY === marginTop) {
          currentY += 20;
        }

        if (currentY + titleHeight + rowHeight * minRowsOnPage > pageHeight) {
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
