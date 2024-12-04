import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";

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
    const marginTop = 20;
    const titleHeight = 10; // Altura aproximada del título
    const rowHeight = 10; // Altura aproximada por fila de la tabla
    const minRowsOnPage = 2; // Mínimo de filas que deben imprimirse con el título

    if (data.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Lista de Artículos", 10, marginTop);

      const groupedData = groupByLine(data);
      let currentY = marginTop + 10; // Inicializar después del título principal

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

        // Calcular el espacio necesario para el título y las primeras filas
        const requiredHeight =
          titleHeight + rowHeight * Math.min(minRowsOnPage, tableData.length);

        // Si no hay suficiente espacio en la página, agregar una nueva
        if (currentY + requiredHeight > pageHeight) {
          pdf.addPage();
          currentY = marginTop; // Reiniciar posición en la nueva página
        }

        // Imprimir el título
        const lineWidth = pdf.getTextWidth(lineTitle);
        const xPosition = (pdf.internal.pageSize.width - lineWidth) / 2;
        pdf.setFontSize(16);
        pdf.text(lineTitle, xPosition, currentY);
        currentY += titleHeight;

        // Imprimir la tabla
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
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10; // Actualizar posición para la siguiente línea
          },
        });
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
