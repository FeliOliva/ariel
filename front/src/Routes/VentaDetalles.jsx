import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button } from "antd";
import jsPDF from "jspdf";
import "jspdf-autotable";

const VentaDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        if (response.data && response.data.length > 0) {
          setData(response.data);
          console.log(response.data);
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
    const pdf = new jsPDF("p", "mm", "a4");

    if (data.length > 0) {
      const venta = data[0];

      // Encabezado de la factura
      pdf.setFontSize(10);
      pdf.text(`N° ${venta.nroVenta}`, 160, 20);
      pdf.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 160, 25);

      pdf.setFontSize(12);
      pdf.text(`( ${venta.id} ) - ${venta.nombre_cliente_completo}`, 10, 30);
      pdf.text(`${venta.direccion}`, 10, 35);
      pdf.text(`CUIL: ${venta.cuil}`, 10, 40);

      const estadoFiscal = venta.es_responsable_inscripto
        ? "RESPONSABLE INSCRIPTO"
        : "RESPONSABLE MONOTRIBUTO";
      pdf.text(estadoFiscal, 10, 45);

      pdf.text("CUENTA CORRIENTE", 10, 50);

      pdf.setFontSize(10);
      pdf.text("01-beto", 160, 45);

      // Preparación de los datos de la tabla
      const headers = [
        { title: "Cantidad", dataKey: "cantidad" },
        { title: "Artículo", dataKey: "nombre_articulo" },
        { title: "Unidades", dataKey: "Unidades" },
        { title: "P. Unitario", dataKey: "precio_monotributista" },
        { title: "Total", dataKey: "total_precio_monotributista" },
      ];

      const tableData = data.map((row) => ({
        cantidad: row.cantidad,
        nombre_articulo: row.nombre_articulo,
        Unidades: row.cantidad, // Ajustar según sea necesario
        precio_monotributista: parseFloat(row.precio_monotributista).toFixed(2),
        total_precio_monotributista: parseFloat(
          row.total_precio_monotributista
        ).toFixed(2),
      }));

      console.log("Datos de la tabla:", tableData); // Verifica el contenido antes de generar el PDF

      pdf.autoTable({
        head: [headers.map((header) => header.title)],
        body: tableData.map((row) =>
          headers.map((header) => row[header.dataKey])
        ),
        startY: 60,
        theme: "plain",
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
      });

      pdf.setFontSize(12);
      pdf.text(
        `Total: ${parseFloat(venta.total_importe).toFixed(2)}`,
        160,
        pdf.lastAutoTable.finalY + 10
      );

      pdf.save(`${venta.nroVenta}.pdf`);
    }
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
          {parseFloat(row.precio_monotributista).toFixed(2)}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.total_precio_monotributista,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {parseFloat(row.total_precio_monotributista).toFixed(2)}
        </div>
      ),
    },
  ];

  const totalImporte = data.reduce(
    (acc, item) => acc + parseFloat(item.total_precio_monotributista),
    0
  );

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
        <h1>Detalle de Venta {data.length > 0 ? data[0].nroVenta : ""}</h1>
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
                    fontSize: "20px", // Tamaño de fuente para las celdas
                    padding: "10px", // Padding para las celdas
                  },
                },
              }}
            />
            <div
              style={{
                textAlign: "right",
                marginTop: "20px",
                fontSize: "30px",
              }}
            >
              <strong>Total Importe: </strong> {totalImporte.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </MenuLayout>
  );
};

export default VentaDetalles;
