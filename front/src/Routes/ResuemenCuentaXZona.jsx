import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, DatePicker } from "antd";
import axios from "axios";
import ZonasInput from "../components/ZonasInput";
import MenuLayout from "../components/MenuLayout";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function ResumenCuentaXZona() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [totalesZona, setTotalesZona] = useState({
    totalVentas: 0,
    totalPagos: 0,
    totalNotasCredito: 0,
    totalSaldoInicial: 0,
    saldoGlobal: 0,
  });
  const [usarSaldoInicial, setUsarSaldoInicial] = useState(false);

  const handleZonaChange = (zona) => {
    setZonaSeleccionada(zona);
  };
  useEffect(() => {
    const inicio = dayjs("2026-01-01");
    const fin = dayjs();
    setRangoFechas([inicio, fin]);
  }, []);

  const fetchData = async () => {
    if (!zonaSeleccionada || rangoFechas.length !== 2) {
      message.warning("Por favor selecciona una zona y un rango de fechas.");
      return;
    }

    const [fechaInicio, fechaFin] = rangoFechas.map((d) =>
      d.format("YYYY-MM-DD")
    );
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/resumenCuentaZona/${zonaSeleccionada.id}`,
        { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }
      );

      const responseData = response.data || {};
      setDatos(Array.isArray(responseData.datos) ? responseData.datos : []);
      setTotalesZona(
        responseData.totales || {
          totalVentas: 0,
          totalPagos: 0,
          totalNotasCredito: 0,
          totalSaldoInicial: 0,
          saldoGlobal: 0,
        }
      );
      setUsarSaldoInicial(Boolean(responseData.usarSaldoInicial));
      setSaldoInicial(Number(responseData.saldo_total_cierre) || 0);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = totalesZona.totalVentas || 0;
  const totalPagos = totalesZona.totalPagos || 0;
  const totalNotasCredito = totalesZona.totalNotasCredito || 0;
  const totalSaldoInicialPorCliente = totalesZona.totalSaldoInicial || 0;
  const saldoGlobal = totalesZona.saldoGlobal || 0;

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
          ? `$${Math.round(text).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
            })}`
          : text,
    },
    {
      title: "Total Notas de Crédito",
      dataIndex: "totalNotasCredito",
      key: "totalNotasCredito",
      render: (text) =>
        typeof text === "number"
          ? `$${Math.round(text).toLocaleString("es-ES", {
              minimumFractionDigits: 0,
            })}`
          : text,
    },
    {
      title: "Saldo Inicial",
      dataIndex: "saldoInicial",
      key: "saldoInicial",
      render: (text) => {
        const saldoInicialCliente = parseFloat(text || 0);
        if (!usarSaldoInicial) {
          return "$0";
        }
        return `$${Math.round(saldoInicialCliente).toLocaleString("es-ES", { minimumFractionDigits: 0 })}`;
      },
    },
    {
      title: "Saldo Restante",
      dataIndex: "saldo",
      key: "saldo",
      render: (text) =>
        typeof text === "number"
          ? `$${text.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`
          : text,
    },
  ];

  const handlePrint = () => {
    const doc = new jsPDF();

    let titulo = `Resumen de cuentas en la ${zonaSeleccionada.nombreZona}`;

    let fontSize = 18;
    doc.setFontSize(fontSize);

    // Si el texto supera el ancho permitido, bajamos la fuente
    if (doc.getTextWidth(titulo) > 180) {
      fontSize = 14;
      doc.setFontSize(fontSize);
    }

    // Split automático para evitar cortes
    const tituloPartes = doc.splitTextToSize(titulo, 180);

    doc.text(tituloPartes, 14, 20);

    const rangoInfo =
      rangoFechas.length === 2
        ? `${rangoFechas[0].format("DD/MM/YYYY")} a ${rangoFechas[1].format(
            "DD/MM/YYYY"
          )}`
        : "Sin rango de fechas";

    doc.setFontSize(12);
    doc.text(`Rango de fechas: ${rangoInfo}`, 14, 30);

    const totalVentasGlobal = totalesZona.totalVentas || 0;
    const totalPagosGlobal = totalesZona.totalPagos || 0;
    const totalNotasCreditoGlobal = totalesZona.totalNotasCredito || 0;
    const totalSaldoInicialGlobal = totalesZona.totalSaldoInicial || 0;
    const saldoGlobal = totalesZona.saldoGlobal || 0;

    // Construcción de la tabla: agregué localidad COMO SEGUNDO CAMPO después del nombre
    const tableData = datos.map((d) => {
      const saldoInicialCliente = d.saldoInicial || 0;
      return [
        d.nombre,
        d.localidad, // <- localidad agregada aquí
        `$${Math.round(d.totalVentas).toLocaleString("es-ES")}`,
        `$${Math.round(d.totalPagos).toLocaleString("es-ES")}`,
        `$${Math.round(d.totalNotasCredito).toLocaleString("es-ES")}`,
        usarSaldoInicial ? `$${Math.round(saldoInicialCliente).toLocaleString("es-ES")}` : "$0",
        `$${Math.round(d.saldo || 0).toLocaleString("es-ES")}`,
      ];
    });

    doc.autoTable({
      startY: 45,
      head: [
        [
          "Cliente",
          "Localidad", // <- nuevo encabezado
          "Total Ventas",
          "Total Pagos",
          "Total Notas de Crédito",
          "Saldo Inicial",
          "Saldo Restante",
        ],
      ],
      body: tableData,
    });

    // Agregar resumen de totales al final (lo dejé tal cual)
    let finalY = doc.lastAutoTable.finalY + 10;

    // Si estamos muy cerca del borde inferior, agregamos una nueva página
    if (finalY + 30 > doc.internal.pageSize.height) {
      doc.addPage();
      finalY = 20; // Reiniciamos la altura para empezar desde arriba en la nueva página
    }
    doc.setFontSize(12);
    doc.text(
      `Total Ventas: $${Math.round(totalVentasGlobal).toLocaleString("es-ES")}`,
      14,
      finalY
    );
    doc.text(
      `Total Pagos: $${Math.round(totalPagosGlobal).toLocaleString("es-ES")}`,
      14,
      finalY + 7
    );
    doc.text(
      `Total Notas de Crédito: $${Math.round(
        totalNotasCreditoGlobal
      ).toLocaleString("es-ES")}`,
      14,
      finalY + 14
    );
    if (usarSaldoInicial) {
      doc.text(
        `Total Saldo Inicial: $${Math.round(totalSaldoInicialGlobal).toLocaleString("es-ES")}`,
        14,
        finalY + 21
      );
      doc.text(
        `Saldo Global: $${Math.round(saldoGlobal).toLocaleString("es-ES")}`,
        14,
        finalY + 28
      );
    } else {
      doc.text(
        `Saldo Global: $${Math.round(saldoGlobal).toLocaleString("es-ES")}`,
        14,
        finalY + 21
      );
    }

    doc.save("resumen_cuentas.pdf");
  };

  return (
    <MenuLayout>
      <div>
        <h2>Resumen de cuentas por Zona</h2>
        <ZonasInput onChangeZona={handleZonaChange} />
        <Space style={{ margin: "20px 0" }}>
          <RangePicker
            value={rangoFechas}
            onChange={(dates) => setRangoFechas(dates)}
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
        <div style={{ marginTop: 20, fontSize: "16px", fontWeight: "bold" }}>
          <p>
            Total Ventas: ${Math.round(totalVentas).toLocaleString("es-ES")}
          </p>
          <p>Total Pagos: ${Math.round(totalPagos).toLocaleString("es-ES")}</p>
          <p>
            Total Notas de Crédito: $
            {Math.round(totalNotasCredito).toLocaleString("es-ES")}
          </p>
          {usarSaldoInicial && (
            <p>
              Total Saldo Inicial: ${Math.round(totalSaldoInicialPorCliente).toLocaleString("es-ES")}
            </p>
          )}
          <p>
            Saldo Global: ${Math.round(saldoGlobal).toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </MenuLayout>
  );
}
