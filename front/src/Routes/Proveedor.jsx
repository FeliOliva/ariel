import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input } from "antd";
import Swal from "sweetalert2";

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
      const response = await axios.get("http://localhost:3001/proveedor");
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
    Swal.fire({
      title: "¿Estás seguro de agregar este proveedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            "http://localhost:3001/addProveedor",
            nuevoProveedor
          );
          setData([...data, response.data]);
          setOpenAddDrawer(false);
          setNombre("");
          fetchData();
          Swal.fire({
            icon: "success",
            title: "Proveedor agregado con exito",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error adding the proveedor:", error);
        }
      }
    });
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

    Swal.fire({
      title: "¿Estás seguro de actualizar este proveedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(
            `http://localhost:3001/updateProveedor`,
            proveedorActualizado
          );

          const updatedData = data.map((proveedor) =>
            proveedor.id === currentProveedor.id ? response.data : proveedor
          );

          setData(updatedData);
          setOpenEditDrawer(false);
          setNombre("");
          fetchData();
          Swal.fire({
            icon: "success",
            title: "Proveedor actualizado con exito",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error updating the proveedor:", error);
        }
      }
    });
  };
  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        Swal.fire({
          title: "¿Estas seguro de desactivar este Proveedor?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, desactivar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/dropProveedor/${id}`);
            Swal.fire({
              title: "Proveedor desactivado",
              icon: "success",
              showConfirmButton: false,
              timer: 1000,
            });
            fetchData();
          }
        });
      } else {
        Swal.fire({
          title: "¿Estas seguro de activar este Proveedor?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, activar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/upProveedor/${id}`);
            Swal.fire({
              title: "Proveedor activado",
              icon: "success",
              showConfirmButton: false,
              timer: 1000,
            });
            fetchData();
          }
        });
      }
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the article:`,
        error
      );
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
      name: "Habilitar/Deshabilitar",
      cell: (row) => (
        <Button
          type="primary"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? "Desactivar" : "Activar"}
        </Button>
      ),
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
        `http://localhost:3001/getProveedorByID/${id}`
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
