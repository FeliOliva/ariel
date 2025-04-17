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
  const [ventaData, setVentaData] = useState(null);
  const [ncData, setNcData] = useState(null);
  const [open, setOpen] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [openNC, setOpenNC] = useState(false);
  const [tipoEdicion, setTipoEdicion] = useState(null);
  const [notasCreditoSeleccionadas, setNotasCreditoSeleccionadas] = useState(
    []
  );

  const { confirm } = Modal;
  const fetchData = async (clienteId, fechaInicio, fechaFin) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/resumenCliente/${clienteId}`,
        { params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }
      );

      console.log(response.data);
      let saldoAcumulado = 0; // Saldo inicial

      const filteredData = response.data
        .map((item) => ({
          ...item,
          tipoPlano: typeof item.tipo === "string" ? item.tipo : "",
        }))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)) // Ordenamos por fecha ascendente
        .map((item) => {
          // Convertimos el monto correctamente
          let monto = 0;
          if (item.total_con_descuento) {
            monto =
              parseInt(item.total_con_descuento.replace(/\./g, ""), 10) || 0;
          } else if (item.monto) {
            monto = parseInt(item.monto.replace(/\./g, ""), 10) || 0;
          }

          // Calculamos el saldo acumulado
          if (item.tipo === "Venta") {
            saldoAcumulado += monto; // Aumenta saldo con una venta
          } else if (item.tipo === "Pago" || item.tipo === "Nota de Crédito") {
            saldoAcumulado -= monto; // Resta saldo con un pago o nota de crédito
          }

          return {
            ...item,
            saldoRestante: saldoAcumulado, // Asigna el saldo acumulado actual
          };
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setData(filteredData);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      message.error("No se pudo cargar la información del cliente");
    }
  };
  useEffect(() => {
    const inicio = dayjs("2025-01-01").format("YYYY-MM-DD");
    const fin = dayjs().format("YYYY-MM-DD");
    setRangoFechas([inicio, fin]);
  }, []);

  const handleSearch = () => {
    if (!selectedCliente) {
      return message.warning("Seleccione un cliente.");
    }
    if (!rangoFechas || rangoFechas.length !== 2) {
      return message.warning("Seleccione un rango de fechas.");
    }
    setLoading(true);
    fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
  };

  const handleOpenEditDrawer = async (id, tipo) => {
    try {
      setTipoEdicion(tipo);

      if (tipo === "Pago") {
        const response = await axios.get(
          `http://localhost:3001/getPagoById/${id}`
        );
        const data = response.data[0];

        setPagoData({
          ...data,
          monto: parseFloat(data.monto),
          fecha_pago: data.fecha_pago ? dayjs(data.fecha_pago) : null,
        });
      } else if (tipo === "Venta") {
        const response = await axios.get(
          `http://localhost:3001/getVentaByID/${id}`
        );
        const data = response.data; // La respuesta ya es un objeto

        setVentaData({
          ...data,
          fecha_venta: data.fecha ? dayjs(data.fecha) : null, // Convertimos correctamente la fecha
          venta_id: data.venta_id, // Aseguramos que el ID se use correctamente
        });
      } else {
        const response = await axios.get(
          `http://localhost:3001/getNotaCreditoByID/${id}`
        );
        const data = response.data[0];

        setNcData({
          ...data,
          fecha: data.fecha ? dayjs(data.fecha) : null,
        });
      }

      setOpen(true);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      message.error("No se pudo cargar la información");
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
      name: "Saldo Restante",
      selector: (row) => (
        <Tooltip title={`Saldo: ${row.saldoRestante}`}>
          <span>${row.saldoRestante.toLocaleString()}</span>
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
            onClick={() => handleDelete(row.id, row.tipo)}
          >
            {<DeleteOutlined />}
          </Button>
        </div>
      ),
    },
  ];
  const handleDelete = async (id, tipo) => {
    if (!selectedCliente || !rangoFechas || rangoFechas.length !== 2) {
      return message.warning(
        "Debe seleccionar un cliente y un rango de fechas."
      );
    }
    let value;
    if (tipo === "Pago") {
      value = "dropPago";
    } else if (tipo === "Venta") {
      value = "dropVenta";
    } else {
      value = "dropNotaCredito";
    }

    confirm({
      title: `¿Está seguro de eliminar esta ${tipo}?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`http://localhost:3001/${value}/${id}`);

          notification.success({
            message: `${tipo} eliminada`,
            description: `La ${tipo} se eliminó exitosamente.`,
            duration: 1,
          });

          // Recargar datos actualizados
          fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
        } catch (error) {
          console.error(`Error al eliminar la ${tipo}:`, error);
          message.error(`No se pudo eliminar la ${tipo}.`);
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

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
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

    if (notasCreditoSeleccionadas.length !== 1) {
      return message.warning(
        "Por favor, seleccione una única nota de crédito."
      );
    }

    const notaSeleccionadaId = notasCreditoSeleccionadas[0].id;
    console.log("notas seleccionadas", notasCreditoSeleccionadas);

    try {
      const response = await axios.get(
        `http://localhost:3001/notasCreditoByClienteId/${selectedCliente.id}`
      );
      console.log("notas credito", response.data);
      const notasCredito = response.data;
      console.log("seleccionada", notaSeleccionadaId);
      // Buscar solo la nota que coincida con el ID seleccionado
      const nota = notasCredito.find(
        (nc) => Number(nc.notaCredito_id) === Number(notaSeleccionadaId)
      );

      if (!nota) {
        return notification.warning({
          message: "Nota no encontrada",
          description: "No se encontró la nota de crédito seleccionada.",
          duration: 1,
        });
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Nota de Crédito", 90, 20);

      doc.setFontSize(14);
      doc.text(
        `Cliente: ${selectedCliente.farmacia} ${selectedCliente.nombre} ${selectedCliente.apellido}`,
        14,
        30
      );

      let yPos = 40;

      doc.setFontSize(14);
      doc.text(`Nota de Crédito Nº ${nota.nroNC}`, 14, yPos);
      doc.text(
        `Fecha: ${new Date(nota.fecha).toLocaleDateString("es-ES")}`,
        150,
        yPos
      );

      yPos += 10;
      doc.setFontSize(12);

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

      doc.save(`nota_credito_${nota.nroNC}.pdf`);
    } catch (error) {
      notification.warning({
        message: "Error al obtener la nota",
        description: "Verificá que el cliente tenga notas disponibles",
        duration: 1,
      });
    }
  };

  const generateResumenCuentaPDF = () => {
    const doc = new jsPDF();

    // Filtrar y ordenar los datos por fecha (ascendente)
    const filteredData = data
      .filter((row) => row.estado === 1)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const parseNumber = (value) => {
      return value ? parseInt(value.toString().replace(/\./g, ""), 10) : 0;
    };
    const formatNumber = (value) => {
      return new Intl.NumberFormat("es-AR").format(value);
    };

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
    let saldoAcumulado = 0;

    if (filteredData.length > 0) {
      // Generar tabla solo si hay datos
      doc.autoTable({
        startY: yPos,
        head: [
          [
            "Fecha",
            "Tipo",
            "Total",
            "Número",
            "Método de Pago",
            "Saldo Restante",
          ],
        ],
        body: filteredData.map((row) => {
          const monto = parseNumber(
            row.total_con_descuento ? row.total_con_descuento : row.monto
          );

          if (row.tipo === "Venta") saldoAcumulado += monto;
          else if (row.tipo === "Pago" || row.tipo === "Nota de Crédito")
            saldoAcumulado -= monto;

          return [
            new Date(row.fecha).toLocaleDateString("es-AR"),
            row.tipo,
            `$${formatNumber(monto)}`,
            row.numero,
            row.metodo_pago ? row.metodo_pago : "N/A",
            `$${formatNumber(saldoAcumulado)}`,
          ];
        }),
        theme: "grid",
        styles: { fontSize: 10 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      // Si no hay registros, avisamos
      yPos += 10;
      doc.setFontSize(12);
      doc.text(
        "No hay movimientos en el rango de fechas seleccionado.",
        14,
        yPos
      );
      yPos += 10;
    }

    // Mostrar saldo final
    doc.setFontSize(14);
    doc.text(
      `Saldo Restante Final: $${saldoAcumulado.toLocaleString("es-AR")}`,
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
  const handleUpdate = async () => {
    try {
      let payload = {};
      let url = "";

      if (tipoEdicion === "Pago") {
        payload = {
          monto: pagoData.monto,
          fecha_pago: dayjs(pagoData.fecha_pago).format("DD/MM/YYYY"),
          ID: pagoData.id,
        };
        url = "http://localhost:3001/updatePago";
      } else if (tipoEdicion === "Venta") {
        payload = {
          fecha_venta: dayjs(ventaData.fecha_venta).format("DD/MM/YYYY"),
          ID: ventaData.venta_id,
        };
        url = "http://localhost:3001/updateVenta";
      } else if (tipoEdicion === "Nota de Crédito") {
        payload = {
          fecha: dayjs(ncData.fecha).format("DD/MM/YYYY"),
          ID: ncData.id,
        };
        url = "http://localhost:3001/updateNotaCredito";
      }

      await axios.put(url, payload);
      message.success(`${tipoEdicion} actualizado con éxito`);
      fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
      setOpen(false);
    } catch (error) {
      console.error(`Error al actualizar ${tipoEdicion}:`, error);
      message.error(`No se pudo actualizar ${tipoEdicion}`);
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
            value={
              rangoFechas.length === 2
                ? [dayjs(rangoFechas[0]), dayjs(rangoFechas[1])]
                : null
            }
            onChange={(dates, dateStrings) => {
              if (!dates) {
                setRangoFechas([]); // Limpiamos el estado si se borran las fechas
              } else {
                setRangoFechas(dateStrings);
              }
            }}
            allowClear
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
              keyField="id"
              selectableRows // 👉 activa los checkboxes
              selectableRowDisabled={(row) =>
                row.tipoPlano !== "Nota de Crédito"
              }
              onSelectedRowsChange={({ selectedRows }) => {
                const notasSeleccionadas = selectedRows.filter(
                  (row) => row.tipoPlano === "Nota de Crédito"
                );
                setNotasCreditoSeleccionadas(notasSeleccionadas);
              }}
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
          title={`Editar ${tipoEdicion}`}
          open={open}
          onClose={() => setOpen(false)}
          width={500}
        >
          {tipoEdicion === "Pago" && (
            <>
              <Tooltip title="Monto">
                <InputNumber
                  min={0}
                  style={{ marginTop: "10px", width: "100%" }}
                  value={pagoData?.monto}
                  onChange={(value) =>
                    setPagoData({ ...pagoData, monto: value })
                  }
                />
              </Tooltip>
              <Tooltip title="Fecha de pago">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={
                    pagoData?.fecha_pago ? dayjs(pagoData.fecha_pago) : null
                  }
                  onChange={(date) =>
                    setPagoData({ ...pagoData, fecha_pago: date })
                  }
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}

          {tipoEdicion === "Venta" && (
            <>
              <Tooltip title="Fecha de venta">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={
                    ventaData?.fecha_venta ? dayjs(ventaData.fecha_venta) : null
                  }
                  onChange={(date) =>
                    setVentaData({ ...ventaData, fecha_venta: date })
                  }
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}

          {tipoEdicion === "Nota de Crédito" && (
            <>
              <Tooltip title="Fecha">
                <DatePicker
                  style={{ marginTop: "10px", width: "100%" }}
                  format="DD/MM/YYYY"
                  value={ncData?.fecha ? dayjs(ncData.fecha) : null}
                  onChange={(date) => setNcData({ ...ncData, fecha: date })}
                />
              </Tooltip>
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={handleUpdate}
              >
                Guardar Cambios
              </Button>
            </>
          )}
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
            fetchData(selectedCliente.id, rangoFechas[0], rangoFechas[1]);
            setDrawerVisible(false);
          }}
        />
      </div>
    </MenuLayout>
  );
};

export default ResumenCuenta;
