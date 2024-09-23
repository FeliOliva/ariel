import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, InputNumber, Tooltip } from "antd";
import ZonasInput from "../components/ZonasInput";
import Swal from "sweetalert2";
import CustomPagination from "../components/CustomPagination";
import { customHeaderStyles } from "../style/dataTableStyles"; // Importa los estilos reutilizables
import TipoClienteInput from "../components/TipoClienteInput";
import { useNavigate } from "react-router-dom";

const Clientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [newClient, setNewClient] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    cuil: "",
    localidad: "",
  });
  const [openEditZonaDrawer, setOpenEditZonaDrawer] = useState(false);
  const [openEditTipoDrawer, setOpenEditTipoDrawer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/clientes");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCliente = async () => {
    if (!newClient.nombre || !newClient.apellido) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Los campos Nombre, Apellido y Zona son obligatorios",
      });
      return;
    }
    Swal.fire({
      title: "¿Estas seguro de agregar este cliente?",
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
            "http://localhost:3001/addClient",
            newClient
          );
          setData([...data, response.data]);
          setOpenAddDrawer(false);
          fetchData(); //revisar para usar esto y resetear los inputs de cliente a vacio
          Swal.fire({
            title: "¡Cliente agregado con exito!",
            icon: "success",
            confirmButtonText: "OK",
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error("Error adding the cliente:", error);
        }
      }
    });
  };

  const handleEditCliente = async () => {
    if (!currentCliente.nombre || !currentCliente.apellido) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Los campos Nombre y Apellido son obligatorios",
      });
      return;
    }

    // const cuilToSend =
    //   currentCliente.cuil !== undefined && currentCliente.cuil !== ""
    //     ? currentCliente.cuil
    //     : null;
    // const emailToSend =
    //   currentCliente.email !== undefined && currentCliente.email !== ""
    //     ? currentCliente.email
    //     : "";
    // const telefonoToSend =
    //   currentCliente.telefono !== undefined && currentCliente.telefono !== ""
    //     ? currentCliente.telefono
    //     : "";
    // const direccionToSend =
    //   currentCliente.direccion !== undefined && currentCliente.direccion !== ""
    //     ? currentCliente.direccion
    //     : "";

    const clienteActualizado = {
      nombre: currentCliente.nombre,
      apellido: currentCliente.apellido,
      email: currentCliente.email,
      telefono: currentCliente.telefono,
      direccion: currentCliente.direccion,
      cuil: currentCliente.cuil,
      zona_id: currentCliente.zona_id,
      localidad: currentCliente.localidad,
      tipo_cliente: currentCliente.tipo_cliente,
      ID: currentCliente.id,
    };
    Swal.fire({
      title: "¿Estas seguro de actualizar este cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, actualizar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(
            `http://localhost:3001/updateClients`,
            clienteActualizado
          );

          const updatedData = data.map((cliente) =>
            cliente.id === currentCliente.id ? response.data : cliente
          );

          setData(updatedData);
          setOpenEditDrawer(false);
          fetchData();
          Swal.fire({
            title: "Cliente actualizado",
            icon: "success",
            showConfirmButton: false,
            timer: 1000,
          });
        } catch (error) {
          console.error("Error updating the cliente:", error);
        }
      }
    });
  };

  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        Swal.fire({
          title: "¿Estas seguro de desactivar este Cliente?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, desactivar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/dropClient/${id}`);
            Swal.fire({
              title: "Cliente desactivado",
              icon: "success",
              showConfirmButton: false,
              timer: 1000,
            });
            fetchData();
          }
        });
      } else {
        Swal.fire({
          title: "¿Estas seguro de activar este Cliente?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, activar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/upClient/${id}`);
            Swal.fire({
              title: "Cliente activado",
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

  const handleEditedZona = () => {
    setOpenEditZonaDrawer(false);
  };
  const handleEditedTipo = () => {
    setOpenEditTipoDrawer(false);
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, omit: true },
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Apellido", selector: (row) => row.apellido, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Teléfono", selector: (row) => row.telefono, sortable: true },
    { name: "Dirección", selector: (row) => row.direccion, sortable: true },
    { name: "CUIL", selector: (row) => row.cuil, sortable: true },
    { name: "Zona", selector: (row) => row.zona_nombre, sortable: true },
    {
      name: "Tipo de cliente",
      selector: (row) => row.nombre_tipo_cliente,
      sortable: true,
    },
    {
      name: "Localidad",
      selector: (row) => row.localidad,
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
        <Button type="primary" onClick={() => handleOpenEditDrawer(row.id)}>
          Editar
        </Button>
      ),
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
  ];

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getClientsByID/${id}`
      );
      setCurrentCliente(response.data);
      console.log("data");
      console.log(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const formatCuil = (value) => {
    const cuil = value.replace(/\D/g, "");
    const part1 = cuil.slice(0, 2);
    const part2 = cuil.slice(2, 10);
    const part3 = cuil.slice(10, 11);

    if (cuil.length > 10) {
      return `${part1}-${part2}-${part3}`;
    } else if (cuil.length > 2) {
      return `${part1}-${part2}`;
    } else {
      return part1;
    }
  };
  const handleGoToZonas = () => {
    navigate("/zonas");
  };

  return (
    <MenuLayout>
      <h1>Listado de clientes</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          style={{ marginBottom: 10 }}
          onClick={() => setOpenAddDrawer(true)}
          type="primary"
        >
          Agregar Cliente
        </Button>
        <Button onClick={handleGoToZonas} type="primary">
          Ver Zonas
        </Button>
      </div>
      <Drawer
        open={openAddDrawer}
        title="Agregar Cliente"
        onClose={() => setOpenAddDrawer(false)}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={newClient?.nombre}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Apellido</Tooltip>
        </div>
        <Input
          value={newClient?.apellido}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, apellido: e.target.value }))
          }
          placeholder="Apellido"
          style={{ marginBottom: 10 }}
          required
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Dirección</Tooltip>
        </div>
        <Input
          value={newClient?.direccion}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, direccion: e.target.value }))
          }
          placeholder="Dirección"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Email</Tooltip>
        </div>
        <Input
          value={newClient?.email}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Telefono</Tooltip>
        </div>
        <InputNumber
          value={newClient?.telefono}
          onChange={(value) =>
            setNewClient((prev) => ({ ...prev, telefono: value }))
          }
          placeholder="Teléfono"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Localidad</Tooltip>
        </div>
        <Input
          value={newClient?.localidad}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, localidad: e.target.value }))
          }
          placeholder="Localidad"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Cuil</Tooltip>
        </div>
        <Input
          placeholder="CUIL"
          value={newClient.cuil}
          onChange={(e) =>
            setNewClient({ ...newClient, cuil: formatCuil(e.target.value) })
          }
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Tipo Cliente</Tooltip>
        </div>
        <TipoClienteInput
          onChangeTipoCliente={(value) => {
            setNewClient((prev) => ({ ...prev, tipo_cliente: value.id }));
          }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Zona</Tooltip>
        </div>
        <ZonasInput
          onChangeZona={(value) =>
            setNewClient({ ...newClient, zona_id: value.id })
          }
        />
        <Button onClick={handleAddCliente} type="primary">
          Guardar
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Cliente"
        onClose={() => setOpenEditDrawer(false)}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={currentCliente?.nombre}
          onChange={(e) =>
            setCurrentCliente((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Apellido</Tooltip>
        </div>
        <Input
          value={currentCliente?.apellido}
          onChange={(e) =>
            setCurrentCliente((prev) => ({ ...prev, apellido: e.target.value }))
          }
          placeholder="Apellido"
          style={{ marginBottom: 10 }}
          required
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Dirección</Tooltip>
        </div>
        <Input
          value={currentCliente?.direccion}
          onChange={(e) =>
            setCurrentCliente((prev) => ({
              ...prev,
              direccion: e.target.value,
            }))
          }
          placeholder="Dirección"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Email</Tooltip>
        </div>
        <Input
          value={currentCliente?.email}
          onChange={(e) =>
            setCurrentCliente((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Telefono</Tooltip>
        </div>
        <InputNumber
          value={currentCliente?.telefono}
          onChange={(value) =>
            setCurrentCliente((prev) => ({ ...prev, telefono: value }))
          }
          placeholder="Teléfono"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Cuil</Tooltip>
        </div>
        <Input
          placeholder="CUIL"
          value={currentCliente?.cuil}
          onChange={(e) =>
            setCurrentCliente((prev) => ({
              ...prev,
              cuil: formatCuil(e.target.value),
            }))
          }
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Localidad</Tooltip>
        </div>
        <Input
          value={currentCliente?.localidad}
          onChange={(e) =>
            setCurrentCliente((prev) => ({
              ...prev,
              localidad: e.target.value,
            }))
          }
          placeholder="Localidad"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Tipo Cliente</Tooltip>
        </div>
        <Input
          value={currentCliente?.nombre_tipo}
          readOnly
          style={{ width: "40%" }}
        ></Input>
        <Button
          onClick={() => setOpenEditTipoDrawer(true)}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Cambiar Tipo
        </Button>

        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Zona</Tooltip>
        </div>
        <Input
          value={currentCliente?.nombreZona}
          readOnly
          style={{ width: "40%" }}
        ></Input>
        <Button
          onClick={() => setOpenEditZonaDrawer(true)}
          type="primary"
          style={{ marginBottom: 10 }}
        >
          Cambiar Zona
        </Button>
        <Drawer
          open={openEditZonaDrawer}
          title="Editar Zona"
          onClose={() => setOpenEditZonaDrawer(false)}
        >
          <ZonasInput
            onChangeZona={(value) =>
              setCurrentCliente((prev) => ({
                ...prev,
                zona_id: value.id,
                nombreZona: value.nombreZona,
              }))
            }
          />
          <Button onClick={handleEditedZona} type="primary">
            Guardar Cambios
          </Button>
        </Drawer>
        <Drawer
          open={openEditTipoDrawer}
          onClose={() => setOpenEditTipoDrawer(false)}
          title="Editar Tipo"
        >
          <TipoClienteInput
            onChangeTipoCliente={(value) =>
              setCurrentCliente((prev) => ({
                ...prev,
                tipo_cliente: value.id,
                nombre_tipo: value.nombre_tipo,
              }))
            }
          />
          <Button onClick={handleEditedTipo} type="primary">
            Guardar Cambios
          </Button>
        </Drawer>
        <Button onClick={handleEditCliente} type="primary">
          Guardar
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        keyField="id"
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
          },
        }}
      />
    </MenuLayout>
  );
};

export default Clientes;
