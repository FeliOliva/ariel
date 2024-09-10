import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Drawer, Button, Input, Tooltip, Select, InputNumber } from "antd";
import { Link } from "react-router-dom";
import ProveedoresInput from "../components/ProveedoresInput";
import CustomPagination from "../components/CustomPagination";
import { customHeaderStyles } from "../style/dataTableStyles";
import { format } from "date-fns";

function Compras() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [compra, setCompra] = useState({
    articulos: [],
    nro_compra: "",
    cantidad: 1, // Cantidad por defecto
  });
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/compras");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const determineNextCompraNumber = () => {
    if (data.length > 0) {
      const lastCompra = data.reduce((max, compra) => {
        const nro = parseInt(compra.nro_compra.replace("C", ""));
        return nro > max ? nro : max;
      }, 0);
      return `C${String(lastCompra + 1).padStart(3, "0")}`;
    } else {
      return "C001";
    }
  };

  const handleOpenDrawer = () => {
    const nextCompraNumber = determineNextCompraNumber();
    setCompra((prev) => ({
      ...prev,
      nro_compra: nextCompraNumber,
    }));
    setOpen(true);
  };

  const handleProveedorChange = async (proveedor) => {
    setSelectedProveedor(proveedor);

    try {
      const response = await axios.get(
        `http://localhost:3001/getArticulosByProveedorID/${proveedor.id}`
      );
      setArticulosFiltrados(response.data);
    } catch (error) {
      console.error("Error fetching filtered articles:", error);
    }
  };

  const handleAddArticulo = () => {
    if (selectedArticulo && compra.cantidad > 0) {
      const articuloSeleccionado = articulosFiltrados.find(
        (articulo) => articulo.id === selectedArticulo
      );
      if (!articuloSeleccionado) {
        alert("Artículo no válido");
        return;
      }

      setCompra((prev) => ({
        ...prev,
        articulos: [
          ...prev.articulos,
          {
            id: articuloSeleccionado.id,
            nombre: articuloSeleccionado.nombre,
            cantidad: compra.cantidad, // Cantidad del artículo
            costo: parseFloat(articuloSeleccionado.costo), // Asigna el costo del artículo
          },
        ],
      }));
      setSelectedArticulo(null); // Reinicia la selección de artículo
      setCompra((prev) => ({ ...prev, cantidad: 1 })); // Reinicia la cantidad
    } else {
      alert("Seleccione un artículo y una cantidad válida");
    }
  };

  const handleDeleteArticulo = (id) => {
    setCompra((prev) => ({
      ...prev,
      articulos: prev.articulos.filter((articulo) => articulo.id !== id),
    }));
  };

  const handleRegistrarCompra = async () => {
    if (!selectedProveedor || compra.articulos.length === 0) {
      alert("Seleccione un proveedor y añada al menos un artículo.");
      return;
    }

    const payload = {
      proveedor_id: selectedProveedor.id,
      nro_compra: compra.nro_compra,
      total: compra.articulos.reduce(
        (acc, articulo) => acc + articulo.cantidad * articulo.costo,
        0
      ),
      detalles: compra.articulos.map((articulo) => ({
        articulo_id: articulo.id,
        cantidad: articulo.cantidad,
        costo: articulo.costo,
      })),
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/addCompra",
        payload
      );
      alert("Compra registrada exitosamente.");
      setOpen(false);
      fetchData(); // Actualiza la tabla de compras
    } catch (error) {
      console.error("Error registrando la compra:", error);
      alert("Hubo un error al registrar la compra.");
    }
  };

  const columns = [
    {
      name: "Nro. Compra",
      selector: (row) => row.nro_compra,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha_compra), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Proveedor",
      selector: (row) => row.proveedor_nombre,
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => row.total,
      sortable: true,
    },
    {
      name: "Detalle",
      selector: (row) => (
        <Link to={`/compras/${row.id}`}>
          <button>Ver detalles</button>
        </Link>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MenuLayout>
      <h1>Compras</h1>
      <Button onClick={handleOpenDrawer} type="primary">
        Registrar Compra
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva Compra"
        placement="right"
        closable={true}
        maskClosable={false}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nro de Compra</Tooltip>
        </div>
        <Input
          value={compra?.nro_compra}
          style={{ marginBottom: 10 }}
          readOnly
        />

        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Seleccione el proveedor</Tooltip>
        </div>
        <ProveedoresInput onChangeProveedor={handleProveedorChange} />

        {/* Input de artículos solo si se selecciona un proveedor */}
        {selectedProveedor && (
          <div style={{ marginTop: 10 }}>
            <Tooltip>Seleccione el artículo</Tooltip>
            <Select
              placeholder="Seleccione un artículo"
              options={articulosFiltrados.map((articulo) => ({
                label: articulo.nombre,
                value: articulo.id,
              }))}
              value={selectedArticulo}
              onChange={(value) => setSelectedArticulo(value)}
              style={{ width: "100%" }}
            />
            <InputNumber
              min={1}
              value={compra.cantidad}
              onChange={(value) =>
                setCompra((prev) => ({ ...prev, cantidad: value }))
              }
              style={{ marginTop: 10, marginBottom: 10 }}
            />
            <Button
              type="primary"
              onClick={handleAddArticulo}
              style={{ marginBottom: 20 }}
            >
              Agregar Artículo
            </Button>

            <h3>Artículos Seleccionados:</h3>
            <ul>
              {compra.articulos.map((articulo) => (
                <li key={articulo.id}>
                  {articulo.nombre} - Cantidad: {articulo.cantidad}{" "}
                  <Button
                    type="link"
                    onClick={() => handleDeleteArticulo(articulo.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          type="primary"
          onClick={handleRegistrarCompra}
          style={{ marginTop: 20 }}
        >
          Registrar Compra
        </Button>
      </Drawer>

      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        highlightOnHover
        pagination
        paginationComponent={CustomPagination}
        customStyles={customHeaderStyles}
      />
    </MenuLayout>
  );
}

export default Compras;
