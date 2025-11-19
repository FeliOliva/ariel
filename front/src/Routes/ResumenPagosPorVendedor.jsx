import React, { useState } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import VendedoresInput from "../components/VendedoresInput";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "../style/style.css";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import CustomPagination from "../components/CustomPagination";

const { RangePicker } = DatePicker;

export default function ResumenPagosPorVendedor() {
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleVendedorChange = (id, option) => {
    console.log("id", id, "option", option);
    setVendedorSeleccionado({ id, nombre: option.label });
  };

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
    if (!vendedorSeleccionado || rangoFechas.length !== 2) {
      message.warning("Por favor selecciona un vendedor y un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas;
    setLoading(true);

    try {
      // 🔹 Un solo vendedor
      if (vendedorSeleccionado.id !== "ALL") {
        const response = await axios.get(
          `http://localhost:3001/pagosPorVendedor`,
          {
            params: {
              vendedor_id: vendedorSeleccionado.id,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin,
            },
          }
        );

        const datosOrdenados = response.data
          .filter((d) => d.pago_id !== null)
          .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

        setDatos(datosOrdenados);
        setCurrentPage(1);
        return;
      }

      // 🔹 Todos los vendedores
      const respVendedores = await axios.get(
        "http://localhost:3001/vendedores"
      );
      const vendedores = respVendedores.data || [];

      const allResults = [];
      for (const vend of vendedores) {
        const respPagos = await axios.get(
          "http://localhost:3001/pagosPorVendedor",
          {
            params: {
              vendedor_id: vend.id,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin,
            },
          }
        );
        const pagosLimpios = (respPagos.data || []).filter(
          (d) => d.pago_id !== null
        );
        allResults.push(...pagosLimpios);
      }

      const datosOrdenados = allResults.sort(
        (a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago)
      );

      setDatos(datosOrdenados);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar los pagos.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha_pago",
      key: "fecha_pago",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : ""),
    },
    {
      title: "Monto",
      dataIndex: "monto",
      key: "monto",
      render: (text) => (text ? `$${formatMonto(text)}` : ""),
    },
    {
      title: "Método de Pago",
      dataIndex: "metodo_pago",
      key: "metodo_pago",
      render: (text) => (text ? text.toUpperCase() : ""),
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (record) =>
        `${record.cliente_farmacia} - ${record.cliente_nombre} ${record.cliente_apellido}`,
    },
    {
      title: "Vendedor",
      dataIndex: "vendedor_nombre",
      key: "vendedor_nombre",
      render: (text) => text || "",
    },
  ];

  // 🔹 Filtramos solo pagos reales (por si algún día vuelven a meter fila TOTAL)
  const pagosReales = datos.filter((d) => d.pago_id !== null);

  // 🔹 Total de pagos
  const totalPagosNumero = pagosReales.reduce(
    (sum, d) => sum + parseMonto(d.monto),
    0
  );

  // 🔹 Cantidad de pagos
  const cantidadPagos = pagosReales.length;

  // 🔹 Paginación manual
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = pagosReales.slice(startIndex, startIndex + rowsPerPage);

  // Generar PDF
  const handlePrint = () => {
    const doc = new jsPDF();

    const titulo =
      vendedorSeleccionado?.id === "ALL"
        ? "Pagos de todos los vendedores"
        : `Pagos de ${vendedorSeleccionado?.nombre || ""}`;

    doc.setFontSize(18);
    doc.text(titulo, 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0]} a ${rangoFechas[1]}`
        : "Sin rango de fechas";
    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);

    const tableData = pagosReales.map((d) => [
      d.fecha_pago ? dayjs(d.fecha_pago).format("DD-MM-YYYY") : "",
      `$${formatMonto(d.monto)}`,
      d.metodo_pago ? d.metodo_pago.toUpperCase() : "",
      `${d.cliente_farmacia} - ${d.cliente_nombre} ${d.cliente_apellido}`,
      d.vendedor_nombre || "",
    ]);

    doc.autoTable({
      startY: 45,
      head: [["Fecha", "Monto", "Método", "Cliente", "Vendedor"]],
      body: tableData,
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    if (totalPagosNumero > 0) {
      doc.setFontSize(12);
      doc.text(`TOTAL PAGOS: $${formatMonto(totalPagosNumero)}`, 14, finalY);
      finalY += 8;
    }

    doc.text(`CANTIDAD DE PAGOS: ${cantidadPagos}`, 14, finalY);

    doc.save("resumen_pagos_vendedor.pdf");
  };

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de Pagos por Vendedor</h2>

        <VendedoresInput
          onChange={handleVendedorChange}
          includeAllOption={true}
        />

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
          rowKey={(record) => record.pago_id}
          loading={loading}
          pagination={false}
          bordered
          style={{ backgroundColor: "#f9f9f9" }}
        />

        <CustomPagination
          rowsPerPage={rowsPerPage}
          rowCount={pagosReales.length}
          currentPage={currentPage}
          onChangePage={setCurrentPage}
        />

        {/* 👉 Cantidad de pagos */}
        <div style={{ marginTop: 10, fontSize: "14px" }}>
          <p>
            Cantidad de pagos: <strong>{cantidadPagos}</strong>
          </p>
        </div>

        {totalPagosNumero > 0 && (
          <div style={{ marginTop: 20, fontSize: "16px", fontWeight: "bold" }}>
            <p>Total Pagos: ${formatMonto(totalPagosNumero)}</p>
          </div>
        )}
      </div>
    </MenuLayout>
  );
}
