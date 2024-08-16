import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, InputNumber, Radio, Tooltip } from "antd";
import ZonasInput from "../components/ZonasInput";

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
    responsableInscripto: false,
  });
  const [zona, setZona] = useState("");
  const [responsableInscripto, setResponsableInscripto] = useState(false);
  const [openEditZonaDrawer, setOpenEditZonaDrawer] = useState(false);

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
    const nuevoCliente = {
      nombre: newClient.nombre,
      apellido: newClient.apellido,
      email: newClient.email,
      telefono: newClient.telefono,
      direccion: newClient.direccion,
      cuil: newClient.cuil,
      zona: zona.id,
      responsableInscripto: newClient.responsableInscripto,
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/addClient",
        nuevoCliente
      );
      setData([...data, response.data]);
      alert("Cliente agregado con éxito");
      setOpenAddDrawer(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding the cliente:", error);
    }
  };

  const handleEditCliente = async () => {
    const { nombre, apellido, cuil, email, telefono, direccion } =
      currentCliente;

    if (!nombre || !apellido || !zona) {
      alert("Los campos Nombre, Apellido y Zona son obligatorios");
      return;
    }

    const cuilToSend = cuil !== undefined && cuil !== "" ? cuil : null;
    const emailToSend = email !== undefined && email !== "" ? email : "";
    const telefonoToSend =
      telefono !== undefined && telefono !== "" ? telefono : "";
    const direccionToSend =
      direccion !== undefined && direccion !== "" ? direccion : "";

    const clienteActualizado = {
      nombre,
      apellido,
      email: emailToSend,
      telefono: telefonoToSend,
      direccion: direccionToSend,
      cuil: cuilToSend,
      zona_id: zona.id,
      es_responsable_inscripto: responsableInscripto ? 1 : 0,
      ID: currentCliente.id,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/updateClients`,
        clienteActualizado
      );

      const updatedData = data.map((cliente) =>
        cliente.id === currentCliente.id ? response.data : cliente
      );

      setData(updatedData);
      alert("Cliente actualizado con éxito");
      setOpenEditDrawer(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating the cliente:", error);
    }
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState) {
        await axios.put(`http://localhost:3001/dropClient/${id}`);
      } else {
        await axios.put(`http://localhost:3001/upClient/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the client:`,
        error
      );
    }
  };

  const handleEditedZona = () => {
    setOpenEditZonaDrawer(false);
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
      setZona({ id: response.data.zona_id, nombre: response.data.zona_nombre });
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  return (
    <MenuLayout>
      <Button onClick={() => setOpenAddDrawer(true)} type="primary">
        Agregar Cliente
      </Button>
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
          <Tooltip>Cuil</Tooltip>
        </div>
        <InputNumber
          value={newClient?.cuil}
          onChange={(value) =>
            setNewClient((prev) => ({ ...prev, cuil: value }))
          }
          placeholder="CUIL"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Responsable Inscripto</Tooltip>
        </div>
        <Radio.Group
          onChange={(e) =>
            setNewClient((prev) => ({
              ...prev,
              responsableInscripto: e.target.value,
            }))
          }
          value={newClient?.responsableInscripto}
          style={{ marginBottom: 10, display: "flex" }}
        >
          <Radio value={false}>No</Radio>
          <Radio value={true}>Sí</Radio>
        </Radio.Group>
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Zona</Tooltip>
        </div>
        <ZonasInput onChangeZona={setZona} />
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
        <InputNumber
          value={currentCliente?.cuil}
          onChange={(value) =>
            setCurrentCliente((prev) => ({ ...prev, cuil: value }))
          }
          placeholder="CUIL"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Responsable Inscripto</Tooltip>
        </div>
        <Radio.Group
          onChange={(e) => setResponsableInscripto(e.target.value)}
          value={responsableInscripto}
          style={{ marginBottom: 10, display: "flex" }}
        >
          <Radio value={false}>No</Radio>
          <Radio value={true}>Sí</Radio>
        </Radio.Group>
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
          <ZonasInput onChangeZona={setCurrentCliente.zona_id} />
          <Button onClick={handleEditedZona} type="primary">
            Guardar Cambios
          </Button>
        </Drawer>
        <Button onClick={handleEditCliente} type="primary">
          Guardar
        </Button>
      </Drawer>
      <DataTable columns={columns} data={data} progressPending={loading} />
    </MenuLayout>
  );
};

export default Clientes;
