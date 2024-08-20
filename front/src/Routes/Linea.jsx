import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, Tooltip, message } from "antd";

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [linea, setLinea] = useState({ nombre: "" });
  const [subLinea, setSubLinea] = useState([]);
  const [openSubLineaDrawer, setOpenSubLineaDrawer] = useState(false);
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/lineas");
      setLineas(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  const handleLineaChange = (e) => {
    setLinea({ ...linea, nombre: e.target.value });
  };

  const handleGuardarLinea = async () => {
    console.log(linea.nombre);
    try {
      await axios.post("http://localhost:3001/addLinea", {
        nombre: linea.nombre,
      });
      fetchData();
      message.success("Línea añadida exitosamente!");
      setOpenLineaDrawer(false); // Cierra el drawer
      setLinea({ nombre: "" }); // Resetea el estado del input
    } catch (error) {
      console.error("Error al guardar la línea:", error);
      message.error("Hubo un error al añadir la línea.");
    }
  };
  const handleSubLineaChange = (e) => {
    setSubLinea({ ...subLinea, nombre: e.target.value });
  };

  const handleOpenSubLineaDrawer = async (id) => {
    setSubLinea({ linea_id: id });
    setOpenSubLineaDrawer(true);
  };
  const handleAddSubLinea = async () => {
    console.log(subLinea);
    try {
      await axios.post(`http://localhost:3001/addSubLinea`, {
        nombre: subLinea.nombre,
        linea_id: subLinea.linea_id,
      });
      fetchData();
      setOpenSubLineaDrawer(false);
    } catch (error) {
      console.error("Error adding the linea or sublinea:", error);
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitada" : "Deshabilitada"),
      sortable: true,
    },
    {
      name: "Sublíneas",
      cell: (row) => (
        <Link to={`/linea/${row.id}`}>
          <button>Ver Sublíneas</button>
        </Link>
      ),
    },
    {
      name: "Añadir Sublineas",
      cell: (row) => (
        <Button type="primary" onClick={() => handleOpenSubLineaDrawer(row.id)}>
          Añadir SubLineas
        </Button>
      ),
    },
  ];
  return (
    <MenuLayout>
      <Button onClick={() => setOpenLineaDrawer(true)} type="primary">
        Añadir Línea
      </Button>
      <div>
        <h1>Lista de Líneas</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable
            style={{ width: "100%" }}
            columns={columns}
            data={lineas}
            pagination
          />
        )}
      </div>
      <Drawer
        open={openLineaDrawer}
        onClose={() => setOpenLineaDrawer(false)}
        title="Añadir Línea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip title="Línea">
            <Input
              placeholder="Nombre de la línea"
              value={linea.nombre}
              onChange={handleLineaChange}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </div>
        <Button
          type="primary"
          onClick={handleGuardarLinea}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Drawer>
      <Drawer
        open={openSubLineaDrawer}
        onClose={() => setOpenSubLineaDrawer(false)}
        title="Añadir Sublínea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip title="SubLínea">
            <Input
              placeholder="Nombre de la SubLínea"
              value={subLinea.nombre}
              onChange={handleSubLineaChange}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </div>
        <Button
          type="primary"
          onClick={handleAddSubLinea}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default Linea;
