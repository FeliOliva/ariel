import React, { useState } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import VendedoresInput from "../components/VendedoresInput";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function ResumenPagosPorVendedor() {
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVendedorChange = (id, option) => {
    console.log("id", id, "option", option);
    setVendedorSeleccionado({ id, nombre: option.label });
  };

  const fetchData = async () => {
    console.log("Vendedor seleccionado:", vendedorSeleccionado);
    console.log("Rango de fechas:", rangoFechas);
    if (!vendedorSeleccionado || rangoFechas.length !== 2) {
      message.warning("Por favor selecciona un vendedor y un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas;
    setLoading(true);

    try {
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

      setDatos(response.data);
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
      render: (text) =>
        text ? `$${Math.round(text).toLocaleString("es-ES")}` : "",
    },
    {
      title: "Método de Pago",
      dataIndex: "metodo_pago",
      key: "metodo_pago",
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (record) =>
        `${record.cliente_farmacia} - ${record.cliente_nombre} ${record.cliente_apellido}`,
    },
  ];

  // Generar PDF
  const handlePrint = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Pagos de ${vendedorSeleccionado?.nombre || ""}`, 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0]} a ${rangoFechas[1]}`
        : "Sin rango de fechas";
    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);

    const tableData = datos
      .filter((d) => d.pago_id !== null) // excluye la fila TOTAL en detalle
      .map((d) => [
        d.fecha_pago ? dayjs(d.fecha_pago).format("DD-MM-YYYY") : "",
        `$${Math.round(d.monto).toLocaleString("es-ES")}`,
        d.metodo_pago,
        `${d.cliente_farmacia} - ${d.cliente_nombre} ${d.cliente_apellido}`,
      ]);

    doc.autoTable({
      startY: 45,
      head: [["Fecha", "Monto", "Método", "Cliente"]],
      body: tableData,
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    const totalRow = datos.find((d) => d.cliente_farmacia === "TOTAL");

    if (totalRow) {
      doc.setFontSize(12);
      doc.text(
        `TOTAL PAGOS: $${Math.round(totalRow.monto).toLocaleString("es-ES")}`,
        14,
        finalY
      );
    }

    doc.save("resumen_pagos_vendedor.pdf");
  };

  const totalPagos = datos.find((d) => d.cliente_farmacia === "TOTAL");

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de Pagos por Vendedor</h2>
        <VendedoresInput onChange={handleVendedorChange} />
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
          dataSource={datos.filter((d) => d.cliente_farmacia !== "TOTAL")}
          columns={columns}
          rowKey={(record) => record.pago_id}
          loading={loading}
          pagination={false}
          bordered
          style={{ backgroundColor: "#f9f9f9" }}
        />

        {totalPagos && (
          <div style={{ marginTop: 20, fontSize: "16px", fontWeight: "bold" }}>
            <p>
              Total Pagos: $
              {Math.round(totalPagos.monto).toLocaleString("es-ES")}
            </p>
          </div>
        )}
      </div>
    </MenuLayout>
  );
}
