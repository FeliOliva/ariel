import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Drawer,
  Button,
  Input,
  Spin,
  Tooltip,
  InputNumber,
  Modal,
  notification,
  Select,
  Switch,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import ClienteInput from "../components/ClienteInput";
import DynamicList from "../components/DynamicList";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import {
  ExclamationCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "../style/style.css";

function Ventas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [venta, setVenta] = useState({
    articulos: [],
    cliente: null,
    nroVenta: "",
    descuento: 0,
  });
  const [totalVenta, setTotalVenta] = useState(0); // Estado para el total de la venta
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [articuloValue, setArticuloValue] = useState(""); // Estado para el valor del input del artículo
  const [clienteValue, setClienteValue] = useState(""); // Estado para el valor del input del cliente
  const { confirm } = Modal;
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editedVenta, setEditedVenta] = useState({});
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [searchMode, setSearchMode] = useState("cliente"); // cliente | nroVenta
  const [searchNroVenta, setSearchNroVenta] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [modoDescuento, setModoDescuento] = useState(true);

  useEffect(() => {
    let totalBase = 0;

    // 1) Sumar artículos (ignorando regalos)
    venta.articulos.forEach((art) => {
      if (art.isGift) return; // ❌ No se suma al total

      const cantidad = Number(art.quantity || 0);
      const precio = Number(art.price ?? art.precio_monotributista ?? 0);

      totalBase += cantidad * precio;
    });

    // 2) Aplicar descuento o aumento
    const porcentaje = Number(venta.descuento || 0);
    let totalCalculado = totalBase;

    if (porcentaje > 0) {
      if (modoDescuento) {
        // DESCUENTO → redondea hacia arriba
        const desc = totalBase * (porcentaje / 100);
        const descRedondeado = Math.ceil(desc);
        totalCalculado = totalBase - descRedondeado;
      } else {
        // AUMENTO → redondeo normal
        const aumento = totalBase * (porcentaje / 100);
        const aumentoRed = Math.round(aumento);
        totalCalculado = totalBase + aumentoRed;
      }
    }

    // 3) Redondeo final correcto
    setTotalVenta(Math.round(totalCalculado));
  }, [venta.articulos, venta.descuento, modoDescuento]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ventas");
      setData(response.data);

      // Determina el último número de venta basado en los datos recibidos
      const lastVenta = response.data.reduce((max, venta) => {
        const nro = parseInt(venta.nroVenta.replace("V", ""));
        return nro > max ? nro : max;
      }, 0);

      // Establece el número de venta para la nueva venta
      if (response.data.length > 0) {
        const nextSaleNumber = lastVenta + 1;
        setVenta((prev) => ({
          ...prev,
          nroVenta: `V${String(nextSaleNumber).padStart(5, "0")}`,
        }));
      } else {
        setVenta((prev) => ({
          ...prev,
          nroVenta: "V00001", // Establece el valor inicial a V004 si no hay ventas previas
        }));
      }
      const responseGuardadas = await axios.get(
        "http://localhost:3001/lineas-guardadas"
      );
      setSelectedIds(responseGuardadas.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const articulosGuardados = localStorage.getItem("articulosVenta");
    if (articulosGuardados) {
      setVenta((prev) => ({
        ...prev,
        articulos: JSON.parse(articulosGuardados),
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchMode === "nroVenta") {
      if (searchNroVenta.trim() === "") {
        setFilteredData([]);
        return;
      }
      const filtered = data.filter((venta) =>
        venta.nroVenta.toLowerCase().includes(searchNroVenta.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchNroVenta, data, searchMode]);

  useEffect(() => {
    if (searchMode === "cliente") {
      if (!client) {
        setFilteredData([]);
        return;
      }

      const filtered = data.filter((venta) => venta.cliente_id === client.id);

      setFilteredData(filtered);
    }
  }, [client, data, searchMode]);

  const calculateTotal = () => {
    // 1) Subtotal solo de los que NO son regalo
    const subtotal = venta.articulos.reduce((sum, articulo) => {
      if (articulo.isGift) return sum; // 👈 si es regalo, no suma

      const cantidad = Number(articulo.quantity || 0);
      const precio = Number(
        articulo.price ?? articulo.precio_monotributista ?? 0
      );

      return sum + cantidad * precio;
    }, 0);

    const porcentaje = Number(venta.descuento || 0);
    if (!porcentaje) {
      // sin descuento / aumento → redondeo normal
      return Math.round(subtotal);
    }

    let totalCalculado = subtotal;

    if (modoDescuento) {
      // 🟢 MODO DESCUENTO: restar porcentaje, redondeando el DESCUENTO hacia arriba
      const desc = subtotal * (porcentaje / 100);
      const descRedondeado = Math.ceil(desc); // siempre para arriba
      totalCalculado = subtotal - descRedondeado;
    } else {
      // 🔴 MODO AUMENTO: sumar porcentaje, redondeo normal
      const aumento = subtotal * (porcentaje / 100);
      const aumentoRedondeado = Math.round(aumento);
      totalCalculado = subtotal + aumentoRedondeado;
    }

    // Redondeo final del total
    return Math.round(totalCalculado);
  };

  useEffect(() => {
    // siempre que cambien artículos, descuento o modo, recalculamos
    setTotalVenta(calculateTotal());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venta.articulos, venta.descuento, modoDescuento]);

  // Función para alternar el modo
  const handleToggleDescuento = (checked) => {
    setModoDescuento(checked);
  };

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
  };

  const handleClienteChange = (cliente) => {
    setVenta((prev) => ({
      ...prev,
      cliente,
    }));
    setClienteValue(cliente?.id || ""); // Actualiza el valor del input del cliente
  };

  const handleAddArticulo = () => {
    if (selectedArticulo && cantidad > 0) {
      if (selectedIds.includes(selectedArticulo.linea_id)) {
        if (selectedArticulo.stock < cantidad) {
          Modal.warning({
            title: "Advertencia",
            content:
              "No hay suficiente stock de este articulo," +
              "  el stock es de: " +
              selectedArticulo.stock,
            icon: <ExclamationCircleOutlined />,
          });
          return;
        }
      }

      const uniqueId = `${selectedArticulo.id}-${Date.now()}`; // Generación del ID único
      setVenta((prev) => {
        const nuevaVenta = {
          ...prev,
          articulos: [
            ...prev.articulos,
            {
              ...selectedArticulo,
              linea_id: selectedArticulo.linea_id,
              quantity: cantidad,
              price: selectedArticulo.precio_monotributista,
              label: `${selectedArticulo.nombre} - ${selectedArticulo.linea_nombre} - ${selectedArticulo.sublinea_nombre}`,
              value: selectedArticulo.id,
              uniqueId,
              isGift: false,
            },
          ],
        };
        localStorage.setItem(
          "articulosVenta",
          JSON.stringify(nuevaVenta.articulos)
        );
        return nuevaVenta;
      });
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
    setVenta((prev) => {
      const nuevosArticulos = prev.articulos.filter(
        (articulo) => articulo.uniqueId !== uniqueId
      );

      // actualizar localStorage
      localStorage.setItem("articulosVenta", JSON.stringify(nuevosArticulos));

      return {
        ...prev,
        articulos: nuevosArticulos,
      };
    });
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

  const handleAddVenta = async () => {
    if (venta.cliente && venta.articulos.length > 0) {
      if (venta.descuento === 0 || venta.descuento === undefined) {
        notification.warning({
          message: "Advertencia",
          description: "Estas por cargar una venta sin descuento",
          duration: 2,
        });
        venta.descuento = 0;
      }
      // Verificar el stock antes de proceder
      const stockInsuficiente = [];

      // Primero agrupamos los artículos por ID para calcular cantidades totales
      const articulosPorId = {};
      venta.articulos.forEach((articulo) => {
        const id = articulo.id;
        if (!articulosPorId[id]) {
          articulosPorId[id] = {
            ...articulo,
            cantidadTotal: 0,
          };
        }
        articulosPorId[id].cantidadTotal += articulo.quantity;
      });

      // Luego verificamos por cada artículo si hay suficiente stock
      Object.values(articulosPorId).forEach((articulo) => {
        if (
          selectedIds.includes(articulo.linea_id) &&
          articulo.cantidadTotal > articulo.stock
        ) {
          stockInsuficiente.push({
            nombre: articulo.nombre,
            cantidadTotal: articulo.cantidadTotal,
            stock: articulo.stock,
          });
        }
      });

      if (stockInsuficiente.length > 0) {
        const mensaje = stockInsuficiente
          .map(
            (item) =>
              `${item.nombre}: Stock disponible ${item.stock}, Cantidad total solicitada ${item.cantidadTotal}`
          )
          .join("\n");

        Modal.warning({
          title: "Stock insuficiente",
          content: `No hay suficiente stock para los siguientes artículos:\n${mensaje}`,
          icon: <ExclamationCircleOutlined />,
        });
        return; // Detener la ejecución si no hay suficiente stock
      }
      try {
        let tipoDescuento;
        if (modoDescuento === false) {
          tipoDescuento = 1; // Aumento
        } else {
          tipoDescuento = 0; // Descuento
        }
        console.log("tipoDescuento", tipoDescuento);
        const ventaData = {
          cliente_id: venta.cliente.id,
          nroVenta: venta.nroVenta,
          zona_id: venta.cliente.zona_id,
          descuento: venta.descuento,
          tipoDescuento: tipoDescuento,
          detalles: venta.articulos.map((articulo) => ({
            linea_id: articulo.linea_id,
            articulo_id: articulo.value, // Usamos el ID del artículo
            costo: articulo.costo ? articulo.costo : 0, // Asegúrate de que este campo esté presente
            cantidad: articulo.quantity,
            precio_monotributista: articulo.precio_monotributista
              ? articulo.precio_monotributista
              : articulo.price,
            isGift: articulo.isGift ? true : false,
          })),
        };
        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la venta?",
          okText: "Si",
          cancelText: "No",
          onOk: async () => {
            await axios.post("http://localhost:3001/addVenta", ventaData);
            setArticuloValue("");
            setClienteValue("");
            setCantidad(0);
            setOpen(false);
            localStorage.removeItem("articulosVenta");
            notification.success({
              message: "Exito",
              description: "Venta registrada con exito",
              duration: 2,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          },
        });
      } catch (error) {
        console.error("Error al enviar la venta:", error);
        alert("Error al registrar la venta");
      }
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, complete todos los campos",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  // const handleOfertaChange = (oferta) => {
  //   setSelectedOferta(oferta);
  //   setOfertaValue(oferta?.id || "");
  //   console.log(ofertaValue);
  //   console.log(selectedOferta);
  // };
  // const handleAddOferta = async () => {
  //   if (selectedOferta) {
  //     try {
  //       // Realiza la solicitud al backend para obtener los productos de la oferta seleccionada
  //       const response = await axios.get(
  //         `http://localhost:3001/detalleOferta/${selectedOferta.id}`
  //       );
  //       const { productos } = response.data;
  //       // Filtrar los productos que ya están en la lista de venta
  //       const productosDuplicados = productos.filter((producto) =>
  //         venta.articulos.some((articulo) => articulo.id === producto.id)
  //       );

  //       if (productosDuplicados.length > 0) {
  //         const nombresDuplicados = productosDuplicados
  //           .map((producto) => producto.nombre)
  //           .join(", ");
  //         Modal.warning({
  //           title: "Advertencia",
  //           content: `Los siguientes productos ya están en la venta: ${nombresDuplicados}`,
  //           icon: <ExclamationCircleOutlined />,
  //         });
  //         return;
  //       }
  //       // Valida cada producto antes de agregarlos
  //       const productosSinStock = productos.filter(
  //         (producto) => producto.cantidad > producto.stock
  //       );

  //       // Si algún producto tiene stock insuficiente, muestra advertencia y detén el proceso
  //       if (productosSinStock.length > 0) {
  //         const nombresSinStock = productosSinStock
  //           .map(
  //             (producto) =>
  //               `${producto.nombre} (Stock: ${producto.stock}, Cantidad requerida: ${producto.cantidad})`
  //           )
  //           .join(", ");
  //         Modal.warning({
  //           title: "Advertencia",
  //           content: `No hay suficiente stock para los siguientes artículos: ${nombresSinStock}`,
  //           icon: <ExclamationCircleOutlined />,
  //         });
  //         return;
  //       }
  //       // Itera sobre los productos y agrega cada uno a la lista de artículos de la venta
  //       productos.forEach((producto) => {
  //         console.log("producto", producto);
  //         setVenta((prev) => ({
  //           ...prev,
  //           articulos: [
  //             ...prev.articulos,
  //             {
  //               id: producto.id,
  //               label: `${producto.nombre} - ${producto.nombre_linea} - ${producto.nombre_sublinea}`,
  //               value: producto.id,
  //               quantity: producto.cantidad, // O la cantidad que desees usar por defecto
  //               price: parseFloat(producto.precio),
  //             },
  //           ],
  //         }));
  //       });

  //       // Reiniciar el valor de la oferta seleccionada
  //       setSelectedOferta(null);
  //       setOfertaValue("");
  //     } catch (error) {
  //       console.error("Error fetching oferta details:", error);
  //       alert("Error al agregar la oferta");
  //     }
  //   } else {
  //     Modal.warning({
  //       title: "Advertencia",
  //       content: "Por favor, seleccione una oferta",
  //       icon: <ExclamationCircleOutlined />,
  //     });
  //   }
  // };
  const handleGoToCheques = () => {
    navigate("/cheques");
  };
  const handleGoToFechasPorVentas = () => {
    navigate("/ventasPorFechas");
  };
  const handleEditPrecio = (uniqueId, newPrice) => {
    const updatedArticulos = venta.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, precio_monotributista: newPrice, price: newPrice }
        : item
    );
    setVenta((prevVenta) => ({ ...prevVenta, articulos: updatedArticulos }));
  };
  // eslint-disable-next-line no-unused-vars
  const fetchVentasByClient = async (cliente) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/ventasCliente/${cliente}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching ventas by client:", error);
    }
  };
  const handleClietChange = (cliente) => {
    setClient(cliente);
  };
  const handleUpdateVenta = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getVentaByID/${id}`
      );
      setOpenEditDrawer(true);
      setEditedVenta(response.data);
    } catch (error) {
      console.error("Error al obtener la venta:", error);
    }
  };
  const editVenta = async () => {
    try {
      // Limpiar los formatos numéricos antes de enviar
      const cleanNumber = (num) => {
        if (typeof num === "string") {
          return parseFloat(num.replace(/\./g, "").replace(",", "."));
        }
        return num;
      };

      const payload = {
        fecha_venta: editedVenta.fecha,
        total: cleanNumber(editedVenta.total_importe),
        descuento: cleanNumber(editedVenta.descuento),
        ID: editedVenta.venta_id,
      };
      await axios.put(`http://localhost:3001/updateVenta`, {
        ...payload,
      });
      setOpenEditDrawer(false);
      notification.success({
        message: "Exito",
        description: "Venta editada con exito",
        duration: 2,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error al editar la venta:", error);
    }
  };
  const handleClearSearch = () => {
    setClient(null);
    setSearchNroVenta("");
    setFilteredData([]);
  };

  const handleDropVenta = async (id) => {
    try {
      confirm({
        title: "¿Esta seguro de eliminar esta venta?",
        icon: <ExclamationCircleOutlined />,
        okText: "Si, confirmar",
        cancelText: "Cancelar",
        onOk: async () => {
          await axios.put(`http://localhost:3001/dropVenta/${id}`);
          notification.success({
            message: "Venta eliminada",
            description: "La venta se elimino exitosamente",
            duration: 1,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
      });
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    }
  };
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    // Convertir a número por si viene como string
    const number =
      typeof num === "string" ? parseFloat(num.replace(",", ".")) : num;
    // Formatear con separadores de miles y sin decimales
    return new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(number);
  };
  const formatDiscount = (value) => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(",", "."))
        : Number(value);
    return num % 1 === 0 ? `${num}%` : `${num.toFixed(2)}%`;
  };
  const columns = [
    {
      name: "Nro. Venta",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nroVenta}
        >
          <span>
            <span>{row.nroVenta}</span>
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={format(new Date(row.fecha_venta), "dd/MM/yyyy")}
        >
          <span>{format(new Date(row.fecha_venta), "dd/MM/yyyy")}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Farmacia",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.farmacia}
        >
          <span>{row.farmacia}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Cliente",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre_cliente + " " + row.apellido_cliente}
        >
          <span>{row.nombre_cliente + " " + row.apellido_cliente}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Zona",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre_zona}
        >
          <span>{row.nombre_zona}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Sub total",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={formatNumber(row.total)}
        >
          $<span>{formatNumber(row.total)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Descuento",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={formatDiscount(row.descuento)}
        >
          <span>{formatDiscount(row.descuento)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={formatNumber(row.total_con_descuento)}
        >
          $<span>{formatNumber(row.total_con_descuento)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      selector: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            className="custom-button"
            onClick={() => handleDropVenta(row.id)}
          >
            <DeleteOutlined />
          </Button>
          <Button
            className="custom-button"
            onClick={() => handleUpdateVenta(row.id)}
          >
            <EditOutlined />
          </Button>
        </div>
      ),
    },
    {
      name: "Detalle",
      selector: (row) => (
        <Link to={`/venta/${row.id}`}>
          <button>Ver Detalles</button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <MenuLayout>
      <h1>Listado de ventas</h1>
      <Button
        type="primary"
        style={{ marginBottom: 10, marginRight: 10 }}
        onClick={() => setOpen(true)}
      >
        Nueva Venta
      </Button>
      <Button
        type="primary"
        onClick={handleGoToCheques}
        style={{ marginLeft: 10 }}
      >
        Ver Cheques
      </Button>
      <Button
        type="primary"
        onClick={handleGoToFechasPorVentas}
        style={{ marginLeft: 10 }}
      >
        Ventas por Fecha
      </Button>
      <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
        <Select
          value={searchMode}
          onChange={(value) => {
            setSearchMode(value);
            setClient(null);
            setSearchNroVenta("");
            setFilteredData([]);
          }}
          style={{ width: 180 }}
        >
          <Select.Option value="cliente">Buscar por Cliente</Select.Option>
          <Select.Option value="nroVenta">
            Buscar por Nro. de Venta
          </Select.Option>
        </Select>

        {searchMode === "cliente" && (
          <ClienteInput
            value={client?.id || null} // ⬅️ Pasar solo el ID
            onChangeCliente={handleClietChange}
            style={{ width: 200 }}
          />
        )}

        {searchMode === "nroVenta" && (
          <Input
            placeholder="Nro. de Venta"
            value={searchNroVenta}
            onChange={(e) => setSearchNroVenta(e.target.value)}
            style={{ width: 300 }}
          />
        )}

        <Button
          icon={<CloseOutlined />}
          onClick={handleClearSearch}
          style={{ width: "40px" }}
        />
      </div>
      <Drawer
        open={openEditDrawer}
        title="Editar Venta"
        closable={true}
        maskClosable={false}
        onClose={() => setOpenEditDrawer(false)}
        width={400}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Descuento</Tooltip>
        </div>
        <InputNumber
          value={editedVenta?.descuento}
          onChange={(value) =>
            setEditedVenta((prev) => ({
              ...prev,
              descuento: value,
            }))
          }
        ></InputNumber>
        <Button onClick={editVenta}>Guardar</Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={filteredData.length > 0 ? filteredData : data}
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
          },
          cells: {
            style: customCellsStyles,
          },
        }}
      />

      <Drawer
        open={open}
        title="Nueva Venta"
        closable={true}
        maskClosable={false}
        onClose={() => setOpen(false)}
        width={700}
      >
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Nro de Venta</Tooltip>
        </div>
        <Input
          value={venta?.nroVenta}
          style={{ marginBottom: 10 }}
          readOnly // Deshabilitar el input para el número de venta
        />
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Seleccione el cliente</Tooltip>
        </div>
        <ClienteInput
          value={clienteValue}
          onChangeCliente={handleClienteChange}
          onInputChange={setClienteValue} // Update input value
        />
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Seleccione los artículos</Tooltip>
        </div>
        <ArticulosInput
          value={articuloValue}
          onChangeArticulo={handleArticuloChange}
          onInputChange={setArticuloValue} // Update input value
        />
        <InputNumber
          min={1}
          value={cantidad}
          onChange={(value) => setCantidad(value)}
          style={{ marginBottom: 10 }}
        />
        <Button
          className="custom-button"
          onClick={handleAddArticulo}
          style={{ marginBottom: 20 }}
        >
          Agregar Artículo
        </Button>
        {/* <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Seleccione una oferta</Tooltip>
        </div>
        <OfertasInput
          value={ofertaValue}
          onChangeOferta={handleOfertaChange}
          onInputChange={setOfertaValue} // Update input value
        />
        <Button
          className="custom-button"
          onClick={handleAddOferta} // Asigna el evento onClick
          style={{ display: "flex", marginTop: 10 }}
        >
          Agregar oferta
        </Button> */}

        <DynamicList
          items={venta.articulos}
          onDelete={handleDeleteArticulo}
          onGiftChange={handleGiftChange}
          onEdit={handleEditPrecio}
        />
        <div
          style={{ display: "flex", alignItems: "center", margin: "10px 0" }}
        >
          <Tooltip>
            {modoDescuento ? "Descuento activado" : "Aumento activado"}
          </Tooltip>
          <Switch
            checkedChildren="Descuento"
            unCheckedChildren="Aumento"
            checked={modoDescuento}
            onChange={handleToggleDescuento}
            style={{ marginLeft: 10 }}
          />
        </div>
        <InputNumber
          min={0}
          value={venta?.descuento}
          onChange={(value) =>
            setVenta((prev) => ({ ...prev, descuento: value }))
          }
          style={{ marginBottom: 10, display: "flex", marginTop: 10 }}
        />
        <div style={{ marginTop: 20, textAlign: "right", fontSize: "20px" }}>
          <h3> Total: ${totalVenta.toLocaleString("es-ES")}</h3>
        </div>
        <Button onClick={handleAddVenta} type="primary">
          Registrar Venta
        </Button>
      </Drawer>
    </MenuLayout>
  );
}

export default Ventas;
