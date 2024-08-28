import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import DynamicList from "../components/DynamicList"; // Asegúrate de tener este componente

function Ofertas() {
  const [data, setData] = useState([]);
  const [currentOfert, setCurrentOfert] = useState({});
  const [open, setOpen] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [newOfert, setNewOfert] = useState({
    nombre: "",
    productos: [],
  });
  const [articuloValue, setArticuloValue] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ofertas");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/detalleOferta/${id}`
      );
      setCurrentOfert(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleEditOfert = async () => {
    try {
      const updatedOfert = {
        id: currentOfert.id,
        nombre: currentOfert.nombre,
        productos: currentOfert.productos.map((producto) => ({
          articulo_id: producto.id,
          cantidad: producto.cantidad,
          precio: producto.precio,
        })),
      };

      await axios.put(`http://localhost:3001/updateOferta`, updatedOfert);

      setOpenEditDrawer(false);
      fetchData();
    } catch (error) {
      console.error("Error updating the offer:", error);
    }
  };

  const handleAddArticulo = () => {
    if (articuloValue && cantidad > 0) {
      setNewOfert((prev) => ({
        ...prev,
        productos: [
          ...prev.productos,
          {
            ...articuloValue,
            cantidad,
            precio: articuloValue.precio, // Si necesitas ajustar el precio aquí
          },
        ],
      }));
      setArticuloValue(null);
      setCantidad(1);
    } else {
      alert("Seleccione un artículo y una cantidad válida");
    }
  };

  const handleDeleteArticulo = (id) => {
    setNewOfert((prev) => ({
      ...prev,
      productos: prev.productos.filter((producto) => producto.id !== id),
    }));
  };

  const handleSaveOfert = async () => {
    try {
      await axios.post("http://localhost:3001/addOferta", newOfert);
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving the offer:", error);
    }
  };
  const handleArticuloChange = (articulo) => {
    setArticuloValue(articulo);
    setArticuloValue(articulo?.id || ""); // Actualiza el valor del input del artículo
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Precio total",
      selector: (row) => row.total_oferta,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
      sortable: true,
    },
    {
      name: "Detalles",
      cell: (row) => (
        <Link to={`/ofertas/${row.id}`}>
          <Button type="primary">Detalles</Button>
        </Link>
      ),
    },
    {
      name: "Editar",
      cell: (row) => (
        <Button type="primary" onClick={() => handleOpenEditDrawer(row.id)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <MenuLayout>
      <h1>Listado de ofertas</h1>
      <Button onClick={() => setOpen(true)}>Añadir oferta</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Añadir oferta"
        width={720}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre de la oferta</Tooltip>
        </div>
        <Input
          value={newOfert.nombre}
          onChange={(e) => setNewOfert({ ...newOfert, nombre: e.target.value })}
          placeholder="Nombre de la oferta"
        />
        <div>
          <div style={{ display: "block", marginTop: 10 }}>
            <Tooltip>Seleccionar artículo</Tooltip>
          </div>
          <ArticulosInput
            value={articuloValue}
            onChangeArticulo={handleArticuloChange}
            onInputChange={setArticuloValue}
          />
          <Button
            type="primary"
            onClick={handleAddArticulo}
            style={{ marginBottom: 20 }}
          >
            Agregar Artículo
          </Button>
          <InputNumber
            min={1}
            value={cantidad}
            onChange={(value) => setCantidad(value)}
            style={{ marginBottom: 10 }}
          />
          <DynamicList
            items={newOfert.productos}
            onDelete={handleDeleteArticulo}
          />
          <Button type="primary" onClick={handleSaveOfert}>
            Guardar Oferta
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        title="Editar oferta"
        width={720}
      >
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 20 }}>Nombre de la oferta</strong>
          <Input
            value={currentOfert.nombre}
            style={{ marginTop: 10 }}
            onChange={(e) =>
              setCurrentOfert((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Nombre de la oferta"
          />
        </div>

        {currentOfert?.productos?.map((valueProd, indexProd) => (
          <div
            key={indexProd}
            style={{
              marginBottom: 20,
              padding: 10,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              backgroundColor: "#fafafa",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <strong>{valueProd?.nombre}</strong>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div>
                <strong>Cantidad:</strong>
                <InputNumber
                  value={valueProd?.cantidad}
                  onChange={(value) =>
                    setCurrentOfert((prev) => {
                      const updatedProducts = [...prev.productos];
                      updatedProducts[indexProd].cantidad = value;
                      return { ...prev, productos: updatedProducts };
                    })
                  }
                  placeholder="Cantidad"
                  min={1}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <strong>Precio:</strong>
                <InputNumber
                  value={valueProd?.precio}
                  onChange={(value) =>
                    setCurrentOfert((prev) => {
                      const updatedProducts = [...prev.productos];
                      updatedProducts[indexProd].precio = value;
                      return { ...prev, productos: updatedProducts };
                    })
                  }
                  placeholder="Precio"
                  min={0}
                  step={0.01}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="primary" onClick={handleEditOfert}>
          Guardar
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        pagination
        title="Ofertas"
        highlightOnHover
        width="720px"
      />
    </MenuLayout>
  );
}

export default Ofertas;
