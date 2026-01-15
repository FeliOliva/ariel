import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  InputNumber,
  notification,
  Modal,
  message,
  Switch,
} from "antd";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  EditOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ArticulosInput from "../components/ArticulosInput";
import DynamicList from "../components/DynamicList";

// Función helper para limpiar números que vienen de la BD con formato español (puntos como separadores de miles)
const cleanNumber = (value) => {
  if (!value) return 0;
  // Si es string, remover puntos (separadores de miles) y comas (separadores decimales)
  // Luego convertir a número
  if (typeof value === "string") {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(value) || 0;
};

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
  const [open, setOpen] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState({});
  const [precio, setPrecio] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [articuloValue, setArticuloValue] = useState("");
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [modoAjuste, setModoAjuste] = useState("subir"); // subir | bajar
  const [porcentaje, setPorcentaje] = useState(0);

  const { confirm } = Modal;
  const [venta, setVenta] = useState({
    articulos: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
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
        console.log("Detalles de la venta:", response.data);
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
  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
    console.log(selectedArticulo);
    console.log(articulo);
  };
  const handleAddArticuloToList = () => {
    if (!selectedArticulo || !cantidad || cantidad <= 0) {
      notification.warning({
        message: "Datos incompletos",
        description: "Seleccione un artículo y una cantidad válida.",
      });
      return;
    }

    const uniqueId = `${selectedArticulo.id}-${Date.now()}`;

    setVenta((prev) => ({
      ...prev,
      articulos: [
        ...prev.articulos,
        {
          ...selectedArticulo,
          quantity: cantidad,
          precio_monotributista: selectedArticulo.precio_monotributista,
          price: selectedArticulo.precio_monotributista, // para usar en el DynamicList
          label:
            selectedArticulo.nombre +
            " - " +
            selectedArticulo.linea_nombre +
            " - " +
            (selectedArticulo.sublinea_nombre || ""),
          value: selectedArticulo.id,
          uniqueId,
          isGift: false,
        },
      ],
    }));

    // limpiar inputs
    setSelectedArticulo(null);
    setArticuloValue("");
    setCantidad(0);
  };
  const handleConfirmArticulos = () => {
    if (venta.articulos.length === 0) {
      notification.warning({
        message: "Sin artículos",
        description: "Agregá al menos un artículo antes de confirmar.",
      });
      return;
    }

    confirm({
      title: "Confirmar artículos",
      icon: <ExclamationCircleOutlined />,
      content: "¿Desea agregar estos artículos a la venta?",
      okText: "Sí",
      cancelText: "No",
      onOk: async () => {
        try {
          for (const art of venta.articulos) {
            await axios.post("http://localhost:3001/editarVenta", {
              articulo_id: art.id,
              cantidad: art.quantity,
              precio_monotributista: parseFloat(art.precio_monotributista),
              isGift: !!art.isGift,
              venta_id: ventaInfo.venta_id,
            });
          }

          notification.success({
            message: "Artículos agregados",
            description: "Los artículos se agregaron correctamente a la venta.",
            duration: 2,
          });

          setVenta({ articulos: [] });
          setOpen(false);

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error("Error al agregar artículos:", error);
          message.error("Error al agregar los artículos a la venta");
        }
      },
    });
  };

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

    // Datos de la tabla
    const tableData = data.map((row) => {
      const precio = cleanNumber(row.precio_monotributista);
      const importe = cleanNumber(row.sub_total);
      return {
        cantidad: row.cantidad,
        nombre: row.nombre,
        cod_articulo: row.cod_articulo,
        precio_unitario: `$${Math.ceil(precio).toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        importe: `$${importe.toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
      };
    });

    // Renderizar la tabla con margen inferior extra
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
        0: { cellWidth: 10 }, // Cantidad
        1: { cellWidth: 90 }, // Descripción
        2: { cellWidth: 30 }, // Código
        3: { cellWidth: 35 }, // Precio Unitario
        4: { cellWidth: 25 }, // Importe
      },
      pageBreak: "auto",
      margin: { top: 30, right: 15, bottom: 15 }, // Añadir margen inferior
    });

    // Posición final después de la tabla
    let finalY = pdf.lastAutoTable.finalY + 10;

    // Verificar si los totales entran en la página actual
    if (finalY > 270) {
      pdf.addPage();
      finalY = 20; // Reiniciar la posición en la nueva página
    }

    // Calcular descuentos
    const totalImporte = parseFloat(
      ventaInfo.total_importe.replace(".", "").replace(",", ".")
    );
    const descuentoMonto = (totalImporte * ventaInfo.descuento) / 100;
    const descuentoMontoRedondeado = Math.round(descuentoMonto);
    const descuentoMontoFormateado = descuentoMontoRedondeado.toLocaleString(
      "es-AR",
      { minimumFractionDigits: 0 }
    );

    // Agregar totales con espacio extra
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total: $${ventaInfo.total_importe}`, 10, finalY);
    pdf.text(
      `Descuento (${ventaInfo.descuento}%): $${descuentoMontoFormateado}`,
      10,
      finalY + 5
    );
    pdf.text(
      `Total con Descuento: $${ventaInfo.total_con_descuento}`,
      10,
      finalY + 10
    );

    // Guardar PDF
    pdf.save(`Factura_${ventaInfo.nroVenta}.pdf`);
  };

  const handleGeneratePDF2 = () => {
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

    // Datos de la tabla
    const tableData = data.map((row) => {
      const precio = cleanNumber(row.precio_monotributista);
      return {
        cantidad: row.cantidad,
        nombre: row.nombre,
        cod_articulo: row.cod_articulo,
        precio_unitario: `$${Math.ceil(precio).toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
      };
    });

    // Renderizar la tabla con margen inferior extra
    pdf.autoTable({
      startY: 65,
      head: [["Cant", "Descripción", "Código", "Precio Unitario"]],
      body: tableData.map((row) => [
        row.cantidad,
        row.nombre,
        row.cod_articulo,
        row.precio_unitario,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Cantidad
        1: { cellWidth: 110 }, // Descripción
        2: { cellWidth: 30 }, // Código
        3: { cellWidth: 35 }, // Precio Unitario
      },
      pageBreak: "auto",
      margin: { top: 30, right: 15, bottom: 15 }, // Añadir margen inferior
    });

    // Posición final después de la tabla
    let finalY = pdf.lastAutoTable.finalY + 10;

    // Verificar si los totales entran en la página actual
    if (finalY > 270) {
      pdf.addPage();
      finalY = 20; // Reiniciar la posición en la nueva página
    }

    pdf.text("Firma", 10, finalY);
    // Guardar PDF
    pdf.save(`Factura_${ventaInfo.nroVenta}.pdf`);
  };

  const handleEditPrice = async (detalleId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/detalleVenta/${detalleId}`
      );

      setDetalleVenta(response.data);
      setPrecio(Number(response.data.precio_monotributista) || 0);
      setCantidad(Number(response.data.cantidad) || 1);
      setOpenDrawer(true);
      setModoAjuste("subir");
      setPorcentaje(0);
    } catch (error) {
      console.error("Error fetching detalle de venta:", error);
    }
  };
  const handleDelete = (detalleId) => {
    confirm({
      title: "Confirmar eliminación",
      icon: <ExclamationCircleOutlined />,
      content: "¿Está seguro de eliminar este detalle de venta?",
      okText: "Sí",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(
            "http://localhost:3001/eliminarDetalleVenta",
            { data: { detalle_venta_id: detalleId } }
          );
          if (response.status === 200) {
            message.success("Detalle eliminado correctamente");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            message.error("Error al eliminar el detalle de venta");
          }
        } catch (error) {
          console.error("Error al eliminar el detalle de venta:", error);
          message.error("Error al eliminar el detalle de venta");
        }
      },
    });
  };

  const updatePrice = () => {
    confirm({
      title: "Confirmar cambio",
      icon: <ExclamationCircleOutlined />,
      content: "¿Está seguro de realizar este cambio?",
      okText: "Sí",
      cancelText: "No",
      onOk: async () => {
        try {
          const payload = {
            ID: detalleVenta.id,
            new_precio_monotributista: precio, // precio ya ajustado
            cantidad,
            venta_id: ventaInfo.venta_id,
          };

          await axios.put("http://localhost:3001/updateDetalleVenta", payload);

          message.success("Detalle actualizado correctamente");
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          console.error(err);
          message.error("Error al actualizar detalle");
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
      cell: (row) => {
        const precio = cleanNumber(row.precio_monotributista);
        const precioFormateado = Math.ceil(precio).toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
        return (
          <div style={{ fontSize: "12px", padding: "5px", textAlign: "right" }}>
            ${precioFormateado}
          </div>
        );
      },
    },
    {
      name: "Aumento",
      selector: (row) => row.aumento_porcentaje,
      sortable: true,
      cell: (row) => (
        <div style={{ fontSize: "12px", padding: "5px", textAlign: "right" }}>
          {Math.round(row.aumento_porcentaje)}%
        </div>
      ),
    },
    {
      name: "Importe",
      selector: (row) => row.sub_total,
      sortable: true,
      cell: (row) => {
        const importe = cleanNumber(row.sub_total);
        const importeFormateado = importe.toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
        return (
          <div style={{ fontSize: "12px", padding: "5px", textAlign: "right" }}>
            ${importeFormateado}
          </div>
        );
      },
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditPrice(row.detalle_venta_id)}
          ></Button>
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(row.detalle_venta_id)}
          ></Button>
        </div>
      ),
    },
  ];

  const handleEditPrecio = (uniqueId, newPrice) => {
    const updatedArticulos = venta.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, precio_monotributista: newPrice, price: newPrice }
        : item
    );
    setVenta((prevVenta) => ({ ...prevVenta, articulos: updatedArticulos }));
  };
  const handleDeleteArticulo = (uniqueId) => {
    setVenta((prev) => ({
      ...prev,
      articulos: prev.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      ),
    }));
  };
  const handleGiftChange = (uniqueId, isGift) => {
    setVenta((prev) => ({
      ...prev,
      articulos: prev.articulos.map((articulo) =>
        articulo.uniqueId === uniqueId
          ? {
              ...articulo,
              isGift, // Actualiza simplemente el estado de "isGift"
            }
          : articulo
      ),
    }));
  };

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
      <Button
        onClick={handleGeneratePDF2}
        type="primary"
        style={{ marginLeft: 10 }}
      >
        Generar Factura Reparto
      </Button>
      <Button
        onClick={() => setOpen(true)}
        type="primary"
        style={{ marginLeft: 10 }}
      >
        Agregar Artículo
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
      <div style={{ textAlign: "right", marginTop: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <strong style={{ marginRight: "8px" }}>Total:</strong>
          <span>${ventaInfo.total_importe}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <strong style={{ marginRight: "8px" }}>Descuento:</strong>
          <span>{ventaInfo.descuento}%</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <strong style={{ marginRight: "8px" }}>Total con Descuento:</strong>
          <span>${ventaInfo.total_con_descuento}</span>
        </div>
      </div>
      <Drawer
        title="Agregar Artículo"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={500}
      >
        {/* Selector de artículo + cantidad */}
        <ArticulosInput
          value={articuloValue}
          onChangeArticulo={handleArticuloChange}
          onInputChange={setArticuloValue}
        />

        <InputNumber
          style={{ width: "70%", marginTop: 16 }}
          min={1}
          onChange={(value) => setCantidad(value)}
          placeholder="Cantidad"
          value={cantidad}
        />

        <Button
          onClick={handleAddArticuloToList}
          type="primary"
          block
          style={{ marginTop: 16, width: "70%" }}
        >
          Agregar a la lista
        </Button>

        {/* Lista dinámica editable */}
        <div style={{ marginTop: 24 }}>
          <DynamicList
            items={venta.articulos}
            onDelete={handleDeleteArticulo}
            onGiftChange={handleGiftChange}
            onEdit={handleEditPrecio}
          />
        </div>

        {/* Confirmar y mandar al backend */}
        <Button
          type="primary"
          block
          style={{ marginTop: 16 }}
          onClick={handleConfirmArticulos}
          disabled={venta.articulos.length === 0}
        >
          Confirmar artículos
        </Button>
      </Drawer>

      {/* Drawer para AJUSTE PORCENTUAL de precio */}
      <Drawer
        title="Ajustar Precio y Cantidad"
        placement="right"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width={350}
      >
        {/* Precio base */}
        <div style={{ marginBottom: 12 }}>
          <strong>Precio actual:</strong>{" "}
          {detalleVenta?.precio_monotributista
            ? `$${detalleVenta.precio_monotributista}`
            : "-"}
        </div>

        {/* SWITCH SUBIR / BAJAR */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8 }}>Modo:</label>
          <Switch
            checkedChildren="AUM."
            unCheckedChildren="BAJ."
            checked={modoAjuste === "subir"}
            onChange={(checked) => {
              const nuevoModo = checked ? "subir" : "bajar";
              setModoAjuste(nuevoModo);

              const base = Number(detalleVenta.precio_monotributista) || 0;

              if (nuevoModo === "subir") {
                const nuevo = base * (1 + porcentaje / 100);
                setPrecio(Number(nuevo.toFixed(2)));
              } else {
                const nuevo = base * (1 - porcentaje / 100);
                setPrecio(Number(nuevo.toFixed(2)));
              }
            }}
          />
        </div>

        {/* Porcentaje */}
        <div style={{ marginBottom: 16 }}>
          <label>Porcentaje:</label>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={100}
            value={porcentaje}
            formatter={(v) => `${v}%`}
            parser={(v) => v.replace("%", "")}
            onChange={(value) => {
              const porc = Number(value) || 0;
              setPorcentaje(porc);

              const base = Number(detalleVenta.precio_monotributista) || 0;

              if (modoAjuste === "subir") {
                const nuevo = base * (1 + porc / 100);
                setPrecio(Number(nuevo.toFixed(2)));
              } else {
                const nuevo = base * (1 - porc / 100);
                setPrecio(Number(nuevo.toFixed(2)));
              }
            }}
          />
        </div>

        {/* Precio final */}
        <div style={{ marginBottom: 16 }}>
          <label>Precio final:</label>
          <InputNumber style={{ width: "100%" }} value={precio} readOnly />
        </div>

        {/* Cantidad */}
        <div style={{ marginBottom: 16 }}>
          <label>Cantidad:</label>
          <InputNumber
            style={{ width: "100%" }}
            min={1}
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
