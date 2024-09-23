import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Drawer, Button, Input, Spin, Tooltip, InputNumber } from "antd";
import { Link } from "react-router-dom";
import { format, set } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import ClienteInput from "../components/ClienteInput";
import DynamicList from "../components/DynamicList";
import CustomPagination from "../components/CustomPagination";
import { customHeaderStyles } from "../style/dataTableStyles"; // Importa los estilos reutilizables
import OfertasInput from "../components/OfertasInput";

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
          nroVenta: `V${String(nextSaleNumber).padStart(3, "0")}`,
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
    console.log(selectedArticulo, cantidad);
    if (selectedArticulo && cantidad > 0) {
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
      alert("Seleccione un artículo y una cantidad válida");
    }
  };

  const handleDeleteArticulo = (id) => {
    setVenta((prev) => ({
      ...prev,
      articulos: prev.articulos.filter((articulo) => articulo.id !== id),
    }));
  };

  const handleAddVenta = async () => {
    if (venta.cliente && venta.articulos.length > 0) {
      try {
        const ventaData = {
          cliente_id: venta.cliente.id,
          nroVenta: venta.nroVenta,
          zona_id: venta.cliente.zona_id,
          pago: 0,
          detalles: venta.articulos.map((articulo) => ({
            articulo_id: articulo.value, // Usamos el ID del artículo
            costo: articulo.costo, // Asegúrate de que este campo esté presente
            cantidad: articulo.quantity,
            precio_monotributista: articulo.precio_monotributista,
          })),
        };

        const response = await axios.post(
          "http://localhost:3001/addVenta",
          ventaData
        );

        if (response.status === 203) {
          const articuloFaltante = response.data.error_code;
          alert(`Stock insuficiente para ${articuloFaltante}`);
          return;
        } else {
          setVenta({ articulos: [], cliente: null, nroVenta: "" });
          setArticuloValue("");
          setClienteValue("");
          setCantidad(0);
          setOpen(false);
          alert("Venta registrada con éxito");
          fetchData();
        }
      } catch (error) {
        console.error("Error al enviar la venta:", error);
        alert("Error al registrar la venta");
      }
    } else {
      alert("Seleccione un cliente y agregue al menos un artículo");
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
      alert("Seleccione una oferta válida");
    }
  };

  const columns = [
    { name: "Nro. Venta", selector: (row) => row.nroVenta, sortable: true },
    { name: "Cliente", selector: (row) => row.nombre_cliente, sortable: true },
    { name: "Zona", selector: (row) => row.nombre_zona, sortable: true },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha_venta), "dd/MM/yyyy"),
      sortable: true,
    },
    { name: "Total Costo", selector: (row) => row.total_costo, sortable: true },
    {
      name: "Total Precio Monotributista",
      selector: (row) => row.total_monotributista,
      sortable: true,
    },
    {
      name: "Pago",
      selector: (row) => (row.pago ? "Pagado" : "No Pagado"),
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
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
      <DataTable
        columns={columns}
        data={data}
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
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

        <DynamicList items={venta.articulos} onDelete={handleDeleteArticulo} />
        <Button onClick={handleAddVenta} type="primary">
          Registrar Venta
        </Button>
      </Drawer>
    </MenuLayout>
  );
}

export default Ventas;
