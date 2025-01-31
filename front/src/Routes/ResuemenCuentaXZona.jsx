import React, { useState } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import ZonasInput from "../components/ZonasInput";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { RangePicker } = DatePicker;

export default function ResumenCuentaXZona() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleZonaChange = (zona) => {
    setZonaSeleccionada(zona);
  };

  const fetchData = async () => {
    if (!zonaSeleccionada || rangoFechas.length !== 2) {
      message.warning("Por favor selecciona una zona y un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas;
    setLoading(true);

    try {
      const [ventasResponse, pagosResponse, notasCreditoResponse] =
        await Promise.all([
          axios.get(`http://localhost:3001/ventasZona/${zonaSeleccionada.id}`, {
            params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
          }),
          axios.get(
            `http://localhost:3001/getPagosByZona_id/${zonaSeleccionada.id}`,
            {
              params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
            }
          ),
          axios.get(
            `http://localhost:3001/getNotasCreditoByZonaID/${zonaSeleccionada.id}`,
            {
              params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
            }
          ),
        ]);

      const ventas = ventasResponse.data;
      const pagos = pagosResponse.data;
      const notasCredito = notasCreditoResponse.data;

      const datos = ventas.map((venta) => {
        const pago = pagos.find((p) => p.cliente_id === venta.cliente_id);
        const notaCredito = notasCredito.find(
          (nc) => nc.cliente_id === venta.cliente_id
        );

        const totalNotasCredito = notaCredito
          ? parseFloat(notaCredito.total)
          : 0;
        const totalPagos = pago ? parseFloat(pago.total_pagos) : 0;
        const totalVentas = parseFloat(venta.total_ventas);

        // Calcular el saldo restante (Ventas - Pagos - Notas de Crédito)
        const saldoRestante = totalVentas - totalPagos - totalNotasCredito;

        return {
          cliente_id: venta.cliente_id,
          nombre: `${venta.cliente_farmacia} - ${venta.cliente_nombre} ${venta.cliente_apellido}`,
          totalVentas,
          totalPagos,
          totalNotasCredito: totalNotasCredito
            ? `$${totalNotasCredito.toLocaleString("es-ES", {
                minimumFractionDigits: 0,
              })}`
            : "Inexistente",
          saldo: saldoRestante
            ? `$${saldoRestante.toLocaleString("es-ES", {
                minimumFractionDigits: 0,
              })}`
            : "Inexistente",
        };
      });

      setDatos(datos);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Cliente",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Total Ventas",
      dataIndex: "totalVentas",
      key: "totalVentas",
      render: (text) =>
        `$${text.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`,
    },
    {
      title: "Total Pagos",
      dataIndex: "totalPagos",
      key: "totalPagos",
      render: (text) =>
        typeof text === "number"
          ? `$${text.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`
          : text,
    },
    {
      title: "Total Notas de Crédito",
      dataIndex: "totalNotasCredito",
      key: "totalNotasCredito",
      render: (text) => text,
    },
    {
      title: "Saldo Restante",
      dataIndex: "saldo",
      key: "saldo",
      render: (text) =>
        `${text.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`,
    },
  ];

  const handlePrint = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Resumen de cuentas en la ${zonaSeleccionada.nombreZona}`, 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0]} a ${rangoFechas[1]}`
        : "Sin rango de fechas";
    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);

    // Calcular totales
    const totalVentasGlobal = datos.reduce(
      (sum, d) => sum + (d.totalVentas || 0),
      0
    );
    const totalPagosGlobal = datos.reduce(
      (sum, d) => sum + (d.totalPagos || 0),
      0
    );
    const totalNotasCreditoGlobal = datos.reduce((sum, d) => {
      return (
        sum +
        (typeof d.totalNotasCredito === "string"
          ? 0
          : parseFloat(d.totalNotasCredito.replace("$", "").replace(",", "")))
      );
    }, 0);
    const diferencia = totalPagosGlobal + totalNotasCreditoGlobal;
    const saldoGlobal = totalVentasGlobal - diferencia;

    // Construcción de la tabla
    const tableData = datos.map((d) => [
      d.nombre,
      `$${d.totalVentas.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`,
      typeof d.totalPagos === "number"
        ? `$${d.totalPagos.toLocaleString("es-ES", {
            minimumFractionDigits: 0,
          })}`
        : d.totalPagos,
      d.totalNotasCredito,
      d.saldo,
    ]);

    doc.autoTable({
      startY: 45,
      head: [
        [
          "Cliente",
          "Total Ventas",
          "Total Pagos",
          "Total Notas de Crédito",
          "Saldo Restante",
        ],
      ],
      body: tableData,
    });

    // Agregar resumen de totales al final
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(
      `Total Ventas: $${totalVentasGlobal.toLocaleString("es-ES")}`,
      14,
      finalY
    );
    doc.text(
      `Total Pagos: $${totalPagosGlobal.toLocaleString("es-ES")}`,
      14,
      finalY + 7
    );
    doc.text(
      `Total Notas de Crédito: $${totalNotasCreditoGlobal.toLocaleString(
        "es-ES"
      )}`,
      14,
      finalY + 14
    );
    doc.text(
      `Diferencia (Saldo Global): $${saldoGlobal.toLocaleString("es-ES")}`,
      14,
      finalY + 21
    );

    doc.save("resumen_cuentas.pdf");
  };

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de cuentas por Zona</h2>
        <ZonasInput onChangeZona={handleZonaChange} />
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
          dataSource={datos}
          columns={columns}
          rowKey="cliente_id"
          loading={loading}
          pagination={false}
          bordered
          style={{ backgroundColor: "#f9f9f9" }}
        />
      </div>
    </MenuLayout>
  );
}
