import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button } from "antd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../logoAriel.png"; // Importa la imagen

const VentaDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nroVenta, setNroVenta] = useState("");
  const [cliente, setCliente] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        if (response.data && response.data.length > 0) {
          setData(response.data);
          setNroVenta(response.data[0].nroVenta);
          setCliente(response.data[0].nombre_cliente_completo); // Almacena el nombre completo
        }
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleGeneratePDF = () => {
    const input = document.getElementById("pdf-content");

    // Ajusta la escala para mejorar la calidad de la imagen
    html2canvas(input, { scale: 2.5 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Ancho de la página en mm (tamaño máximo)
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Agregar título
      pdf.setFontSize(24); // Aumenta el tamaño del título
      pdf.text("Distribuidora Renacer", 10, 20);

      // Agregar nombre del emisor
      pdf.setFontSize(14); // Ajusta el tamaño del texto
      pdf.text("Emitido por: Ariel Bosco", 10, 30);

      // Agregar nombre del destinatario
      pdf.text(`Dirigido a: ${cliente}`, 10, 40); // Usa el estado cliente

      // Agregar imagen importada
      pdf.addImage(logo, "PNG", 160, 10, 30, 30);

      // Agregar contenido de la tabla
      pdf.addImage(imgData, "PNG", 0, 50, imgWidth, imgHeight);

      // Guardar el PDF
      pdf.save(`${nroVenta}.pdf`);
    });
  };

  const columns = [
    {
      name: "Código",
      selector: (row) => row.cod_articulo,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {row.cod_articulo}
        </div>
      ),
    },
    {
      name: "Descripción",
      selector: (row) => row.nombre_articulo,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {row.nombre_articulo}
        </div>
      ),
    },
    {
      name: "Unidades",
      selector: (row) => row.cantidad,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>{row.cantidad}</div>
      ),
    },
    {
      name: "Precio Unitario",
      selector: (row) => row.precio_monotributista,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {row.precio_monotributista}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.total_precio_monotributista,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {row.total_precio_monotributista}
        </div>
      ),
    },
  ];

  return (
    <MenuLayout>
      <div>
        <Button onClick={() => window.history.back()} type="primary">
          Volver
        </Button>
        <Button
          onClick={handleGeneratePDF}
          type="primary"
          style={{ marginLeft: 10 }}
        >
          Generar PDF
        </Button>
        <h1>Detalle de Venta {nroVenta}</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div id="pdf-content" style={{ padding: "50px" }}>
            <DataTable
              columns={columns}
              data={data}
              pagination={false}
              customStyles={{
                rows: {
                  style: {
                    minHeight: "60px", // Ajusta la altura mínima de las filas
                  },
                },
                headCells: {
                  style: {
                    fontSize: "30px", // Tamaño de fuente para los encabezados
                    padding: "12px", // Padding para las celdas de encabezado
                  },
                },
                cells: {
                  style: {
                    fontSize: "200px", // Tamaño de fuente para las celdas
                    padding: "10px", // Padding para las celdas
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </MenuLayout>
  );
};

export default VentaDetalles;
