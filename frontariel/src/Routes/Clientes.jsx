import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, InputNumber, Radio } from "antd";
import FetchComboBox from "../components/FetchComboBox";

const Clientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cuil, setCuil] = useState("");
  const [zona, setZona] = useState("");
  const [responsableInscripto, setResponsableInscripto] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/clientes");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCliente = async () => {
    if (!nombre || !apellido || !zona) {
      alert("Los campos Nombre, Apellido y Zona son obligatorios");
      return;
    }
    const nuevoCliente = {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      cuil: cuil || null,
      zona_id: zona.id,
      es_responsable_inscripto: responsableInscripto ? 1 : 0,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/addClient",
        nuevoCliente
      );
      setData([...data, response.data]);
      alert("Cliente agregado con éxito");
      setOpenAddDrawer(false);
    } catch (error) {
      console.error("Error adding the cliente:", error);
    }
  };

  const handleEditCliente = async () => {
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
        `http://localhost:3000/updateClients`,
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
        await axios.put(`http://localhost:3000/dropClient/${id}`);
      } else {
        await axios.put(`http://localhost:3000/upClient/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error(
        `Error ${currentState ? "deactivating" : "activating"} the client:`,
        error
      );
    }
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
          // style={{ marginLeft: 10 }}
        >
          {row.estado ? "Desactivar" : "Activar"}
        </Button>
      ),
    },
  ];

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/getClientsByID/${id}`
      );
      setCurrentCliente(response.data);
      setNombre(response.data.nombre);
      setApellido(response.data.apellido);
      setEmail(response.data.email);
      setTelefono(response.data.telefono);
      setDireccion(response.data.direccion);
      setCuil(response.data.cuil);
      setZona(response.data.zona_id);
      setResponsableInscripto(response.data.es_responsable_inscripto === 1);
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
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Apellido"
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección"
          style={{ marginBottom: 10 }}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ marginBottom: 10 }}
        />
        <InputNumber
          value={telefono}
          onChange={setTelefono}
          placeholder="Teléfono"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <InputNumber
          value={cuil}
          onChange={setCuil}
          placeholder="CUIL"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <FetchComboBox
          url="http://localhost:3000/zonas"
          label="Zona"
          labelKey="nombre"
          valueKey="id"
          onSelect={setZona}
          style={{ marginBottom: 10, display: "flex" }}
        />
        <Radio
          checked={responsableInscripto}
          onChange={(e) => setResponsableInscripto(e.target.checked)}
        >
          Es responsable inscripto
        </Radio>
        <Button onClick={handleAddCliente} type="primary">
          Agregar Cliente
        </Button>
      </Drawer>
      <Drawer
        open={openEditDrawer}
        title="Editar Cliente"
        onClose={() => setOpenEditDrawer(false)}
      >
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Apellido"
          style={{ marginBottom: 10 }}
          required
        />
        <Input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección"
          style={{ marginBottom: 10 }}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ marginBottom: 10 }}
        />
        <InputNumber
          value={telefono}
          onChange={setTelefono}
          placeholder="Teléfono"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <InputNumber
          value={cuil}
          onChange={setCuil}
          placeholder="CUIL"
          style={{ marginBottom: 10, display: "flex" }}
        />
        <FetchComboBox
          url="http://localhost:3000/zonas"
          label="Zona"
          labelKey="nombre"
          valueKey="id"
          onSelect={setZona}
          style={{ marginBottom: 10, display: "flex" }}
        />
        <Radio
          checked={responsableInscripto}
          onChange={(e) => setResponsableInscripto(e.target.checked)}
        >
          Es responsable inscripto
        </Radio>
        <Button onClick={handleEditCliente} type="primary">
          Guardar Cambios
        </Button>
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
      />
    </MenuLayout>
  );
};

export default Clientes;
