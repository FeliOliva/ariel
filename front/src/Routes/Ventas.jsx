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
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { format, set } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import ClienteInput from "../components/ClienteInput";
import DynamicList from "../components/DynamicList";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import OfertasInput from "../components/OfertasInput";
import {
  ExclamationCircleOutlined,
  CloseOutlined,
  SearchOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
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
  const [ofertaValue, setOfertaValue] = useState(""); // Estado para el valor del input de la oferta
  const [selectedOferta, setSelectedOferta] = useState(""); // Estado para el valor del input de la oferta
  const { confirm } = Modal;
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
    console.log(localStorage.getItem("articulosVenta"));
    fetchData();
  }, []);

  const calculateTotal = () => {
    const subtotal = venta.articulos.reduce(
      (sum, articulo) => sum + articulo.price * articulo.quantity,
      0
    );
    const descuento = venta.descuento ? subtotal * (venta.descuento / 100) : 0;
    return subtotal - descuento;
  };

  useEffect(() => {
    setTotalVenta(calculateTotal());
  }, [venta.articulos, venta.descuento]); // Actualiza el total cuando cambian los artículos o el descuento.

  const handleArticuloChange = (articulo) => {
    setSelectedArticulo(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
    console.log(selectedArticulo);
    console.log(articulo);
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
      console.log("lineas", selectedIds);
      console.log("articulo", selectedArticulo);
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

        // ✅ Guardar en `localStorage` dentro del mismo `setVenta()`
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
      console.log(venta);
      try {
        const ventaData = {
          cliente_id: venta.cliente.id,
          nroVenta: venta.nroVenta,
          zona_id: venta.cliente.zona_id,
          descuento: venta.descuento,
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
        console.log("venta data", ventaData);
        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la venta?",
          okText: "Si",
          cancelText: "No",
          onOk: async () => {
            await axios.post("http://localhost:3001/addVenta", ventaData);
            localStorage.removeItem("articulosVenta");
            setArticuloValue("");
            setClienteValue("");
            setCantidad(0);
            setOpen(false);
            notification.success({
              message: "Exito",
              description: "Venta registrada con exito",
              duration: 2,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
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

  const handleOfertaChange = (oferta) => {
    setSelectedOferta(oferta);
    setOfertaValue(oferta?.id || "");
    console.log(ofertaValue);
    console.log(selectedOferta);
  };
  const handleAddOferta = async () => {
    if (selectedOferta) {
      try {
        // Realiza la solicitud al backend para obtener los productos de la oferta seleccionada
        const response = await axios.get(
          `http://localhost:3001/detalleOferta/${selectedOferta.id}`
        );
        const { productos } = response.data;
        // Filtrar los productos que ya están en la lista de venta
        const productosDuplicados = productos.filter((producto) =>
          venta.articulos.some((articulo) => articulo.id === producto.id)
        );

        if (productosDuplicados.length > 0) {
          const nombresDuplicados = productosDuplicados
            .map((producto) => producto.nombre)
            .join(", ");
          Modal.warning({
            title: "Advertencia",
            content: `Los siguientes productos ya están en la venta: ${nombresDuplicados}`,
            icon: <ExclamationCircleOutlined />,
          });
          return;
        }
        // Valida cada producto antes de agregarlos
        const productosSinStock = productos.filter(
          (producto) => producto.cantidad > producto.stock
        );

        // Si algún producto tiene stock insuficiente, muestra advertencia y detén el proceso
        if (productosSinStock.length > 0) {
          const nombresSinStock = productosSinStock
            .map(
              (producto) =>
                `${producto.nombre} (Stock: ${producto.stock}, Cantidad requerida: ${producto.cantidad})`
            )
            .join(", ");
          Modal.warning({
            title: "Advertencia",
            content: `No hay suficiente stock para los siguientes artículos: ${nombresSinStock}`,
            icon: <ExclamationCircleOutlined />,
          });
          return;
        }
        // Itera sobre los productos y agrega cada uno a la lista de artículos de la venta
        productos.forEach((producto) => {
          console.log("producto", producto);
          setVenta((prev) => ({
            ...prev,
            articulos: [
              ...prev.articulos,
              {
                id: producto.id,
                label: `${producto.nombre} - ${producto.nombre_linea} - ${producto.nombre_sublinea}`,
                value: producto.id,
                quantity: producto.cantidad, // O la cantidad que desees usar por defecto
                price: parseFloat(producto.precio),
              },
            ],
          }));
        });

        // Reiniciar el valor de la oferta seleccionada
        setSelectedOferta(null);
        setOfertaValue("");
      } catch (error) {
        console.error("Error fetching oferta details:", error);
        alert("Error al agregar la oferta");
      }
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, seleccione una oferta",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };
  const handleGoToCheques = () => {
    navigate("/cheques");
  };
  const handleEditPrecio = (uniqueId, newPrice) => {
    const updatedArticulos = venta.articulos.map((item) =>
      item.uniqueId === uniqueId
        ? { ...item, precio_monotributista: newPrice, price: newPrice }
        : item
    );
    setVenta((prevVenta) => ({ ...prevVenta, articulos: updatedArticulos }));
    console.log("Artículos actualizados: ", updatedArticulos);
  };
  const fetchVentasByClient = async (cliente) => {
    console.log("id desde el front", cliente);
    try {
      const response = await axios.get(
        `http://localhost:3001/ventasCliente/${cliente}`
      );
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching ventas by client:", error);
    }
  };
  const handleClietChange = (cliente) => {
    setClient(cliente);
  };
  const handleSelectedClient = () => {
    if (!client) {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, selecciona un cliente.",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
    } else {
      fetchVentasByClient(client);
      // setHasSearched(true); // Activar después de hacer clic en Buscar
    }
  };
  const handleClearSearch = () => {
    fetchVentasByClient("");
    fetchData(); // Limpiar el filtro y mostrar todos los datos
  };
  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Esta seguro de desactivar esta venta?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropVenta/${id}`);
            notification.success({
              message: "Venta desactivada",
              description: "La venta se desactivo exitosamente",
              duration: 1,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        });
      } else {
        confirm({
          title: "¿Esta seguro de activar esta venta?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upVenta/${id}`);
            notification.success({
              message: "Venta activado",
              description: "La venta se activo exitosamente",
              duration: 1,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        });
      }
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the article:`,
        error
      );
    }
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
          title={row.total}
        >
          <span>{row.total}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Descuento",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.descuento + "%"}
        >
          <span>{row.descuento}%</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.total_con_descuento}
        >
          <span>{row.total_con_descuento}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      selector: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
        </Button>
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
      <div style={{ display: "flex", width: "30%" }}>
        <ClienteInput
          value={client}
          onChangeCliente={handleClietChange}
          onInputChange={setClient}
        />

        <Button onClick={handleSelectedClient} type="primary">
          <span>
            <SearchOutlined />
          </span>
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={handleClearSearch}
          style={{ width: "40px" }} // Ajusta el tamaño del botón
        />
      </div>
      <DataTable
        columns={columns}
        data={data}
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
        <div style={{ display: "flex", margin: 10 }}>
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
        </Button>

        <DynamicList
          items={venta.articulos}
          onDelete={handleDeleteArticulo}
          onGiftChange={handleGiftChange}
          onEdit={handleEditPrecio}
        />
        <div style={{ display: "flex", margin: 10 }}>
          <Tooltip>Descuento</Tooltip>
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
