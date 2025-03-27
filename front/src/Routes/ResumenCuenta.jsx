import React, { useState, useEffect } from "react";
import {
  Button,
  DatePicker,
  Table,
  message,
  Tooltip,
  Drawer,
  InputNumber,
  Modal,
  notification,
  Dropdown,
  Space,
} from "antd";
import axios from "axios";
import ClienteInput from "../components/ClienteInput";
import AgregarPagoDrawer from "../components/AgregarPagoDrawer";
import MenuLayout from "../components/MenuLayout";
import DataTable from "react-data-table-component";
import isValid from "date-fns/isValid";
import { format } from "date-fns";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import CustomPagination from "../components/CustomPagination";
import ArticulosInput from "../components/ArticulosInput";
import DynamicListNC from "../components/DynamicListNC";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  CreditCardOutlined,
  PlusCircleOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "../style/style.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const ResumenCuenta = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerNCVisible, setDrawerNCVisible] = useState(false);
  const [articuloValue, setArticuloValue] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [notaCredito, setNotaCredito] = useState({
    articulos: [],
  });
  const [nextNroPago, setNextNroPago] = useState("00001");
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [pagoData, setPagoData] = useState(null);
  const [open, setOpen] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [openNC, setOpenNC] = useState(false);

  const { confirm } = Modal;
  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/resumenCliente/${clienteId}`,
        { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }
      );

      const filteredData = response.data
        .map((item) => ({
          ...item,
          uniqueId: `${item.tipo}-${item.id}`, // Genera un ID único
        }))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar de más reciente a más antigua

      setData(filteredData);
      console.log("data", filteredData);
      console.log("cliente", selectedCliente);
      // Buscar el número de pago más alto
      const highestNroPago = filteredData
        .filter((item) => item.tipo === "Pago" && item.numero) // Filtrar solo los pagos con número
        .map((item) => parseInt(item.numero, 10)) // Convertir a número entero
        .filter((num) => !isNaN(num)) // Filtrar valores NaN
        .sort((a, b) => b - a)[0]; // Obtener el número más alto

      // Calcular el siguiente número de pago
      const nextNro = highestNroPago ? highestNroPago + 1 : 1;
      setNextNroPago(nextNro.toString().padStart(5, "0")); // Formatear con ceros a la izquierda
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      message.error("No se pudo cargar la información del cliente");
    }
  };

  const handleSearch = () => {
    if (!selectedCliente) {
      return message.warning("Seleccione un cliente.");
    }
    if (!rangoFechas || rangoFechas.length !== 2) {
      return message.warning("Seleccione un rango de fechas.");
    }
    console.log("cliente", selectedCliente);
    console.log("rangoFechas", rangoFechas);
    setLoading(true);
    fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
  };

  const handleOpenEditDrawer = async (id, tipo) => {
    try {
      if (tipo != "Pago") {
        notification.warning({
          message: "No se puede editar",
          description: "Solo se pueden editar pagos",
          duration: 2,
        });
        return;
      }
      const response = await axios.get(
        `http://localhost:3001/getPagoById/${id}`
      );
      const data = response.data[0]; // Tomamos el primer objeto del array

      setPagoData({
        ...data,
        monto: parseFloat(data.monto),
        fecha_pago: data.fecha_pago ? dayjs(data.fecha_pago) : null,
      });

      setOpen(true);
    } catch (error) {
      console.error("Error al obtener los datos del pago:", error);
      message.error("No se pudo cargar la información del pago");
    }
  };
  const handleDetallesNC = async (id, tipo) => {
    try {
      if (tipo !== "Nota de Crédito") {
        notification.warning({
          message: "No se puede ver detalles",
          description: "Solo se pueden ver detalles de notas de crédito",
          duration: 2,
        });
        return;
      }
      const response = await axios.get(
        `http://localhost:3001/getDetallesNotaCredito/${id}`
      );
      console.log(response.data);
      setDetalles(response.data); // Guarda los detalles en el estado
      setOpenNC(true); // Abre el modal
    } catch (error) {
      console.error("Error al obtener los datos de la nota de crédito:", error);
      message.error("No se pudo cargar la información de la nota de crédito");
    }
  };

  const columns = [
    {
      name: "Fecha",
      selector: (row) => {
        const fecha = new Date(row.fecha);
        return isValid(fecha) ? (
          <Tooltip
            title={format(fecha, "dd/MM/yyyy")}
            className={row.estado === 0 ? "strikethrough" : ""}
          >
            <span>{format(fecha, "dd/MM/yyyy")}</span>
          </Tooltip>
        ) : (
          "Fecha no válida"
        );
      },
      sortable: true,
    },
    {
      name: "Tipo",
      selector: (row) => (
        <Tooltip
          title={row.tipo}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>{row.tipo}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip
          title={row.total_con_descuento || row.monto}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>
              ${row.total_con_descuento ? row.total_con_descuento : row.monto}
            </span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Numero",
      selector: (row) => (
        <Tooltip
          title={row.numero}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>{row.numero}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Metodo de pago",
      selector: (row) => (
        <Tooltip
          title={row.metodo_pago || "N/A"}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            <span>{row.metodo_pago ? row.metodo_pago : "N/A"}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Mostrar el botón de editar solo si el tipo es "pago" */}
          <Button
            className="custom-button"
            onClick={() => handleDetallesNC(row.id, row.tipo)}
            icon={<EyeOutlined />}
          />
          <Button
            className="custom-button"
            onClick={() => handleOpenEditDrawer(row.id, row.tipo)}
            icon={<EditOutlined />}
          />
          <Button
            className="custom-button"
            onClick={() => handleToggleState(row.id, row.estado, row.tipo)}
          >
            {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
          </Button>
        </div>
      ),
    },
  ];
  const handleToggleState = async (id, currentState, tipo) => {
    if (!selectedCliente || !rangoFechas || rangoFechas.length !== 2) {
      return message.warning(
        "Debe seleccionar un cliente y un rango de fechas."
      );
    }

    const toggleActions = {
      Venta: { drop: "dropVenta", up: "upVenta" },
      Pago: { drop: "dropPago", up: "upPago" },
      "Nota de Crédito": { drop: "dropNotaCredito", up: "upNotaCredito" },
    };

    const action = currentState === 1 ? "drop" : "up";
    const endpoint = toggleActions[tipo][action];

    confirm({
      title: `¿Está seguro de ${
        currentState ? "desactivar" : "activar"
      } esta ${tipo}?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`http://localhost:3001/${endpoint}/${id}`);
          notification.success({
            message: `${tipo} ${currentState ? "desactivado" : "activado"}`,
            description: `La ${tipo} se ${
              currentState ? "desactivó" : "activó"
            } exitosamente.`,
            duration: 1,
          });

          // Recargar datos actualizados
          fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
        } catch (error) {
          console.error(`Error al cambiar estado de la ${tipo}:`, error);
          message.error(
            `No se pudo ${currentState ? "desactivar" : "activar"} la ${tipo}.`
          );
        }
      },
    });
  };

  const calcularSaldoRestante = (data) => {
    // Función para limpiar y convertir valores numéricos
    const parseNumber = (value) => {
      return value ? parseInt(value.replace(/\./g, ""), 10) : 0;
    };

    // Sumar ventas activas
    const totalVentas = data
      .filter((item) => item.tipo === "Venta" && item.estado === 1)
      .reduce((sum, venta) => sum + parseNumber(venta.total_con_descuento), 0);

    // Sumar pagos y notas de crédito activas
    const totalPagosNotas = data
      .filter(
        (item) =>
          (item.tipo === "Pago" || item.tipo === "Nota de Crédito") &&
          item.estado === 1
      )
      .reduce(
        (sum, pago) =>
          sum + parseNumber(pago.monto || pago.total_con_descuento),
        0
      );

    // Saldo restante
    return totalVentas - totalPagosNotas;
  };

  // Ejemplo de uso con la data
  const saldoRestante = calcularSaldoRestante(data);
  console.log("Saldo Restante:", saldoRestante);

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
    console.log(selectedArticulo);
    console.log(articulo);
  };

  const handleAddArticulo = () => {
    if (selectedArticulo && cantidad > 0) {
      //ESTO ERA PARA VALIDAR QUE NO ENTRE MAS DE UN ARTICULO
      // const articuloExiste = venta.articulos.some(
      //   (articulo) => articulo.id === selectedArticulo.id
      // );

      // if (articuloExiste) {
      //   Modal.warning({
      //     title: "Advertencia",
      //     content: "Este artículo ya fue agregado en la venta.",
      //     icon: <ExclamationCircleOutlined />,
      //   });
      //   return;
      // }

      const uniqueId = `${selectedArticulo.id}-${Date.now()}`; // Generación del ID único
      setNotaCredito((prev) => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            ...selectedArticulo,
            quantity: cantidad,
            price: selectedArticulo.precio_monotributista,
            label:
              selectedArticulo.nombre +
              " - " +
              selectedArticulo.linea_nombre +
              " - " +
              selectedArticulo.sublinea_nombre,
            value: selectedArticulo.id,
            uniqueId,
            isGift: false,
          },
        ],
      }));
      console.log(notaCredito);
      setSelectedArticulo(null);
      setCantidad(0);
      setArticuloValue("");
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Seleccione un articulo y una cantidad valida",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  const handleDeleteArticulo = (uniqueId) => {
    setNotaCredito((prev) => ({
      ...prev,
      articulos: prev.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      ),
    }));
  };

  const handleEditPrecio = (uniqueId, newPrice) => {
    const updatedArticulos = notaCredito.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, precio_monotributista: newPrice, price: newPrice }
        : item
    );
    setNotaCredito((prevNC) => ({ ...prevNC, articulos: updatedArticulos }));
    console.log("Artículos actualizados: ", updatedArticulos);
  };

  const handleAddNotaCredito = async () => {
    if (notaCredito.articulos.length > 0) {
      try {
        const payLoad = {
          cliente_id: selectedCliente.id,
          detalles: notaCredito.articulos.map((articulo) => ({
            articulo_id: articulo.id, // Usamos el ID del artículo
            cantidad: articulo.quantity,
            precio: articulo.precio_monotributista
              ? articulo.precio_monotributista
              : articulo.price,
          })),
        };
        console.log("nota cred data", payLoad);
        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la nota de credito?",
          okText: "Si",
          cancelText: "No",
          onOk: async () => {
            await axios.post("http://localhost:3001/addNotaCredito", payLoad);
            notification.success({
              message: "Exito",
              description: "Nota de credito registrada con exito",
              duration: 2,
            });
            setDrawerNCVisible(false);
            setArticuloValue("");
            setCantidad(0);
            setNotaCredito({ articulos: [] });
            fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
          },
        });
      } catch (error) {
        console.error("Error al enviar la nota de credito:", error);
        alert("Error al registrar la nota de credito");
      }
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, complete todos los campos",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  const generateNotaCreditoPDF = async () => {
    if (!selectedCliente) {
      return message.warning("Por favor, seleccione un cliente.");
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/notasCreditoByClienteId/${selectedCliente.id}`
      );
      const notasCredito = response.data;

      if (!notasCredito || notasCredito.length === 0) {
        notification.warning({
          message: "No existen notas de crédito",
          description: "Para el cliente seleccionado",
          duration: 1,
        });
        return;
      }

      // Filtrar solo notas de crédito activas
      const notasCreditoActivas = notasCredito.filter(
        (nota) => nota.estado === 1
      );

      if (notasCreditoActivas.length === 0) {
        notification.warning({
          message: "No hay notas de crédito activas",
          description: "Para el cliente seleccionado",
          duration: 1,
        });
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Resumen de Notas de Crédito", 80, 20);

      // Agregar información del cliente
      doc.setFontSize(14);
      doc.text(
        `Cliente: ${selectedCliente.farmacia} ${selectedCliente.nombre} ${selectedCliente.apellido}`,
        14,
        30
      );

      let yPos = 40; // Posición inicial

      notasCreditoActivas.forEach((nota) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(`Nota de Crédito Nº ${nota.nroNC}`, 14, yPos);
        doc.text(
          `Fecha: ${new Date(nota.fecha).toLocaleDateString("es-ES")}`,
          150,
          yPos
        );

        yPos += 10;
        doc.setFontSize(12);

        // Tabla de detalles de la nota
        const tableData = nota.detalles.map((detalle) => [
          detalle.articulo_nombre,
          detalle.cantidad,
          `$${detalle.precio.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `$${detalle.subTotal.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ]);

        doc.autoTable({
          startY: yPos,
          head: [["Artículo", "Cantidad", "Precio", "Subtotal"]],
          body: tableData,
          theme: "grid",
          styles: { fontSize: 10 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text(
          `Total: $${nota.total.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          14,
          yPos
        );
        yPos += 15;
      });

      // Guardar el PDF con el nombre adecuado
      doc.save(`notas_credito_${selectedCliente.nombre}.pdf`);
    } catch (error) {
      console.error("Error al obtener las notas de crédito:", error);
      alert("Error al obtener las notas de crédito");
    }
  };

  const generateResumenCuentaPDF = () => {
    const doc = new jsPDF();

    // Filtrar solo registros con estado === 1
    const filteredData = data.filter((row) => row.estado === 1);

    // Título
    doc.setFontSize(16);
    doc.text("Resumen de Cuenta", 80, 20);

    // Información del cliente y rango de fechas
    doc.setFontSize(14);
    doc.text(`Farmacia: ${selectedCliente.farmacia}`, 14, 30);
    doc.text(
      `Cliente: ${selectedCliente.nombre} ${selectedCliente.apellido}`,
      14,
      40
    );
    doc.text(`Rango de Fechas: ${rangoFechas[0]} - ${rangoFechas[1]}`, 14, 50);

    let yPos = 60;

    // Generar tabla con los datos filtrados
    doc.autoTable({
      startY: yPos,
      head: [["Fecha", "Tipo", "Total", "Número", "Método de Pago"]],
      body: filteredData.map((row) => [
        new Date(row.fecha).toLocaleDateString("es-AR"), // Formato de fecha DD/MM/YYYY
        row.tipo,
        `$${
          row.total_con_descuento
            ? row.total_con_descuento.toLocaleString("es-AR")
            : row.monto.toLocaleString("es-AR")
        }`,
        row.numero,
        row.metodo_pago ? row.metodo_pago : "N/A",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Calcular nuevo saldo restante basado en los datos filtrados
    const totalVentas = filteredData
      .filter((item) => item.tipo === "Venta")
      .reduce(
        (sum, venta) => sum + parseFloat(venta.total_con_descuento || 0),
        0
      );

    const totalPagos = filteredData
      .filter((item) => item.tipo === "Pago")
      .reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);

    const totalNC = filteredData
      .filter((item) => item.tipo === "Nota de Crédito")
      .reduce((sum, nc) => sum + parseFloat(nc.total_con_descuento || 0), 0);

    const nuevoSaldoRestante = totalVentas - totalPagos - totalNC;

    // Mostrar saldo restante al final
    doc.setFontSize(14);
    doc.text(
      `Saldo Restante: $${nuevoSaldoRestante.toLocaleString("es-AR")}`,
      14,
      yPos
    );

    // Guardar PDF
    doc.save(`ResumenCuenta_${selectedCliente.nombre}.pdf`);
  };

  const navigate = useNavigate();

  const goToResumenCuentaXZona = () => {
    navigate("/ResumenCuentaXZona");
  };
  const goToResumenZona = () => {
    navigate("/ResumenZonas");
  };
  const items = [
    {
      label: (
        <a target="_blank" onClick={goToResumenZona}>
          Resumen Total por zonas
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" onClick={goToResumenCuentaXZona}>
          Resumen de clientes por zona
        </a>
      ),
      key: "1",
    },
  ];
  const pdfItems = [
    {
      label: (
        <a onClick={generateNotaCreditoPDF}>
          <FilePdfOutlined /> Generar Nota de Crédito PDF
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a onClick={generateResumenCuentaPDF}>
          <FileTextOutlined /> Generar Resumen de Cuenta PDF
        </a>
      ),
      key: "1",
    },
  ];
  const handleUpdatePago = async () => {
    try {
      const formattedDate = dayjs(pagoData.fecha_pago).format("DD/MM/YYYY"); // Formateo correcto
      const payload = {
        monto: pagoData.monto,
        fecha_pago: formattedDate,
        ID: pagoData.id,
      };

      await axios.put("http://localhost:3001/updatePago", payload);
      fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
      message.success("Pago actualizado con éxito");
      setOpen(false);
    } catch (error) {
      console.error("Error al actualizar el pago:", error);
      message.error("No se pudo actualizar el pago");
    }
  };

  const columns2 = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip
          title={`${row.codigo_producto} ${row.articulo_nombre} ${row.mediciones} ${row.linea_nombre}`}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>
            {`${row.codigo_producto} ${row.articulo_nombre} ${row.mediciones} ${row.linea_nombre}`}
          </span>
        </Tooltip>
      ),
      width: "60%", // Asigna más espacio a esta columna
    },
    {
      name: "Cantidad",
      selector: (row) => (
        <Tooltip
          title={row.cantidad}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{row.cantidad}</span>
        </Tooltip>
      ),
      width: "10%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
    {
      name: "Precio",
      selector: (row) => (
        <Tooltip
          title={row.precio_monotributista}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{row.precio_monotributista}</span>
        </Tooltip>
      ),
      width: "15%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
    {
      name: "Subtotal",
      selector: (row) => (
        <Tooltip
          title={row.subTotal}
          className={row.estado === 0 ? "strikethrough" : ""}
        >
          <span>{row.subTotal}</span>
        </Tooltip>
      ),
      width: "15%", // Reduce el espacio
      style: { textAlign: "right" }, // Alinea los números a la derecha
    },
  ];

  return (
    <MenuLayout>
      <div style={{ padding: "20px" }}>
        <h1>Resumen de Cuenta</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <ClienteInput onChangeCliente={setSelectedCliente} />
          <RangePicker
            onChange={(dates, dateStrings) => setRangoFechas(dateStrings)}
          />
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
          <Dropdown
            menu={{
              items,
            }}
          >
            <a
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "5px",
                backgroundColor: "green",
                color: "white",
                textDecoration: "none",
              }}
              onClick={(e) => e.preventDefault()}
            >
              <Space>
                Resumenes
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>

        {loading && (
          <>
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <Space>
                <Tooltip title="Agregar Pago">
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    onClick={() => setDrawerVisible(true)}
                  >
                    Agregar Pago
                  </Button>
                </Tooltip>

                <Tooltip title="Agregar Nota de Crédito">
                  <Button
                    type="default"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setDrawerNCVisible(true)}
                  >
                    Agregar Nota de Crédito
                  </Button>
                </Tooltip>
              </Space>

              <Dropdown menu={{ items: pdfItems }}>
                <Button type="primary">
                  <Space>
                    Generar PDF
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </Space>

            <DataTable
              columns={columns}
              data={data}
              pagination
              paginationComponent={CustomPagination}
              customStyles={{
                headCells: { style: customHeaderStyles },
                cells: { style: customCellsStyles },
              }}
              keyField="uniqueId"
            />

            <h2
              style={{
                marginTop: "20px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Saldo Restante: ${saldoRestante.toLocaleString("es-AR")}
            </h2>
          </>
        )}
        <Modal
          title="Detalles de la Nota de Crédito"
          open={openNC}
          onCancel={() => setOpenNC(false)}
          footer={null}
          width={900}
        >
          <DataTable
            columns={columns2}
            data={detalles}
            keyField="uniqueId"
            pagination={false}
          />
        </Modal>
        <Drawer
          title="Editar Pago"
          open={open}
          onClose={() => setOpen(false)}
          width={500}
        >
          <Tooltip title="Monto">
            <InputNumber
              min={0}
              style={{ marginTop: "10px", width: "100%" }}
              value={pagoData?.monto}
              onChange={(value) => setPagoData({ ...pagoData, monto: value })}
            />
          </Tooltip>

          <Tooltip title="Fecha de pago">
            <DatePicker
              style={{ marginTop: "10px", width: "100%" }}
              format="DD/MM/YYYY"
              value={pagoData?.fecha_pago ? dayjs(pagoData.fecha_pago) : null}
              onChange={(date) =>
                setPagoData({ ...pagoData, fecha_pago: date })
              }
            />
          </Tooltip>
          <Button
            type="primary"
            style={{ marginTop: "20px" }}
            onClick={handleUpdatePago}
          >
            Guardar Cambios
          </Button>
        </Drawer>

        <Drawer
          title="Agregar Nota de Crédito"
          open={drawerNCVisible}
          onClose={() => setDrawerNCVisible(false)}
          width={500}
        >
          <ArticulosInput
            value={articuloValue}
            onChangeArticulo={handleArticuloChange}
            onInputChange={setArticuloValue}
          />
          <InputNumber
            min={0}
            onChange={(value) => setCantidad(value)}
            style={{ marginTop: "10px" }}
            value={cantidad}
          />
          <Button
            className="custom-button"
            onClick={handleAddArticulo}
            style={{ marginTop: 10 }}
          >
            Agregar Artículo
          </Button>
          <DynamicListNC
            items={notaCredito.articulos}
            onDelete={handleDeleteArticulo}
            onEdit={handleEditPrecio}
          />
          <Button onClick={handleAddNotaCredito} type="primary">
            Registrar Nota de Crédito
          </Button>
        </Drawer>

        <AgregarPagoDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          clienteId={selectedCliente?.id}
          nextNroPago={nextNroPago}
          onPagoAdded={(nuevoPago) => {
            console.log("Nuevo Pago:", nuevoPago);
            fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
            setDrawerVisible(false);
          }}
        />
      </div>
    </MenuLayout>
  );
};

export default ResumenCuenta;
