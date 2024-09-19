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
  console.log(id);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaInfo, setVentaInfo] = useState({
    nombre_cliente: "",
    nroVenta: "",
    fecha: "",
    zona_nombre: "",
    total: "",
    direccion: "", // Asegúrate de inicializar dirección aquí
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );

        const {
          detalles,
          nombre_cliente,
          nroVenta,
          fecha,
          zona_nombre,
          total,
          direccion, // Asegúrate de que dirección se extraiga
        } = response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setVentaInfo({
            nombre_cliente,
            nroVenta,
            fecha,
            zona_nombre,
            total,
            direccion,
          });
          console.log(response.data);
        } else {
          console.error("Expected 'detalles' to be an array");
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
      // Encabezado
      pdf.setFontSize(14);
      pdf.text("PRESUPUESTO", 10, 20);
      pdf.setFontSize(12);
      pdf.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 10, 25);
      pdf.text("X", 100, 20);

      pdf.setFontSize(10);
      pdf.text(`Señor/es: ${ventaInfo.nombre_cliente}`, 10, 35);
      pdf.text(`Dirección: ${ventaInfo.direccion}`, 10, 40); // Se muestra la dirección correctamente
      pdf.text(`Localidad: ${ventaInfo.zona_nombre}`, 10, 45);

      const fecha = new Date(ventaInfo.fecha);
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const año = fecha.getFullYear();
      pdf.text(`_________________`, 160, 31);
      pdf.text(` | DIA | MES | AÑO  |`, 160, 35);
      pdf.text(`_________________`, 160, 36);
      pdf.text(` |  ${dia}  |    ${mes}    |${año}  |`, 160, 40);
      pdf.text(`_________________`, 160, 41);

      pdf.line(10, 30, 200, 30);
      pdf.line(10, 50, 200, 50);
      pdf.line(160, 30, 160, 50);

      const tableData = data.map((row) => ({
        cantidad: row.cantidad,
        descripcion: row.nombre,
        precio_unitario: parseFloat(row.precio_monotributista).toLocaleString(
          "es-ES",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ),
        importe: parseFloat(row.subtotal).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
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
          cellPadding: 3,
          halign: "center",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 80 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35 }, // Elimina los cuadros del costado de "Importe"
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        bodyStyles: { lineWidth: 0.1 },
        tableLineWidth: 0.1,
      });

      pdf.setFontSize(12);
      pdf.text(
        `TOTAL: ${parseFloat(ventaInfo.total).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        160,
        pdf.lastAutoTable.finalY + 10
      );

      pdf.save(`${ventaInfo.nroVenta}.pdf`);
    }
  };

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>{row.nombre}</div>
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
          {parseFloat(row.precio_monotributista).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.subtotal,
      sortable: true,
      cell: (row) => (
        <div style={{ padding: "5px", fontSize: "30px" }}>
          {parseFloat(row.subtotal).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const totalImporte = data
    .reduce((acc, item) => acc + parseFloat(item.subtotal), 0)
    .toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return (
    <MenuLayout>
      <h1>Detalle de Venta {ventaInfo.nroVenta}</h1>
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
                    minHeight: "60px",
                  },
                },
                headCells: {
                  style: {
                    fontSize: "30px",
                    padding: "12px",
                  },
                },
                cells: {
                  style: {
                    fontSize: "20px",
                    padding: "10px",
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
              <strong>Total Importe: </strong> {totalImporte}
            </div>
          </div>
        )}
      </div>
    </MenuLayout>
  );
};

export default VentaDetalles;
