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
  const [open, setOpen] = useState(false);
  const [nroVenta, setNroVenta] = useState("V001");

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
        label: selectedArticulo.label,
        value: selectedArticulo.value,
        quantity: cantidad,
        costo: 0,
        precio_monotributista: 0,
      };
      setArticulos([...articulos, newArticulo]);
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
        const clienteResponse = await axios.get(
          `http://localhost:3000/getClientsByID/${selectedCliente.value}`
        );
        const zonaId = clienteResponse.data.zona_id;

        const ventaData = {
          cliente_id: selectedCliente.value,
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
        setOpen(false);
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

  return (
    <MenuLayout>
      <Button onClick={() => setOpen(true)} type="primary">
        Agregar venta
      </Button>
      <Drawer
        open={open}
        title="Nueva Venta"
        footer={"Zona de ventas"}
        closable={true}
        maskClosable={false}
        onClose={() => setOpen(false)}
      >
        <Input value={nroVenta} readOnly style={{ marginBottom: 10 }} />
        <FetchComboBox
          url="http://localhost:3000/articulos"
          label="Seleccione los articulos"
          labelKey="articulo_nombre"
          valueKey="id"
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
        <Button onClick={() => setOpen(false)} style={{ marginTop: 10 }}>
          Close
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
