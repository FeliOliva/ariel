import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Tooltip, InputNumber } from "antd";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const VentaDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaInfo, setVentaInfo] = useState({
    venta_id: "",
    nombre_cliente: "",
    nroVenta: "",
    fecha: "",
    zona_nombre: "",
    total: "",
    direccion: "",
    nombre_tipo_cliente: "",
    descuento: "",
  });
  const [openUp, setOpenUp] = useState(false);
  const [openDown, setOpenDown] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        console.log(id);
        console.log(response.data);
        const {
          detalles,
          venta_id, // Asegúrate de que el backend envíe el venta_id en la respuesta
          nombre_cliente,
          nroVenta,
          fecha,
          zona_nombre,
          total_importe,
          descuento,
          total_con_descuento,
          direccion,
          nombre_tipo_cliente,
        } = response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setVentaInfo({
            venta_id, // Guarda el venta_id en ventaInfo
            nombre_cliente,
            nroVenta,
            fecha,
            zona_nombre,
            total_importe,
            descuento,
            total_con_descuento,
            direccion,
            nombre_tipo_cliente,
          });
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
      pdf.text(`${ventaInfo.nombre_cliente}`, 10, 35);
      pdf.text(` ${ventaInfo.direccion}`, 10, 40);
      pdf.text(`${ventaInfo.zona_nombre}`, 10, 45);
      pdf.text(`${ventaInfo.nombre_tipo_cliente}`, 10, 50);

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
      pdf.line(10, 53, 200, 53);
      pdf.line(160, 30, 160, 53);

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
        tableWidth: "wrap", // Ajusta el ancho de la tabla para evitar columnas adicionales
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
          3: { cellWidth: 35 }, // Define el ancho exacto de la columna "Importe" para evitar espacio extra
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        bodyStyles: { lineWidth: 0.1 },
        tableLineWidth: 0.1,
      });

      // Calcula la posición vertical después de la tabla
      const finalY = pdf.lastAutoTable.finalY + 155;

      // Ajuste de alineación para el total, descuento y total con descuento
      const rightX = 140; // Ajustar el valor según el centro

      pdf.setFontSize(12);
      pdf.text(`Total Importe: ${ventaInfo.total}`, rightX, finalY);

      pdf.text(
        `Descuento: ${parseFloat(ventaInfo.descuento).toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}%`,
        rightX,
        finalY + 5
      );

      pdf.text(
        `Total con Descuento: ${parseFloat(ventaInfo.total).toLocaleString(
          "es-ES",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`,
        rightX,
        finalY + 10
      );

      // Número de venta en la parte inferior izquierda
      const bottomY = pdf.internal.pageSize.height - 10;
      pdf.setFontSize(10);
      pdf.text(`Nro Venta: ${ventaInfo.nroVenta}`, 10, bottomY);

      pdf.save(`${ventaInfo.nroVenta}.pdf`);
    }
  };

  const handleUpPrice = async (id) => {
    console.log(id);
    const response = await axios.get(
      `http://localhost:3001/detalleVenta/${id}`
    );
    setDetalleVenta({
      id: response.data.id,
      precio_monotributista: response.data.precio_monotributista,
    });
    setOpenUp(true);
  };
  const handleDownPrice = async (id) => {
    const response = await axios.get(
      `http://localhost:3001/detalleVenta/${id}`
    );
    setDetalleVenta({
      id: response.data.id,
      precio_monotributista: response.data.precio_monotributista,
    });
    setOpenDown(true);
  };
  const handleAplyUpFilter = async () => {
    const nuevoPrecioMonotributista = parseFloat(
      detalleVenta.precio_monotributista * (1 + detalleVenta.percentage / 100)
    );
    const newData = {
      ID: detalleVenta.id,
      id_venta: ventaInfo.venta_id, // Incluye el venta_id en el payload
      precio_monotributista: Math.round(nuevoPrecioMonotributista),
    };
    console.log("new data");
    console.log(newData);
    await axios.put(`http://localhost:3001/updateDetalleVenta`, newData);
    setOpenUp(false);
    window.location.reload();
  };
  const handleAplyDownFilter = async () => {
    const nuevoPrecioMonotributista = parseFloat(
      detalleVenta.precio_monotributista * (1 - detalleVenta.percentage / 100)
    );
    const newData = {
      ID: detalleVenta.id,
      id_venta: ventaInfo.venta_id, // Incluye el venta_id en el payload
      precio_monotributista: Math.round(nuevoPrecioMonotributista),
    };
    console.log(newData);
    await axios.put(`http://localhost:3001/updateDetalleVenta`, newData);
    setOpenUp(false);
    window.location.reload();
  };

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.nombre + row.mediciones,
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
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            className="custom-button"
            onClick={() => handleUpPrice(row.detalle_venta_id)}
            icon={<ArrowUpOutlined />}
          ></Button>
          <Button
            className="custom-button"
            onClick={() => handleDownPrice(row.detalle_venta_id)}
            icon={<ArrowDownOutlined />}
          ></Button>
        </div>
      ),
    },
  ];
  return (
    <MenuLayout>
      <Drawer
        open={openUp}
        onClose={() => setOpenUp(false)}
        title="Aumentar Precio"
      >
        <Tooltip>
          <strong>Porcentaje</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={VentaDetalles?.percentage}
            onChange={(value) =>
              setDetalleVenta((prev) => ({
                ...prev,
                percentage: value,
              }))
            }
          />{" "}
          <Button onClick={handleAplyUpFilter}>Aplicar</Button>
        </div>
      </Drawer>
      <Drawer
        open={openDown}
        onClose={() => setOpenDown(false)}
        title="Bajar Precio"
      >
        <Tooltip>
          <strong>Porcentaje</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={VentaDetalles?.percentage}
            onChange={(value) =>
              setDetalleVenta((prev) => ({
                ...prev,
                percentage: value,
              }))
            }
          />{" "}
          <Button onClick={handleAplyDownFilter}>Aplicar</Button>
        </div>
      </Drawer>
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
          <div id="pdf-content" style={{ padding: "50px", fontSize: "20px" }}>
            <DataTable
              columns={columns}
              data={data}
              pagination={false}
              customStyles={{
                headCells: {
                  style: {
                    ...customHeaderStyles,
                    fontSize: "20px",
                  },
                },
                cells: {
                  style: {
                    ...customCellsStyles,
                    fontSize: "30px",
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
              <div
                style={{
                  textAlign: "right",
                  marginTop: "20px",
                  fontSize: "30px",
                }}
              >
                <div>
                  <strong>Total importe:</strong>
                  {parseFloat(ventaInfo.total_importe).toLocaleString("es-ES", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div>
                  <strong>Descuento: %</strong>
                  {parseFloat(ventaInfo.descuento).toLocaleString("es-ES", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div>
                  <strong>Total con descuento: </strong>
                  {parseFloat(ventaInfo.total_con_descuento).toLocaleString(
                    "es-ES",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MenuLayout>
  );
};

export default VentaDetalles;
