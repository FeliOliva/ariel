import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import { Drawer, Button, InputNumber, Input } from "antd";
import FetchComboBox from "../components/FetchComboBox";
import DynamicList from "../components/DynamicList";

const Venta = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [articulos, setArticulos] = useState([]);
  const [openVentaDrawer, setOpenVentaDrawer] = useState(false);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [openSublineaDrawer, setOpenSublineaDrawer] = useState(false);
  const [nroVenta, setNroVenta] = useState("V001");
  const [newLinea, setNewLinea] = useState("");
  const [newSublinea, setNewSublinea] = useState("");
  const [selectedLinea, setSelectedLinea] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/ventas");
      setData(response.data);
      if (response.data.length > 0) {
        const lastSaleNumber =
          response.data[response.data.length - 1].nro_venta;
        const nextSaleNumber = parseInt(lastSaleNumber.substring(1)) + 1;
        setNroVenta(`V${String(nextSaleNumber).padStart(3, "0")}`);
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

  const handleAddArticulo = () => {
    if (selectedArticulo) {
      const newArticulo = {
        label: selectedArticulo.articulo_nombre,
        value: selectedArticulo.articulo_id,
        quantity: cantidad,
        costo: 0,
        precio_monotributista: 0,
      };
      setArticulos((prevArticulos) => [...prevArticulos, newArticulo]);
      setSelectedArticulo(null);
      setCantidad(1);
    }
  };

  const handleDeleteArticulo = (index) => {
    setArticulos(articulos.filter((_, i) => i !== index));
  };

  const handleSendVenta = async () => {
    if (selectedCliente && articulos.length > 0) {
      try {
        const zonaId = selectedCliente.zona_id;

        const ventaData = {
          cliente_id: selectedCliente.id,
          nroVenta,
          zona_id: zonaId,
          pago: 1,
          detalles: articulos.map((articulo) => ({
            articulo_id: articulo.value,
            costo: articulo.costo,
            cantidad: articulo.quantity,
            precio_monotributista: articulo.precio_monotributista,
          })),
        };

        await axios.post("http://localhost:3000/addVenta", ventaData);
        setArticulos([]);
        setSelectedCliente(null);
        setSelectedArticulo(null);
        setCantidad(1);
        setOpenVentaDrawer(false);
        alert("Venta registrada con éxito");
        fetchData();
      } catch (error) {
        console.error("Error sending venta:", error);
        alert("Error al registrar la venta");
      }
    } else {
      alert("Seleccione un cliente y agregue al menos un artículo");
    }
  };

  const handleAddLinea = async () => {
    if (newLinea.trim() === "") {
      alert("Ingrese el nombre de la línea");
      return;
    }

    try {
      await axios.post("http://localhost:3000/addLinea", { nombre: newLinea });
      alert("Línea agregada con éxito");
      setNewLinea("");
    } catch (error) {
      console.error("Error agregando línea:", error);
      alert("Error al agregar la línea");
    }
  };

  const handleAddSublinea = async () => {
    if (newSublinea.trim() === "" || !selectedLinea) {
      alert("Ingrese el nombre de la sublínea y seleccione una línea");
      return;
    }

    try {
      await axios.post("http://localhost:3000/addSublinea", {
        nombre: newSublinea,
        linea_id: selectedLinea.linea_id,
      });
      alert("Sublínea agregada con éxito");
      setNewSublinea("");
      setSelectedLinea(null);
    } catch (error) {
      console.error("Error agregando sublínea:", error);
      alert("Error al agregar la sublínea");
    }
  };

  const columns = [
    { name: "Nro Venta", selector: (row) => row.nro_venta, sortable: true },
    { name: "Cliente", selector: (row) => row.nombre_cliente, sortable: true },
    { name: "Zona", selector: (row) => row.nombre_zona, sortable: true },
    {
      name: "Pago",
      selector: (row) => (row.pago ? "Sí" : "No"),
      sortable: true,
    },
    {
      name: "Total Costo",
      selector: (row) => row.total_costo,
      sortable: true,
    },
    {
      name: "Total Monotributista",
      selector: (row) => row.total_monotributista,
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Link to={`/venta/${row.id}`}>
          <button>Detalle de Venta</button>
        </Link>
      ),
    },
  ];

  return (
    <MenuLayout>
      <Button onClick={() => setOpenVentaDrawer(true)} type="primary">
        Agregar venta
      </Button>
      <Drawer
        open={openVentaDrawer}
        title="Nueva Venta"
        footer={"Zona de ventas"}
        closable={true}
        maskClosable={false}
        onClose={() => setOpenVentaDrawer(false)}
      >
        <Input value={nroVenta} readOnly style={{ marginBottom: 10 }} />
        <FetchComboBox
          url="http://localhost:3000/articulos"
          label="Seleccione los articulos"
          labelKey="articulo_nombre"
          valueKey="articulo_id"
          onSelect={setSelectedArticulo}
        />
        <InputNumber
          min={1}
          value={cantidad}
          onChange={setCantidad}
          style={{ marginLeft: 10 }}
        />
        <Button
          onClick={handleAddArticulo}
          type="primary"
          style={{ marginLeft: 10 }}
        >
          Agregar
        </Button>
        <DynamicList items={articulos} onDelete={handleDeleteArticulo} />
        <FetchComboBox
          url="http://localhost:3000/clientes"
          label="Seleccione el cliente"
          labelKey="nombre"
          valueKey="id"
          onSelect={setSelectedCliente}
        />
        <Button
          onClick={handleSendVenta}
          type="primary"
          style={{ marginTop: 10 }}
        >
          Cargar Venta
        </Button>
        <div style={{ display: "flex"}}>
          <Button
            onClick={() => setOpenLineaDrawer(true)}
            type="primary"
            style={{ marginTop: 10 }}
          >
            Agregar linea
          </Button>
          <Button
            onClick={() => setOpenSublineaDrawer(true)}
            type="primary"
            style={{ marginTop: 10 }}
          >
            Agregar Sublinea
          </Button>
        </div>
      </Drawer>

      <Drawer
        open={openLineaDrawer}
        title="Agregar línea"
        footer={"Zona de Líneas"}
        closable={true}
        maskClosable={false}
        onClose={() => setOpenLineaDrawer(false)}
      >
        <div>
          <Input
            placeholder="Nombre de la Línea"
            value={newLinea}
            onChange={(e) => setNewLinea(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Button
            onClick={handleAddLinea}
            type="primary"
            style={{ marginBottom: 10 }}
          >
            Agregar Línea
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={openSublineaDrawer}
        title="agregar sublínea"
        closable={true}
        maskClosable={false}
        onClose={() => setOpenSublineaDrawer(false)}
      >
        {" "}
        <FetchComboBox
          url="http://localhost:3000/lineas"
          label="Seleccione la Línea"
          labelKey="nombre"
          valueKey="linea_id"
          onSelect={setSelectedLinea}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Nombre de la Sublínea"
          value={newSublinea}
          onChange={(e) => setNewSublinea(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button
          onClick={handleAddSublinea}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Agregar Sublínea
        </Button>
      </Drawer>

      <div>
        <h1>Lista de Ventas</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable columns={columns} data={data} pagination />
        )}
      </div>
    </MenuLayout>
  );
};

export default Venta;
