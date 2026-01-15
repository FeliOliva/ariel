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
      const [clientesResponse, ventasResponse, pagosResponse, notasCreditoResponse, saldoInicialRes, cierresResponse] =
        await Promise.all([
          axios.get(`http://localhost:3001/getClientesByZona/${zonaSeleccionada.id}`),
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
          axios.get(`http://localhost:3001/cierre-masivo/saldo-total`, {
            params: { fecha_corte: "2026-01-01" }
          }),
          axios.get(`http://localhost:3001/cierres-cuenta-zona`, {
            params: { fecha_corte: "2026-01-01", zona_id: zonaSeleccionada.id }
          }).then((response) => {
            console.log("Respuesta cierres por zona - zona_id:", zonaSeleccionada.id);
            console.log("Respuesta cierres por zona - response:", response);
            console.log("Respuesta cierres por zona - response.data:", response.data);
            return response;
          }).catch((error) => {
            console.error("========== ERROR OBTENIENDO CIERRES POR ZONA ==========");
            console.error("zona_id:", zonaSeleccionada.id);
            console.error("Error completo:", error);
            console.error("Error response:", error.response);
            console.error("Error response data:", error.response?.data);
            console.error("Error response status:", error.response?.status);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            return { data: [] };
          }),
        ]);

      const clientes = clientesResponse.data || [];
      const ventas = ventasResponse.data || [];
      const pagos = pagosResponse.data || [];
      const notasCredito = notasCreditoResponse.data || [];
      
      // ========== LOGS DETALLADOS ==========
      console.log("========== DATOS RECIBIDOS ==========");
      console.log("Rango de fechas:", fechaInicio, "a", fechaFin);
      console.log("Zona seleccionada ID:", zonaSeleccionada.id, "tipo:", typeof zonaSeleccionada.id);
      console.log("Total clientes:", clientes.length);
      console.log("Total ventas recibidas:", ventas.length);
      console.log("Total pagos recibidos:", pagos.length);
      console.log("Total notas de crédito recibidas:", notasCredito.length);
      
      // Logs de clientes (primeros 3)
      console.log("Primeros 3 clientes:", clientes.slice(0, 3).map(c => ({ id: c.id, nombre: c.nombre, apellido: c.apellido, zona_id: c.zona_id })));
      
      // Logs de ventas
      console.log("Ventas recibidas (primeras 5):", ventas.slice(0, 5));
      if (ventas.length > 0) {
        console.log("Ejemplo de venta:", ventas[0]);
      }
      
      // Logs de pagos
      console.log("Pagos recibidos (primeros 5):", pagos.slice(0, 5));
      if (pagos.length > 0) {
        console.log("Ejemplo de pago:", pagos[0]);
      }
      
      // Logs de notas de crédito
      console.log("Notas de crédito recibidas (primeras 5):", notasCredito.slice(0, 5));
      if (notasCredito.length > 0) {
        console.log("Ejemplo de nota de crédito:", notasCredito[0]);
      }
      
      // El endpoint devuelve un array directamente
      // Manejar correctamente cuando response.data es null o undefined
      let cierres = [];
      if (cierresResponse && cierresResponse.data) {
        if (Array.isArray(cierresResponse.data)) {
          cierres = cierresResponse.data;
        } else if (cierresResponse.data === null || cierresResponse.data === undefined) {
          // Si es null/undefined, es válido (significa que no hay cierres)
          cierres = [];
        }
      }
      
      console.log("cierresResponse completo:", cierresResponse);
      console.log("cierresResponse.data:", cierresResponse.data);
      console.log("cierres procesados:", cierres);
      console.log("Total cierres:", cierres.length);

      console.log("Cierres obtenidos:", cierres);
      console.log("Total cierres:", cierres.length);
      if (cierres.length > 0) {
        console.log("Primeros 3 cierres:", cierres.slice(0, 3));
      }

      // Crear un mapa de saldos iniciales por cliente_id
      const saldosInicialesPorCliente = {};
      cierres.forEach((cierre) => {
        if (cierre && cierre.cliente_id) {
          const clienteId = cierre.cliente_id;
          const saldo = parseFloat(cierre.saldo_cierre || 0);
          saldosInicialesPorCliente[clienteId] = saldo;
          
          // Log específico para MACKINSON
          if (cierre.farmacia && cierre.farmacia.toUpperCase().includes("MACKINSON")) {
            console.log("========== MACKINSON EN CIERRES ==========");
            console.log("Cierre completo:", cierre);
            console.log("cliente_id:", clienteId, "tipo:", typeof clienteId);
            console.log("saldo_cierre:", saldo);
            console.log("farmacia:", cierre.farmacia);
            console.log("zona_id:", cierre.zona_id);
          }
        }
      });
      
      console.log("Saldos iniciales por cliente:", saldosInicialesPorCliente);
      console.log("Total saldos iniciales mapeados:", Object.keys(saldosInicialesPorCliente).length);
      
      // Buscar MACKINSON específicamente en los cierres
      const mackinsonCierre = cierres.find(c => c.farmacia && c.farmacia.toUpperCase().includes("MACKINSON"));
      if (mackinsonCierre) {
        console.log("========== MACKINSON ENCONTRADO EN CIERRES ==========");
        console.log("Cierre:", mackinsonCierre);
      } else {
        console.log("========== MACKINSON NO ENCONTRADO EN CIERRES ==========");
        console.log("Total cierres:", cierres.length);
        console.log("Cierres con farmacia MACKINSON:", cierres.filter(c => c.farmacia && c.farmacia.toUpperCase().includes("MACKINSON")));
      }

      // Crear mapas para ventas, pagos y notas de crédito por cliente_id
      const ventasPorCliente = {};
      ventas.forEach((venta) => {
        const clienteId = venta.cliente_id;
        if (!ventasPorCliente[clienteId]) {
          ventasPorCliente[clienteId] = 0;
        }
        ventasPorCliente[clienteId] += parseFloat(venta.total_ventas || 0);
      });
      console.log("Ventas por cliente:", ventasPorCliente);
      console.log("Total clientes con ventas:", Object.keys(ventasPorCliente).length);

      const pagosPorCliente = {};
      pagos.forEach((pago) => {
        const clienteId = pago.cliente_id;
        if (!pagosPorCliente[clienteId]) {
          pagosPorCliente[clienteId] = 0;
        }
        pagosPorCliente[clienteId] += parseFloat(pago.total_pagos || 0);
      });
      console.log("Pagos por cliente:", pagosPorCliente);
      console.log("Total clientes con pagos:", Object.keys(pagosPorCliente).length);

      const notasCreditoPorCliente = {};
      notasCredito.forEach((nc) => {
        const clienteId = nc.cliente_id;
        if (!notasCreditoPorCliente[clienteId]) {
          notasCreditoPorCliente[clienteId] = 0;
        }
        notasCreditoPorCliente[clienteId] += parseFloat(nc.total || 0);
      });
      console.log("Notas de crédito por cliente:", notasCreditoPorCliente);
      console.log("Total clientes con notas de crédito:", Object.keys(notasCreditoPorCliente).length);

      const fechaInicioDayjs = rangoFechas?.[0];
      const usarSaldoInicial = fechaInicioDayjs && dayjs(fechaInicioDayjs).isAfter(dayjs("2025-12-31"));
      console.log("¿Usar saldo inicial?", usarSaldoInicial, "fecha inicio:", fechaInicioDayjs?.format("YYYY-MM-DD"));

      // Crear datos para TODOS los clientes de la zona
      const datos = clientes
        .filter((cliente) => cliente.estado === 1) // Solo clientes activos
        .map((cliente) => {
          const cliente_id = cliente.id;
          const totalVentas = ventasPorCliente[cliente_id] || 0;
          const totalPagos = pagosPorCliente[cliente_id] || 0;
          const totalNotasCredito = notasCreditoPorCliente[cliente_id] || 0;
          const saldoInicialCliente = saldosInicialesPorCliente[cliente_id] || 0;
          const saldoRestante = totalVentas - totalPagos - totalNotasCredito + (usarSaldoInicial ? saldoInicialCliente : 0);

          // Log detallado para MACKINSON
          if (cliente.nombre && cliente.nombre.toUpperCase().includes("MACKINSON")) {
            console.log("========== MACKINSON DEBUG ==========");
            console.log("Cliente ID:", cliente_id);
            console.log("Cliente completo:", cliente);
            console.log("Total ventas encontrado:", totalVentas, "en mapa:", ventasPorCliente[cliente_id]);
            console.log("Total pagos encontrado:", totalPagos, "en mapa:", pagosPorCliente[cliente_id]);
            console.log("Total notas crédito encontrado:", totalNotasCredito, "en mapa:", notasCreditoPorCliente[cliente_id]);
            console.log("Saldo inicial encontrado:", saldoInicialCliente, "en mapa:", saldosInicialesPorCliente[cliente_id]);
            console.log("¿Usar saldo inicial?", usarSaldoInicial);
            console.log("Saldo restante calculado:", saldoRestante);
            console.log("Ventas en array original:", ventas.filter(v => v.cliente_id === cliente_id));
            console.log("Pagos en array original:", pagos.filter(p => p.cliente_id === cliente_id));
            console.log("Cierres en array original:", cierres.filter(c => c.cliente_id === cliente_id));
          }

          return {
            cliente_id: cliente_id,
            nombre: `${cliente.farmacia || ''} - ${cliente.nombre} ${cliente.apellido}`,
            localidad: cliente.localidad || '',
            totalVentas,
            totalPagos,
            totalNotasCredito,
            saldoInicial: saldoInicialCliente,
            saldo: saldoRestante,
          };
        });

      console.log("========== DATOS FINALES ==========");
      console.log("Datos finales (primeros 5):", datos.slice(0, 5));
      console.log("Ejemplo de saldo inicial en datos:", datos.find(d => d.saldoInicial > 0));
      console.log("Cliente MACKINSON en datos finales:", datos.find(d => d.nombre && d.nombre.toUpperCase().includes("MACKINSON")));

      setDatos(datos);
      setSaldoInicial(parseFloat(saldoInicialRes.data.saldo_total || 0));
    } catch (error) {
      console.error("Error al obtener datos:", error);
      message.error("Hubo un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = datos.reduce((sum, d) => sum + d.totalVentas, 0);
  const totalPagos = datos.reduce((sum, d) => sum + d.totalPagos, 0);
  const totalNotasCredito = datos.reduce(
    (sum, d) => sum + d.totalNotasCredito,
    0
  );
  // Si la fecha de inicio es >= 2026-01-01, sumar el saldo inicial al saldo global
  const fechaInicio = rangoFechas?.[0];
  const usarSaldoInicial = fechaInicio && dayjs(fechaInicio).isAfter(dayjs("2025-12-31"));
  const totalSaldoInicialPorCliente = datos.reduce(
    (sum, d) => sum + (d.saldoInicial || 0),
    0
  );
  const saldoGlobal = totalVentas - totalPagos - totalNotasCredito + (usarSaldoInicial ? totalSaldoInicialPorCliente : 0);

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
      render: (text, record) => {
        const saldoInicialCliente = parseFloat(text || 0);
        const fechaInicio = rangoFechas?.[0];
        const usarSaldoInicial = fechaInicio && dayjs(fechaInicio).isAfter(dayjs("2025-12-31"));
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

    const totalVentasGlobal = datos.reduce((sum, d) => sum + d.totalVentas, 0);
    const totalPagosGlobal = datos.reduce((sum, d) => sum + d.totalPagos, 0);
    const totalNotasCreditoGlobal = datos.reduce(
      (sum, d) => sum + d.totalNotasCredito,
      0
    );
    const totalSaldoInicialGlobal = datos.reduce(
      (sum, d) => sum + (d.saldoInicial || 0),
      0
    );
    // Si la fecha de inicio es >= 2026-01-01, sumar el saldo inicial al saldo global
    const fechaInicio = rangoFechas?.[0];
    const usarSaldoInicial = fechaInicio && dayjs(fechaInicio).isAfter(dayjs("2025-12-31"));
    const saldoGlobal =
      totalVentasGlobal - totalPagosGlobal - totalNotasCreditoGlobal + (usarSaldoInicial ? totalSaldoInicialGlobal : 0);

    // Construcción de la tabla: agregué localidad COMO SEGUNDO CAMPO después del nombre
    const tableData = datos.map((d) => {
      const saldoInicialCliente = d.saldoInicial || 0;
      const saldo = d.totalVentas - d.totalPagos - d.totalNotasCredito + (usarSaldoInicial ? saldoInicialCliente : 0);
      return [
        d.nombre,
        d.localidad, // <- localidad agregada aquí
        `$${Math.round(d.totalVentas).toLocaleString("es-ES")}`,
        `$${Math.round(d.totalPagos).toLocaleString("es-ES")}`,
        `$${Math.round(d.totalNotasCredito).toLocaleString("es-ES")}`,
        usarSaldoInicial ? `$${Math.round(saldoInicialCliente).toLocaleString("es-ES")}` : "$0",
        `$${Math.round(saldo).toLocaleString("es-ES")}`,
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
