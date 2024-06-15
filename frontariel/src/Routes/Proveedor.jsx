import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input } from "antd";

const Proveedores = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/proveedor");
      setData(response.data);
      setLoading(false);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleAddProveedor = async () => {
    if (!nombre) {
      alert("El campo Nombre es obligatorio");
      return;
    }

    const nuevoProveedor = { nombre: nombre };
    console.log(nuevoProveedor);

    try {
      const response = await axios.post(
        "http://localhost:3000/addProveedor",
        nuevoProveedor
      );
      setData([...data, response.data]);
      alert("Proveedor agregado con éxito");
      setOpenAddDrawer(false);
      setNombre("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding the proveedor:", error);
    }
  };

  const handleEditProveedor = async () => {
    if (!nombre) {
      alert("El campo Nombre es obligatorio");
      return;
    }

    const proveedorActualizado = {
      nombre,
      ID: currentProveedor.id,
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/updateProveedor`,
        proveedorActualizado
      );

      const updatedData = data.map((proveedor) =>
        proveedor.id === currentProveedor.id ? response.data : proveedor
      );

      setData(updatedData);
      alert("Proveedor actualizado con éxito");
      setOpenEditDrawer(false);
      setNombre("");
      window.location.reload();
    } catch (error) {
      console.error("Error updating the proveedor:", error);
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, omit: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
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

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/getProveedorByID/${id}`
      );
      setCurrentProveedor(response.data);
      setNombre(response.data.nombre);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  return (
    <MenuLayout>
      <Button onClick={() => setOpenAddDrawer(true)} type="primary">
        Agregar Proveedor
      </Button>
      <Drawer
        open={openAddDrawer}
        title="Agregar Proveedor"
        onClose={() => setOpenAddDrawer(false)}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleAddProveedor} type="primary">
          Agregar Proveedor
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Proveedor"
        onClose={() => setOpenEditDrawer(false)}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Button onClick={handleEditProveedor} type="primary">
          Actualizar Proveedor
        </Button>
      </Drawer>
      <div>
        <h1>Lista de Proveedores</h1>
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

export default Proveedores;
