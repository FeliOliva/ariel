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
  message,
} from "antd";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

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
  const [openDrawer, setOpenDrawer] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState({});
  const [precio, setPrecio] = useState(0);
  const [cantidad, setCantidad] = useState(0);
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
        console.log("venta id", response.data.venta_id);
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

    // Tabla de detalles con alineación derecha para la cantidad
    const tableData = data.map((row) => ({
      cantidad: row.cantidad,
      nombre: row.nombre,
      cod_articulo: row.cod_articulo,
      precio_unitario: `$${Math.round(row.precio_monotributista)}`,
      importe: `$${Math.round(row.sub_total)}`,
    }));

    pdf.autoTable({
      startY: 65,
      head: [["Cant", "Descripción", "Código", "Precio Unitario", "Importe"]],
      body: tableData.map((row) => [
        row.cantidad,
        row.nombre,
        row.cod_articulo,
        row.precio_unitario,
        row.importe,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Cantidad alineada a la derecha
        1: { cellWidth: 70 }, // Descripción
        2: { cellWidth: 30 }, // Código
        3: { cellWidth: 35 }, // Precio Unitario
        4: { cellWidth: 35 }, // Importe
      },
    });

    // Calcular el monto del descuento (redondeado a entero)
    const descuentoMonto = Math.round(
      (ventaInfo.total_importe * ventaInfo.descuento) / 100
    );

    // Totales alineados a la izquierda
    const finalY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");

    pdf.text(`Total: $${Math.round(ventaInfo.total_importe)}`, 10, finalY);
    pdf.text(
      `Descuento (${ventaInfo.descuento}%): $${descuentoMonto}`,
      10,
      finalY + 5
    );
    pdf.text(
      `Total con Descuento: $${Math.round(ventaInfo.total_con_descuento)}`,
      10,
      finalY + 10
    );

    // Guardar PDF
    pdf.save(`Factura_${ventaInfo.nroVenta}.pdf`);
  };

  const handleEditPrice = async (detalleId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/detalleVenta/${detalleId}`
      );
      setDetalleVenta(response.data);
      setPrecio(response.data.precio_monotributista);
      setCantidad(response.data.cantidad);
      setOpenDrawer(true);
    } catch (error) {
      console.error("Error fetching detalle de venta:", error);
    }
  };

  const updatePrice = async () => {
    confirm({
      title: "Confirmar cambio de precio",
      icon: <ExclamationCircleOutlined />,
      content: "¿Está seguro de realizar este cambio?",
      okText: "Sí",
      cancelText: "No",
      onOk: async () => {
        try {
          const payload = {
            ID: detalleVenta.id,
            new_precio_monotributista: precio,
            cantidad,
            venta_id: ventaInfo.venta_id,
          };
          console.log("payload", payload);
          const response = await axios.put(
            "http://localhost:3001/updateDetalleVenta",
            payload
          );

          if (response.status === 200) {
            message.success("Detalle actualizado correctamente");
            setOpenDrawer(false);
            setData((prevData) =>
              prevData.map((item) =>
                item.id === detalleVenta.id
                  ? { ...item, precio_monotributista: precio, cantidad }
                  : item
              )
            );
          } else {
            message.error("Error al actualizar el detalle");
          }
        } catch (error) {
          console.error("Error al actualizar el detalle de venta:", error);
          message.error("Error al actualizar el detalle de venta");
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
      name: "Codigo",
      selector: (row) => row.cod_articulo,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "center" }}>
          {row.cod_articulo}
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
    // {
    //   name: "Acciones",
    //   cell: (row) => (
    //     <Button
    //       type="primary"
    //       icon={<EditOutlined />}
    //       onClick={() => handleEditPrice(row.detalle_venta_id)}
    //     ></Button>
    //   ),
    // },
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
        Generar Factura
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
      <Drawer
        title="Modificar Precio y Cantidad"
        placement="right"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
      >
        <div style={{ marginBottom: "16px" }}>
          <label>Precio:</label>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            value={precio}
            onChange={(value) => setPrecio(value)}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label>Cantidad:</label>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            value={cantidad}
            onChange={(value) => setCantidad(value)}
          />
        </div>
        <Button type="primary" block onClick={updatePrice}>
          Confirmar
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default VentaDetalles;
