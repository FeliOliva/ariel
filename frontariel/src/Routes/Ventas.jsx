import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import { Drawer, Button, InputNumber, Input, Spin } from "antd";
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
  const [nroVenta, setNroVenta] = useState("V001");

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ventas");
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
      const articulo = {
        value: selectedArticulo.articulo_id,
        label: selectedArticulo.articulo_nombre,
        costo: selectedArticulo.articulo_costo,
        quantity: cantidad,
        precio_monotributista: selectedArticulo.precio_monotributista,
      };
      setArticulos([...articulos, articulo]);
      setSelectedArticulo(null);
      setCantidad(1);
    } else {
      alert("Seleccione un artículo");
    }
  };

  const handleDeleteArticulo = (index) => {
    setArticulos(articulos.filter((_, i) => i !== index));
  };

  const handleSendVenta = async () => {
    if (selectedCliente && articulos.length > 0) {
      try {
        const zonaId = selectedCliente.zona_id;
        console.log(zonaId);
        const ventaData = {
          cliente_id: selectedCliente.id,
          nroVenta,
          zona_id: zonaId,
          pago: 0,
          detalles: articulos.map((articulo) => ({
            articulo_id: articulo.value,
            costo: articulo.costo,
            cantidad: articulo.quantity,
            precio_monotributista: articulo.precio_monotributista,
          })),
        };

        await axios.post("http://localhost:3001/addVenta", ventaData);
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
      <Button onClick={() => setOpenVentaDrawer(true)} type="primary">
        Agregar venta
      </Button>
      <DataTable
        title="Listado de Ventas"
        columns={columns}
        data={data}
        pagination
      />
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
          url="http://localhost:3001/articulos"
          label="Seleccione los artículos"
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
          url="http://localhost:3001/clientes"
          label="Seleccione el cliente"
          labelKey="nombre"
          valueKey="id"
          onSelect={setSelectedCliente}
        />
        <Button
          onClick={handleSendVenta}
          type="primary"
          style={{ marginTop: 20 }}
        >
          Registrar Venta
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default Venta;
