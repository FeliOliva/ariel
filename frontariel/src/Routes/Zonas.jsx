import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input } from "antd";

const Zonas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentZona, setCurrentZona] = useState(null);
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/zonas");
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleAddZona = async () => {
    if (!nombre) {
      alert("El campo Zona es obligatorio");
      return;
    }

    const nuevaZona = {
      nombre: nombre,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/addZona",
        nuevaZona
      );
      setData([...data, response.data]);
      alert("Zona agregada con éxito");
      setOpenAddDrawer(false);
      setNombre("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding the zona:", error);
    }
  };

  const handleEditZona = async () => {
    if (!nombre) {
      alert("El campo Zona es obligatorio");
      return;
    }

    const zonaActualizada = {
      nombre: nombre,
      ID: currentZona.id,
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/updateZona`,
        zonaActualizada
      );

      const updatedData = data.map((zonaItem) =>
        zonaItem.id === currentZona.id ? response.data : zonaItem
      );

      setData(updatedData);
      alert("Zona actualizada con éxito");
      setOpenEditDrawer(false);
      setNombre("");
      window.location.reload();
    } catch (error) {
      console.error("Error updating the zona:", error);
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, omit: true },
    { name: "Zona", selector: (row) => row.nombre, sortable: true },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitada" : "Deshabilitada"),
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Button type="primary" onClick={() => handleOpenEditDrawer(row.id)}>
          Editar
        </Button>
      ),
    },
  ];

  const handleOpenEditDrawer = async (ID) => {
    console.log(ID);
    try {
      const response = await axios.get(
        `http://localhost:3000/getZonaByID/${ID}`
      );
      setCurrentZona(response.data);
      setNombre(response.data.nombre);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  return (
    <MenuLayout>
      <Button onClick={() => setOpenAddDrawer(true)} type="primary">
        Agregar Zona
      </Button>
      <Drawer
        open={openAddDrawer}
        title="Agregar Zona"
        onClose={() => setOpenAddDrawer(false)}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleAddZona} type="primary">
          Agregar Zona
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Zona"
        onClose={() => setOpenEditDrawer(false)}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleEditZona} type="primary">
          Actualizar Zona
        </Button>
      </Drawer>
      <div>
        <h1>Lista de Zonas</h1>
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

export default Zonas;
