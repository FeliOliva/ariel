import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import FetchComboBox from "../components/FetchComboBox";
import ProveedorList from "../components/ProveedorList";

const Articulos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [stock, setStock] = useState(0);
  const [codigoProducto, setCodigoProducto] = useState("");
  const [precio_monotributista, setPrecioMonotributista] = useState(0);
  const [costo, setCosto] = useState(0);
  const [proveedorId, setProveedorId] = useState("");
  const [subLineaId, setSubLineaId] = useState("");
  const [lineaId, setLineaId] = useState("");
  const [hasSublinea, setHasSublinea] = useState(false);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [openSublineaDrawer, setOpenSublineaDrawer] = useState(false);
  const [subLineaValue, setSubLineaValue] = useState("");
  const [lineaValue, setLineaValue] = useState("");
  const [lineaFetched, setLineaFetched] = useState("");
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentArticulo, setCurrentArticulo] = useState(null);
  const [proveedor, setProveedor] = useState("");
  const [linea, setLinea] = useState("");
  const [subLinea, setSubLinea] = useState("");
  const [openEditProveedorDrawer, setOpenEditProveedorDrawer] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/articulos");
      setData(response.data);
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
        proveedor_id: proveedorId.id,
        precio_monotributista,
        costo,
        subLinea_id: subLineaId,
        linea_id: lineaId,
      };
      console.log(nuevoArticulo);
      await axios.post("http://localhost:3001/addArticulo", nuevoArticulo);
      fetchData();
      setOpen(false);
      alert("Artículo agregado con éxito");
      window.location.reload();
    } catch (error) {
      console.error("Error adding article:", error);
      alert("Error al agregar el artículo");
    }
  };

  const handleEditArticulo = async () => {
    if (!nombre || !codigoProducto || !proveedorId) {
      alert(
        "Los campos Nombre, Código de Producto y Proveedor son obligatorios"
      );
      return;
    }

    const articuloActualizado = {
      articulo_nombre: nombre,
      articulo_stock: stock,
      articulo_codigo: codigoProducto,
      articulo_costo: costo,
      precio_monotributista,
      proveedor_id: proveedorId.id,
      sublinea_id: subLineaId,
      linea_id: lineaId,
      articulo_id: currentArticulo.articulo_id,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/updateArticulo`,
        articuloActualizado
      );

      const updatedData = data.map((articulo) =>
        articulo.articulo_id === currentArticulo.articulo_id
          ? response.data
          : articulo
      );

      setData(updatedData);
      alert("Artículo actualizado con éxito");
      setOpenEditDrawer(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating the article:", error);
    }
  };

  const handleOpenEditDrawer = async (id) => {
    console.log(id);
    try {
      const response = await axios.get(
        `http://localhost:3001/getArticuloByID/${id}`
      );
      if (response.data.length > 0) {
        const articulo = response.data[0];
        console.log(articulo);
        setCurrentArticulo(articulo);
        setNombre(articulo.articulo_nombre);
        setStock(articulo.articulo_stock);
        setCodigoProducto(articulo.articulo_codigo);
        setCosto(articulo.articulo_costo);
        setPrecioMonotributista(articulo.precio_monotributista);
        const proveedorResponse = await axios.get(
          `http://localhost:3001/getZonaByID/${response.data.proveedor_id}`
        );
        setProveedor({
          id: response.data.proveedor_id,
          nombre: proveedorResponse.data.proveedor_nombre,
        });
        setSubLineaId(articulo.subLinea_id);
        setLineaId(articulo.linea_id);
        setLinea(articulo.linea_nombre);
        setSubLinea(articulo.sublinea_nombre);
        setOpenEditDrawer(true);
        console.log(proveedor);
      } else {
        console.error("No data found for the provided ID");
      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleSubLineaSelect = async (selectedSubLineaId) => {
    const fetchSubLinea = selectedSubLineaId.subLinea_id;
    console.log(selectedSubLineaId);
    setSubLineaId(fetchSubLinea);

    try {
      const response = await axios.get(
        `http://localhost:3001/getLineaBySublinea/${fetchSubLinea}`
      );
      const lineaID = response.data.id;
      setLineaId(parseInt(lineaID));
      setHasSublinea(true);
      console.log(fetchSubLinea);
      console.log("ssss");
      console.log(lineaID);
    } catch (error) {
      console.error("Error fetching sublinea details:", error);
    }
  };

  const handleLineaFetch = async (selectedLineaFetch) => {
    setLineaValue(selectedLineaFetch.id);
    console.log(selectedLineaFetch.id);
  };

  const handleAddSubLinea = async () => {
    try {
      const nuevaSubLinea = {
        nombre: subLineaValue,
        linea_id: lineaValue,
      };
      console.log(nuevaSubLinea);
      const response = await axios.post(
        `http://localhost:3001/addSubLinea`,
        nuevaSubLinea
      );
      console.log(response);
      setOpenSublineaDrawer(false);
    } catch (error) {
      console.error("Error al agregar la subLinea:", error);
      alert("Error al agregar el subLinea");
    }
  };

  const handleAddLinea = async () => {
    try {
      const nuevaLinea = {
        nombre: lineaFetched,
      };
      const response = await axios.post(
        "http://localhost:3001/addLinea",
        nuevaLinea
      );
      console.log(nuevaLinea);
      console.log(response);
      setOpenLineaDrawer(false);
    } catch (error) {
      console.error("Error al agregar la linea:", error);
      alert("Error al agregar el linea");
    }
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState) {
        await axios.put(`http://localhost:3001/dropArticulo/${id}`);
      } else {
        await axios.put(`http://localhost:3001/upArticulo/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the article:`,
        error
      );
    }
  };
  const handleEditProveedor = async () => {
    setOpenEditProveedorDrawer(false);
    console.log(proveedor);
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
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
      sortable: true,
    },
    {
      name: "Editar",
      cell: (row) => (
        <Button
          type="primary"
          onClick={() => handleOpenEditDrawer(row.articulo_id)}
        >
          Editar
        </Button>
      ),
    },
    {
      name: "Habilitar/Deshabilitar",
      cell: (row) => (
        <Button
          type="primary"
          onClick={() => handleToggleState(row.articulo_id, row.estado)}
        >
          {row.estado ? "Desactivar" : "Activar"}
        </Button>
      ),
    },
  ];

  return (
    <MenuLayout>
      <Button onClick={() => setOpen(true)} type="primary">
        Agregar Artículo
      </Button>
      <Drawer
        open={open}
        title="Agregar Artículo"
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Stock</Tooltip>
        </div>
        <InputNumber
          value={stock}
          onChange={(value) => setStock(value)}
          placeholder="Stock"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Codigo Producto</Tooltip>
        </div>
        <Input
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          placeholder="Codigo Producto"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Proveedor</Tooltip>
        </div>
        <FetchComboBox
          placeholder="Proveedor"
          apiUrl="http://localhost:3001/proveedores"
          value={proveedorId}
          onChange={setProveedorId}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Precio Monotributista</Tooltip>
        </div>
        <InputNumber
          value={precio_monotributista}
          onChange={(value) => setPrecioMonotributista(value)}
          placeholder="Precio monotributista"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Costo</Tooltip>
        </div>
        <InputNumber
          value={costo}
          onChange={(value) => setCosto(value)}
          placeholder="Costo"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Linea</Tooltip>
        </div>
        <FetchComboBox
          placeholder="Linea"
          apiUrl="http://localhost:3001/lineas"
          value={lineaValue}
          onChange={handleLineaFetch}
        />
        <Button onClick={() => setOpenLineaDrawer(true)}>Agregar Linea</Button>
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>SubLinea</Tooltip>
        </div>
        <FetchComboBox
          placeholder="SubLinea"
          apiUrl="http://localhost:3001/subLineas"
          value={subLineaValue}
          onChange={handleSubLineaSelect}
        />
        <Button onClick={() => setOpenSublineaDrawer(true)}>
          Agregar SubLinea
        </Button>
        <Button onClick={handleAddArticulo} type="primary">
          Agregar Articulo
        </Button>
      </Drawer>
      <Drawer
        open={openLineaDrawer}
        title="Agregar Linea"
        onClose={() => setOpenLineaDrawer(false)}
      >
        <Input
          value={lineaFetched}
          onChange={(e) => setLineaFetched(e.target.value)}
          placeholder="Linea"
        />
        <Button onClick={handleAddLinea} type="primary">
          Agregar Linea
        </Button>
      </Drawer>
      <Drawer
        open={openSublineaDrawer}
        title="Agregar Sublinea"
        onClose={() => setOpenSublineaDrawer(false)}
      >
        <FetchComboBox
          placeholder="Linea"
          apiUrl="http://localhost:3001/lineas"
          value={lineaValue}
          onChange={handleLineaFetch}
        />
        <Input
          value={subLineaValue}
          onChange={(e) => setSubLineaValue(e.target.value)}
          placeholder="SubLinea"
        />
        <Button onClick={handleAddSubLinea} type="primary">
          Agregar Sublinea
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Articulo"
        onClose={() => setOpenEditDrawer(false)}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Stock</Tooltip>
        </div>
        <InputNumber
          value={stock}
          onChange={(value) => setStock(value)}
          placeholder="Stock"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Codigo Producto</Tooltip>
        </div>
        <Input
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          placeholder="Codigo Producto"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Proveedor</Tooltip>
        </div>
        <Input
          value={proveedor.nombre}
          readOnly
          style={{ width: "100%", marginBottom: 10 }}
        />
        <Button
          onClick={() => setOpenEditProveedorDrawer(true)}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Editar Proveedor
        </Button>
        <Drawer
          open={openEditProveedorDrawer}
          title="Editar Proveedor"
          onClose={() => setOpenEditProveedorDrawer(false)}
        >
          <ProveedorList></ProveedorList>
          {/* <FetchComboBox
            url="http://localhost:3001/proveedor"
            label="Proveedor"
            labelKey="nombre"
            valueKey="id"
            initialValue={proveedor}
            onSelect={setProveedor}
            style={{ marginBottom: 10 }}
          /> */}
          <Button onClick={handleEditProveedor} type="primary">
            Guardar Cambios
          </Button>
        </Drawer>
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Precio Monotributista</Tooltip>
        </div>
        <InputNumber
          value={precio_monotributista}
          onChange={(value) => setPrecioMonotributista(value)}
          placeholder="Precio monotributista"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Costo</Tooltip>
        </div>
        <InputNumber
          value={costo}
          onChange={(value) => setCosto(value)}
          placeholder="Costo"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Linea</Tooltip>
        </div>
        <Input
          value={linea}
          readOnly
          style={{ width: "50%", marginBottom: 10 }}
        />
        <Button>Agregar Linea</Button>
        {/* <FetchComboBox
          placeholder="Linea"
          apiUrl="http://localhost:3001/lineas"
          value={lineaValue}
          onChange={handleLineaFetch}
        /> */}
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>SubLinea</Tooltip>
        </div>
        <Input
          value={subLinea}
          readOnly
          style={{ width: "50%", marginBottom: 10 }}
        />
        {/* <FetchComboBox
          placeholder="SubLinea"
          apiUrl="http://localhost:3001/subLineas"
          value={subLineaValue}
          onChange={handleSubLineaSelect}
        /> */}
        <Button>Agregar SubLinea</Button>
        <Button onClick={handleEditArticulo} type="primary">
          Guardar Cambios
        </Button>
      </Drawer>
      <DataTable columns={columns} data={data} progressPending={loading} />
    </MenuLayout>
  );
};

export default Articulos;
