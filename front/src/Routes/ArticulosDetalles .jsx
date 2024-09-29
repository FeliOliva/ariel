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
        const response = await axios.get("http://localhost:3001/articulos");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGeneratePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    if (data.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Lista de Artículos", 10, 20);

      const tableData = data.map((row) => ({
        codigo: row.codigo_producto,
        nombre: row.nombre,
        precio: parseFloat(row.precio_monotributista).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }), // Formato de precio con dos decimales
      }));

      pdf.autoTable({
        startY: 30,
        head: [["Código", "Nombre", "Precio"]],
        body: tableData.map((row) => [
          row.codigo,
          row.nombre,
          row.precio, // Usar la propiedad 'precio' en vez de 'precio_monotributista'
        ]),
        theme: "grid",
        styles: { fontSize: 10 },
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
      selector: (row) => row.nombre,
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
