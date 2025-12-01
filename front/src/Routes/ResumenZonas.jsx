import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function ResumenZonas() {
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const inicio = dayjs("2025-01-01");
    const fin = dayjs();
    setRangoFechas([inicio, fin]);
  }, []);
  const fetchData = async () => {
    if (rangoFechas.length !== 2) {
      message.warning("Por favor selecciona un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas.map((d) =>
      d.format("YYYY-MM-DD")
    );

    setLoading(true);

    try {
      const response = await axios.get("http://localhost:3001/resumenZonas", {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      });

      setDatos(response.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = datos.reduce(
    (sum, d) => sum + parseFloat(d.total_ventas),
    0
  );
  const totalPagos = datos.reduce(
    (sum, d) => sum + parseFloat(d.total_pagos),
    0
  );
  const totalNotasCredito = datos.reduce(
    (sum, d) => sum + parseFloat(d.total_notas_credito),
    0
  );
  const saldoGlobal = totalVentas - totalPagos - totalNotasCredito;

  const columns = [
    {
      title: "Zona",
      dataIndex: "nombre_zona",
      key: "nombre_zona",
    },
    {
      title: "Total Ventas",
      dataIndex: "total_ventas",
      key: "total_ventas",
      render: (text) => `$${Math.round(text).toLocaleString("es-ES")}`,
    },
    {
      title: "Total Pagos",
      dataIndex: "total_pagos",
      key: "total_pagos",
      render: (text) => `$${Math.round(text).toLocaleString("es-ES")}`,
    },
    {
      title: "Total Notas de Crédito",
      dataIndex: "total_notas_credito",
      key: "total_notas_credito",
      render: (text) => `$${Math.round(text).toLocaleString("es-ES")}`,
    },
    {
      title: "Saldo",
      key: "saldo",
      render: (_, record) => {
        const saldo = parseFloat(record.total_ventas) - parseFloat(record.total_pagos) - parseFloat(record.total_notas_credito);
        return `$${Math.round(saldo).toLocaleString("es-ES")}`;
      },
    },
  ];

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Resumen de Ventas por Zona", 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0].format("DD/MM/YYYY")} a ${rangoFechas[1].format(
            "DD/MM/YYYY"
          )}`
        : "Sin rango de fechas";

    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);
    const tableData = datos.map((d) => {
      const saldo = parseFloat(d.total_ventas) - parseFloat(d.total_pagos) - parseFloat(d.total_notas_credito);
      return [
        d.nombre_zona,
        `$${Math.round(d.total_ventas).toLocaleString("es-ES")}`,
        `$${Math.round(d.total_pagos).toLocaleString("es-ES")}`,
        `$${Math.round(d.total_notas_credito).toLocaleString("es-ES")}`,
        `$${Math.round(saldo).toLocaleString("es-ES")}`,
      ];
    });

    doc.autoTable({
      startY: 45,
      head: [["Zona", "Total Ventas", "Total Pagos", "Total Notas de Crédito", "Saldo"]],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(
      `Total Ventas: $${Math.round(totalVentas).toLocaleString("es-ES")}`,
      14,
      finalY
    );
    doc.text(
      `Total Pagos: $${Math.round(totalPagos).toLocaleString("es-ES")}`,
      14,
      finalY + 7
    );
    doc.text(
      `Total Notas de Crédito: $${Math.round(totalNotasCredito).toLocaleString(
        "es-ES"
      )}`,
      14,
      finalY + 14
    );
    doc.text(
      `Saldo Global: $${Math.round(saldoGlobal).toLocaleString("es-ES")}`,
      14,
      finalY + 21
    );

    doc.save("resumen_zonas.pdf");
  };

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de Ventas por Zona</h2>
        <Space style={{ margin: "20px 0" }}>
          <RangePicker
            value={rangoFechas}
            onChange={(dates) => setRangoFechas(dates)}
          />
          <Button type="primary" onClick={fetchData} loading={loading}>
            Cargar Datos
          </Button>
          <Button onClick={handlePrint} disabled={datos.length === 0}>
            Imprimir Resumen
          </Button>
          <Button onClick={() => window.history.back()}>Volver</Button>
        </Space>
        <Table
          dataSource={datos}
          columns={columns}
          rowKey={(record) => record.zona_id || "total"}
          loading={loading}
          pagination={false}
          bordered
          style={{ backgroundColor: "#f9f9f9" }}
        />
        <div style={{ marginTop: 20, fontSize: "16px", fontWeight: "bold" }}>
          <p>
            Total Ventas: ${Math.round(totalVentas).toLocaleString("es-ES")}
          </p>
          <p>Total Pagos: ${Math.round(totalPagos).toLocaleString("es-ES")}</p>
          <p>
            Total Notas de Crédito: $
            {Math.round(totalNotasCredito).toLocaleString("es-ES")}
          </p>
          <p>
            Saldo Global: ${Math.round(saldoGlobal).toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </MenuLayout>
  );
}
