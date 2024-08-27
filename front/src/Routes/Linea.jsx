import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, Tooltip, message } from "antd";
import SubLineasInput from "../components/InputSubLineas";

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [linea, setLinea] = useState({ nombre: "" });
  const [subLinea, setSubLinea] = useState([]);
  const [openSubLineaDrawer, setOpenSubLineaDrawer] = useState(false);
  const [subLineaExisted, setSubLineaDrawerExisted] = useState(false);
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

  const handleOpenDrawerExistedSL = async () => {
    setSubLineaDrawerExisted(true);
  };
  const handleAddExistedSL = async () => {
    console.log(subLinea);
    try {
      await axios.post(`http://localhost:3001/addSubLineaByID`, {
        subLinea_id: subLinea.sublinea_id,
        linea_id: subLinea.linea_id,
      });
      window.location.reload();
      setSubLineaDrawerExisted(false);
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
        title="Añadir Nueva Sublínea"
      >
        <div>
          <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
            <strong>Añadir una nueva SubLinea</strong>
          </div>
          <Input
            placeholder="Nombre de la SubLínea"
            value={subLinea.nombre}
            onChange={handleSubLineaChange}
            style={{ padding: 0 }}
          />
        </div>
        <div style={{ display: "flex", marginBottom: 10, marginTop: 10 }}>
          <Button
            style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}
            onClick={handleOpenDrawerExistedSL}
          >
            Agregar a SubLinea existente
          </Button>
        </div>
        <div>
          <Button
            type="primary"
            onClick={handleAddSubLinea}
            style={{ marginTop: 20 }}
          >
            Guardar
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={subLineaExisted}
        onClose={() => setSubLineaDrawerExisted(false)}
        title="Añadir a Sublínea existente"
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <strong>Añadir a SubLinea Existente</strong>
        </div>
        <SubLineasInput
          onChangeSubLineas={(value) => {
            setSubLinea((prev) => ({
              ...prev,
              sublinea_id: value.id,
            }));
          }}
        />
        <Button
          type="primary"
          onClick={handleAddExistedSL}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default Linea;
