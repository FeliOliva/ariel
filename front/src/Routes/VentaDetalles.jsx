import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Tooltip,
  InputNumber,
  notification,
  Modal,
} from "antd";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

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
    farmacia: "",
  });
  const [openUp, setOpenUp] = useState(false);
  const [openDown, setOpenDown] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState({});
  const { confirm } = Modal;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        console.log(response.data);
        const {
          detalles,
          venta_id,
          nombre_cliente,
          nroVenta,
          fecha,
          zona_nombre,
          total_importe,
          descuento,
          total_con_descuento,
          direccion,
          nombre_tipo_cliente,
          farmacia,
          localidad,
        } = response.data;

        if (Array.isArray(detalles)) {
          setData(detalles);
          setVentaInfo({
            venta_id,
            nombre_cliente,
            nroVenta,
            fecha,
            zona_nombre,
            total_importe,
            descuento: parseFloat(descuento),
            total_con_descuento,
            direccion,
            nombre_tipo_cliente,
            farmacia,
            localidad,
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

    // Encabezado
    pdf.setFontSize(14);
    pdf.text("FACTURA", 105, 20, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 105, 26, { align: "center" });

    pdf.setFontSize(10);
    pdf.text(`Farmacia: ${ventaInfo.farmacia}`, 10, 40);
    pdf.text(`Cliente: ${ventaInfo.nombre_cliente}`, 10, 45);
    pdf.text(`Dirección: ${ventaInfo.direccion}`, 10, 50);
    pdf.text(`Localidad: ${ventaInfo.localidad}`, 10, 55);

    const fecha = new Date(ventaInfo.fecha);
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const año = fecha.getFullYear();

    pdf.text(`Fecha: ${dia}/${mes}/${año}`, 150, 40);
    pdf.text(`Nro. Venta: ${ventaInfo.nroVenta}`, 150, 45);

    // Línea divisoria
    pdf.line(10, 60, 200, 60);

    // Tabla de detalles
    const tableData = data.map((row) => ({
      cantidad: row.cantidad,
      descripcion: row.nombre,
      precio_unitario: `$${Math.round(row.precio_monotributista)}`,
      importe: `$${Math.round(row.sub_total)}`,
    }));

    pdf.autoTable({
      startY: 65,
      head: [["Cantidad", "Descripción", "Precio Unitario", "Importe"]],
      body: tableData.map((row) => [
        row.cantidad,
        row.descripcion,
        row.precio_unitario,
        row.importe,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 90 },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    // Calcular el monto del descuento (redondeado a entero)
    const descuentoMonto = Math.round(
      (ventaInfo.total_importe * ventaInfo.descuento) / 100
    );

    // Totales alineados a la izquierda
    const finalY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(10); // Reducir tamaño de fuente
    pdf.setFont("helvetica", "bold");

    pdf.text(`Total: $${Math.round(ventaInfo.total_importe)}`, 10, finalY);
    pdf.text(
      `Descuento (${ventaInfo.descuento}%): $${descuentoMonto}`,
      10,
      finalY + 5 // Reducir espacio entre esta línea y la anterior
    );
    pdf.text(
      `Total con Descuento: $${Math.round(ventaInfo.total_con_descuento)}`,
      10,
      finalY + 10 // Reducir espacio entre esta línea y la anterior
    );
    // Guardar PDF
    pdf.save(`Factura_${ventaInfo.nroVenta}.pdf`);
  };

  const handleUpPrice = async (id) => {
    const response = await axios.get(
      `http://localhost:3001/detalleVenta/${id}`
    );
    setDetalleVenta({
      id: response.data.id,
      precio_monotributista: response.data.precio_monotributista,
      cantidad: response.data.cantidad,
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
      cantidad: response.data.cantidad,
    });
    setOpenDown(true);
  };

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "left" }}>
          {row.nombre}
        </div>
      ),
    },
    {
      name: "Unidades",
      selector: (row) => row.cantidad,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "center" }}>
          {row.cantidad}
        </div>
      ),
    },
    {
      name: "Precio Unitario",
      selector: (row) => row.precio_monotributista,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "right" }}>
          ${Math.round(row.precio_monotributista)}
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.sub_total,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "right" }}>
          ${Math.round(row.sub_total)}
        </div>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
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
      <h1>Detalle de Venta {ventaInfo.nroVenta}</h1>
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
        <DataTable
          columns={columns}
          data={data}
          pagination
          customStyles={{
            headCells: customHeaderStyles,
            cells: customCellsStyles,
          }}
        />
      )}
    </MenuLayout>
  );
};

export default VentaDetalles;
