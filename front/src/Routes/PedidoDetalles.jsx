import React, { useEffect, useState } from "react";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, InputNumber, notification, Modal } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  customCellsStyles,
  customHeaderStyles,
} from "../style/dataTableStyles";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importación necesaria para usar autoTable
import { EditOutlined } from "@ant-design/icons";
const PedidoDetalles = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detallePedido, setDetallePedido] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const { confirm } = Modal;
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/detallesPedido/${id}`
        );
        if (isMounted) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error al obtener detalles del pedido:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleGeneratePedidoPDF = () => {
    if (!data.length) {
      console.warn("No hay datos para generar el PDF.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    // Encabezado
    pdf.setFontSize(14);
    pdf.text("PEDIDO", 105, 20, { align: "center" });

    pdf.setFontSize(10);
    pdf.text(`Pedido N°: ${id}`, 10, 40);
    pdf.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 150, 40);

    // Línea divisoria
    pdf.line(10, 50, 200, 50);

    // Datos de la tabla
    const tableData = data.map((detalle) => [
      detalle.cantidad,
      `${detalle.cod_producto} - ${detalle.nombre_articulo} - ${detalle.mediciones}`,
      detalle.nombre_linea,
    ]);

    // Renderizar la tabla
    pdf.autoTable({
      startY: 55,
      head: [["Cant", "Nombre", "Linea"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Cantidad
        1: { cellWidth: 90 }, // Descripción (ajustado)
        2: { cellWidth: 90 },
      },
      margin: { top: 10, right: 10, bottom: 20 },
    });

    let finalY = pdf.lastAutoTable.finalY + 10;

    if (finalY > 270) {
      pdf.addPage();
      finalY = 20;
    }

    // Guardar PDF
    pdf.save(`Pedido_${id}.pdf`);
  };
  const handleEdit = async (detalleId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/detallePedidoById/${detalleId}`
      );
      setDetallePedido(response.data);
      setCantidad(response.data.cantidad); // Setea la cantidad actual
      setOpen(true);
    } catch (error) {
      console.log("Error al obtener detalle del pedido:", error);
    }
  };
  const handleEditPedido = async () => {
    if (!detallePedido) return;
    confirm({
      title: "Confirmar",
      content: "¿Desea editar el detalle de pedido?",
      okText: "Si",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.put(
            "http://localhost:3001/pedido/detalle",
            {
              detalleId: detallePedido.detalle_pedido_id,
              nuevaCantidad: cantidad,
            }
          );

          // Actualiza los datos de la tabla sin recargar
          setData((prevData) =>
            prevData.map((item) =>
              item.detalle_pedido_id === detallePedido.detalle_pedido_id
                ? { ...item, cantidad }
                : item
            )
          );
          notification.success({
            message: "Exito",
            description: "Detalle editado con exito",
            duration: 2,
          });
          setOpen(false); // Cierra el modal después de actualizar
        } catch (error) {
          console.error("Error al actualizar la cantidad:", error);
        }
      },
    });
  };
  const columns = [
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
      name: "Nombre",
      selector: (row) =>
        `${row.cod_producto} - ${row.nombre_articulo} - ${row.mediciones}`,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "left" }}>
          {`${row.nombre_articulo} - ${row.mediciones}`}
        </div>
      ),
    },
    {
      name: "Linea",
      selector: (row) => row.nombre_linea,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "center" }}>
          {row.nombre_linea}
        </div>
      ),
    },
    {
      name: "Editar",
      selector: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleEdit(row.detalle_pedido_id)}
        >
          <EditOutlined />
        </Button>
      ),
    },
  ];

  return (
    <MenuLayout>
      <h1>Detalles de pedido</h1>
      <Button onClick={() => window.history.back()} type="primary">
        Volver
      </Button>
      <Button
        onClick={handleGeneratePedidoPDF}
        type="primary"
        style={{ marginLeft: 10 }}
        disabled={loading || data.length === 0}
      >
        Generar Pedido
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Editar Pedido"
        style={{ padding: 0 }}
      >
        {detallePedido && (
          <>
            <Input
              value={`${detallePedido.nombre_articulo} - ${detallePedido.mediciones} - ${detallePedido.nombre_linea}`}
              readOnly
            />
            <InputNumber
              value={cantidad}
              onChange={(value) => setCantidad(value)}
            />
            <Button onClick={handleEditPedido}>Guardar Cambios</Button>
          </>
        )}
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        pagination
        progressPending={loading}
        customStyles={{
          headCells: customHeaderStyles,
          cells: customCellsStyles,
        }}
      />
    </MenuLayout>
  );
};

export default PedidoDetalles;
