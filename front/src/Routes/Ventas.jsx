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
import { ExclamationCircleOutlined } from "@ant-design/icons";

function Ventas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [venta, setVenta] = useState({
    articulos: [],
    cliente: null,
    nroVenta: "",
  });
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [articuloValue, setArticuloValue] = useState(""); // Estado para el valor del input del artículo
  const [clienteValue, setClienteValue] = useState(""); // Estado para el valor del input del cliente
  const [ofertaValue, setOfertaValue] = useState(""); // Estado para el valor del input de la oferta
  const [selectedOferta, setSelectedOferta] = useState(""); // Estado para el valor del input de la oferta
  const { confirm } = Modal;
  const navigate = useNavigate();
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
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    console.log(selectedArticulo);
    console.log(cantidad);
    console.log(selectedArticulo.stock);
    if (selectedArticulo && cantidad > 0) {
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
      setVenta((prev) => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            ...selectedArticulo,
            quantity: cantidad,
            label:
              selectedArticulo.nombre +
              " - " +
              selectedArticulo.linea_nombre +
              " - " +
              selectedArticulo.sublinea_nombre,
            value: selectedArticulo.id,
          },
        ],
      }));
      setSelectedArticulo(null); // Reset selected article after adding
      setCantidad(0); // Reset quantity to 1 after adding
      setArticuloValue(""); // Reset input value
    } else {
      Modal.warning({
        title: "Advertencia",
        content: "Seleccione un articulo y una cantidad valida",
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  const handleDeleteArticulo = (id) => {
    setVenta((prev) => ({
      ...prev,
      articulos: prev.articulos.filter((articulo) => articulo.id !== id),
    }));
  };
  const handleGiftChange = (id, isGift) => {
    setVenta((prev) => ({
      ...prev,
      articulos: prev.articulos.map((articulo) =>
        articulo.id === id
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
      console.log(venta.descuento);
      try {
        const ventaData = {
          cliente_id: venta.cliente.id,
          nroVenta: venta.nroVenta,
          zona_id: venta.cliente.zona_id,
          descuento: venta.descuento,
          pago: 0,
          detalles: venta.articulos.map((articulo) => ({
            articulo_id: articulo.value, // Usamos el ID del artículo
            costo: articulo.costo, // Asegúrate de que este campo esté presente
            cantidad: articulo.quantity,
            precio_monotributista: articulo.precio_monotributista,
            isGift: articulo.isGift ? true : false,
          })),
        };
        console.log(ventaData);
        await axios.post("http://localhost:3001/addVenta", ventaData);

        confirm({
          title: "Confirmar",
          content: "¿Desea registrar la venta?",
          okText: "Si",
          cancelText: "No",
          onOk: () => {
            setVenta({ articulos: [], cliente: null, nroVenta: "" });
            setArticuloValue("");
            setClienteValue("");
            setCantidad(0);
            setOpen(false);
            notification.success({
              message: "Exito",
              description: "Venta registrada con exito",
              duration: 2,
            });
            fetchData();
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

        // Itera sobre los productos y agrega cada uno a la lista de artículos de la venta
        productos.forEach((producto) => {
          setVenta((prev) => ({
            ...prev,
            articulos: [
              ...prev.articulos,
              {
                id: producto.id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio), // Convierte el precio a número
                cantidad: producto.cantidad, // La cantidad que viene en el producto de la oferta
                costo: producto.precio * 0.8, // Ejemplo de cálculo de costo, ajusta según tu lógica
                precio_monotributista: parseFloat(producto.precio), // Puedes modificar este valor si es diferente
                label: `${producto.nombre} - ${producto.nombre_linea} - ${producto.nombre_sublinea}`,
                value: producto.id,
                quantity: producto.cantidad, // O la cantidad que desees usar por defecto
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

  const columns = [
    {
      name: "Nro. Venta",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.nroVenta}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Cliente",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.nombre_cliente + " " + row.apellido_cliente}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Zona",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.nombre_zona}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {format(new Date(row.fecha_venta), "dd/MM/yyyy")}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Total Precio Monotributista",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.total_monotributista}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Descuento",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.descuento}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Total con descuento",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.total_con_descuento}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Método de Pago",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.metodo_pago || "No Pagado"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Pago",
      selector: (row) => (
        <span className={row.pago === 1 ? "strikethrough" : ""}>
          {row.pago ? "Pagado" : "No Pagado"}
        </span>
      ),
      sortable: true,
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
        style={{ marginBottom: 10 }}
        onClick={() => setOpen(true)}
      >
        Nueva Venta
      </Button>
      <Button type="primary" onClick={handleGoToCheques}>
        Ver Cheques
      </Button>
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
        footer={"Zona de ventas"}
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
        <Button onClick={handleAddVenta} type="primary">
          Registrar Venta
        </Button>
      </Drawer>
    </MenuLayout>
  );
}

export default Ventas;
