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

      // Encabezado
      pdf.setFontSize(14);
      pdf.text("PRESUPUESTO", 10, 20);
      pdf.setFontSize(12);
      pdf.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 10, 25);
      pdf.text("X", 100, 20);

      pdf.setFontSize(10);
      pdf.line(10, 30, 200, 30); // Encima de "Señor/es"
      pdf.text(`Señor/es: ${venta.nombre_cliente_completo}`, 10, 35);
      pdf.text(`Dirección: ${venta.direccion}`, 10, 40);
      pdf.text(`Localidad: ${venta.direccion}`, 10, 45); // Puedes separar localidad si es necesario

      // Fecha
      const fecha = new Date(venta.fecha);
      pdf.line(160, 30, 160, 50); // División entre fecha y demás datos
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1; // Mes es 0-indexado
      const año = fecha.getFullYear();

      pdf.text(`Día: ${dia}`, 160, 35);
      pdf.text(`Mes: ${mes}`, 160, 40);
      pdf.text(`Año: ${año}`, 160, 45);

      // Tabla
      pdf.line(10, 50, 200, 50); // Encima de la tabla
      const tableData = data.map((row) => ({
        cantidad: row.cantidad,
        descripcion: row.nombre_articulo,
        precio_unitario: parseFloat(row.precio_monotributista).toFixed(2),
        importe: parseFloat(row.total_precio_monotributista).toFixed(2),
      }));

      pdf.autoTable({
        startY: 55,
        head: [["CANTIDAD", "DESCRIPCIÓN", "PRECIO UNITARIO", "IMPORTE"]],
        body: tableData.map((row) => [
          row.cantidad,
          row.descripcion,
          row.precio_unitario,
          row.importe,
        ]),
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 2,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 80 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        bodyStyles: { lineWidth: 0.1 },
        tableLineWidth: 0.1,
      });

      // Total
      pdf.text(
        `TOTAL: ${parseFloat(venta.total_importe).toFixed(2)}`,
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
      <h1>Detalle de Venta {data.length > 0 ? data[0].nroVenta : ""}</h1>
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
