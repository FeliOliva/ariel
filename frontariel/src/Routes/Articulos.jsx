import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input } from "antd";
import MenuLayout from "../components/MenuLayout";
import FetchComboBox from "../components/FetchComboBox";
import TransitionsModal from "../components/TransitionsModal";

const Articulos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState(0);
  const [codigoProducto, setCodigoProducto] = useState("");
  const [precio_monotributista, setPrecioMonotributista] = useState(0);
  const [costo, setCosto] = useState(0);
  const [proveedorId, setProveedorId] = useState(null);
  const [subLineaId, setSubLineaId] = useState("");
  const [lineaId, setLineaId] = useState("");
  const [hasSublinea, setHasSublinea] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/articulos");
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddArticulo = async () => {
    try {
      const nuevoArticulo = {
        nombre,
        stock,
        codigo_producto: codigoProducto,
        proveedor_id: proveedorId.value,
        precio_monotributista,
        costo,
        subLinea_id: subLineaId,
        linea_id: lineaId,
      };
      console.log(nuevoArticulo);
      await axios.post("http://localhost:3000/addArticulo", nuevoArticulo);
      fetchData();
      setOpen(false);
      alert("Artículo agregado con éxito");
      // window.location.reload();
    } catch (error) {
      console.error("Error adding article:", error);
      alert("Error al agregar el artículo");
    }
  };

  const handleSubLineaSelect = async (selectedSubLineaId) => {
    const fetchSubLinea = selectedSubLineaId.value;
    setSubLineaId(fetchSubLinea);

    try {
      const response = await axios.get(
        `http://localhost:3000/getLineaBySublinea/${fetchSubLinea}`
      );
      const lineaID = response.data.id;
      setLineaId(parseInt(lineaID));
      setHasSublinea(true);
      console.log(fetchSubLinea, lineaID);
    } catch (error) {
      console.error("Error fetching sublinea details:", error);
    }
  };

  const handleLineaSelect = async (selectedLineaId) => {
    const lineaId = selectedLineaId.value;
    setLineaId(lineaId);
    setSubLineaId(5);
    console.log("Linea id: ", lineaId, "subLinea id: ", subLineaId);
    setHasSublinea(false);
  };

  const columns = [
    { name: "Codigo", selector: (row) => row.articulo_codigo, sortable: true },
    { name: "Nombre", selector: (row) => row.articulo_nombre, sortable: true },
    { name: "Stock", selector: (row) => row.articulo_stock, sortable: true },
    { name: "Linea", selector: (row) => row.linea_nombre, sortable: true },
    {
      name: "SubLinea",
      selector: (row) => row.sublinea_nombre,
      sortable: true,
    },
    {
      name: "Costo",
      selector: (row) => row.articulo_costo,
      sortable: true,
    },
    {
      name: "Precio monotributista",
      selector: (row) => row.precio_monotributista,
      sortable: true,
    },
    {
      name: "Proveedor",
      selector: (row) => row.proveedor_nombre,
      sortable: true,
    },
    { name: "Estado", selector: (row) => row.estado, sortable: true },
  ];

  return (
    <MenuLayout>
      <Button onClick={() => setOpen(true)} type="primary">
        Agregar Artículo
      </Button>
      <Drawer
        open={open}
        title="Nuevo Artículo"
        closable={true}
        maskClosable={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del artículo"
          style={{ marginBottom: 10 }}
        />
        <br />
        <span style={{ fontWeight: "bold" }}>Stock</span>
        <br />
        <InputNumber
          min={0}
          value={stock}
          onChange={setStock}
          placeholder="Ingrese el stock"
          style={{ marginBottom: 10 }}
        />
        <Input
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          placeholder="Código del producto"
          style={{ marginBottom: 10 }}
        />
        <br />
        <span style={{ fontWeight: "bold" }}>Precio Monotributista</span>
        <br />
        <InputNumber
          min={0}
          value={precio_monotributista}
          onChange={setPrecioMonotributista}
          placeholder="Ingrese el precio monotributista"
          style={{ marginBottom: 10 }}
        />
        <br />
        <span style={{ fontWeight: "bold" }}>Costo</span>
        <br />
        <InputNumber
          min={0}
          value={costo}
          onChange={setCosto}
          placeholder="Ingrese el costo"
          style={{ marginBottom: 10 }}
        />
        <br />
        <FetchComboBox
          url="http://localhost:3000/proveedor"
          label="Proveedor"
          labelKey="nombre"
          valueKey="id"
          onSelect={setProveedorId}
          style={{ marginBottom: 10, width: 200 }}
        />
        <br />
        <Button
          onClick={() => setHasSublinea(true)}
          style={{ marginRight: 10, marginBottom: 10 }}
        >
          Sublínea
        </Button>
        <Button onClick={() => setHasSublinea(false)}>Línea</Button>
        <br />
        {hasSublinea ? (
          <FetchComboBox
            url="http://localhost:3000/subLinea"
            label="Sublínea"
            labelKey="subLinea_nombre"
            valueKey="subLinea_id"
            onSelect={handleSubLineaSelect}
            style={{ marginBottom: 10, width: 150 }}
          />
        ) : (
          <FetchComboBox
            url="http://localhost:3000/lineas"
            label="Línea"
            labelKey="nombre"
            valueKey="id"
            onSelect={handleLineaSelect}
            style={{ marginBottom: 10, width: 150 }}
          />
        )}
        <div style={{ display: "flex" }}>
          <TransitionsModal
            url="http://localhost:3000/addLinea"
            title="Agregar Línea"
            fields={[
              { name: "nombre", label: "Nombre de la linea" },
              { name: "SubLinea", label: "Nombre de la SubLinea" },
            ]}
          />
          <TransitionsModal
            url="http://localhost:3000/addSublinea"
            title="Agregar subLínea"
            fields={[
              { name: "subLineaNombre", label: "Nombre de la SubLínea" },
              {
                name: "lineaId",
                label: "Línea a la que pertenece",
                type: "fetchComboBox",
                url: "http://localhost:3000/lineas",
              },
            ]}
          />
        </div>
        <br />
        <Button onClick={handleAddArticulo} type="primary">
          Agregar
        </Button>
      </Drawer>
      <div>
        <h1>Lista de Productos</h1>
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
        />
      </div>
    </MenuLayout>
  );
};

export default Articulos;
