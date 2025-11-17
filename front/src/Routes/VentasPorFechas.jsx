import React, { useState } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "../style/style.css";
import CustomPagination from "../components/CustomPagination";

const { RangePicker } = DatePicker;

export default function ResumenVentasPorFecha() {
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const parseMonto = (valor) => {
    if (valor === null || valor === undefined || valor === "") return 0;

    if (typeof valor === "string") {
      if (valor.includes(",")) {
        const normalizado = valor.replace(/\./g, "").replace(",", ".");
        return parseFloat(normalizado);
      }
      return parseFloat(valor);
    }

    return Number(valor);
  };

  const formatMonto = (valor) => {
    const numero = parseMonto(valor);
    if (isNaN(numero)) return "";

    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
  };

  const fetchData = async () => {
    if (rangoFechas.length !== 2) {
      message.warning("Por favor selecciona un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/getVentasPorFecha`,
        {
          params: {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
          },
        }
      );
      console.log("data", response.data);
      const datosOrdenados = response.data.sort(
        (a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta)
      );

      setDatos(datosOrdenados);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar las ventas.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha_venta",
      key: "fecha_venta",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : ""),
    },
    {
      title: "Número de Venta",
      dataIndex: "nroVenta",
      key: "nroVenta",
      render: (text) => text || "",
    },
    {
      title: "Total",
      dataIndex: "total_con_descuento",
      key: "total_con_descuento",
      render: (text) => (text ? `$${formatMonto(text)}` : ""),
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (record) =>
        `${record.farmacia || ""} - ${record.nombre_cliente || ""} ${
          record.apellido_cliente || ""
        }`,
    },
  ];

  // PDF de ventas
  const handlePrint = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Ventas`, 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0]} a ${rangoFechas[1]}`
        : "Sin rango de fechas";
    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);

    const tableData = datos
      .filter((d) => d.farmacia !== "TOTAL")
      .map((d) => [
        d.fecha_venta ? dayjs(d.fecha_venta).format("DD-MM-YYYY") : "",
        d.nroVenta || "",
        `$${formatMonto(d.total_con_descuento)}`,
        `${d.farmacia || ""} - ${d.nombre_cliente || ""} ${
          d.apellido_cliente || ""
        }`,
      ]);

    doc.autoTable({
      startY: 45,
      head: [["Fecha", "Nro Venta", "Monto", "Cliente"]],
      body: tableData,
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    const totalRow = datos.find((d) => d.farmacia === "TOTAL");

    if (totalRow) {
      doc.setFontSize(12);
      doc.text(
        `TOTAL VENTAS: $${formatMonto(totalRow.total_con_descuento)}`,
        14,
        finalY
      );
    }

    doc.save("resumen_ventas.pdf");
  };

  const totalVentas = datos.find((d) => d.farmacia === "TOTAL");

  // Paginación manual para poder usar tu CustomPagination
  const ventasSinTotal = datos.filter((d) => d.farmacia !== "TOTAL");
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = ventasSinTotal.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de Ventas por Rango de Fechas</h2>
        <Space style={{ margin: "20px 0" }}>
          <RangePicker
            onChange={(dates, dateStrings) => setRangoFechas(dateStrings)}
          />
          <Button type="primary" onClick={fetchData} loading={loading}>
            Cargar Datos
          </Button>
          <Button onClick={handlePrint} disabled={datos.length === 0}>
            Imprimir Lista
          </Button>
          <Button
            onClick={() => window.history.back()}
            type="primary"
            style={{ marginLeft: "auto" }}
          >
            Volver
          </Button>
        </Space>

        <Table
          dataSource={paginatedData}
          columns={columns}
          rowKey={(record) =>
            record.venta_id || `${record.nroVenta}-${record.fecha_venta}`
          }
          loading={loading}
          pagination={false} // 👈 usamos CustomPagination, no el de AntD
          bordered
          style={{ backgroundColor: "#f9f9f9" }}
        />

        <CustomPagination
          rowsPerPage={rowsPerPage}
          rowCount={ventasSinTotal.length}
          currentPage={currentPage}
          onChangePage={setCurrentPage}
        />

        {totalVentas && (
          <div style={{ marginTop: 20, fontSize: "16px", fontWeight: "bold" }}>
            <p>Total Ventas: ${formatMonto(totalVentas.monto)}</p>
          </div>
        )}
      </div>
    </MenuLayout>
  );
}
