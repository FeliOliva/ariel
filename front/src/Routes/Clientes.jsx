import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Input,
  InputNumber,
  Tooltip,
  Modal,
  notification,
} from "antd";
import ZonasInput from "../components/ZonasInput";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import TipoClienteInput from "../components/TipoClienteInput";
import { useNavigate } from "react-router-dom";
import {
  WarningOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Clientes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [, setZonaSeleccionada] = useState(null);
  const [clientesPorZona, setClientesPorZona] = useState([]);
  const [openClientesPorZona, setOpenClientesPorZona] = useState(false);
  const navigate = useNavigate();
  const { confirm } = Modal;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/clientes");
      setData(response.data);
      setClientes(response.data);
      console.log("clientes", response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredData = data.filter((cliente) => {
    const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (cliente.farmacia &&
        cliente.farmacia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.localidad &&
        cliente.localidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.email &&
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleGeneratePDF = () => {
    if (!clientes.length) {
      notification.warning({
        message: "Sin datos",
        description: "No hay clientes cargados.",
        duration: 2,
        placement: "topRight",
      });
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text("Lista de Clientes", 105, 20, { align: "center" });

    const tableData = clientes.map((c) => [
      c.farmacia,
      c.nombre,
      c.zona_nombre,
      c.localidad,
      c.direccion,
      c.telefono || "—",
    ]);

    pdf.autoTable({
      startY: 30,
      head: [
        ["Farmacia", "Nombre", "Zona", "Localidad", "Dirección", "Teléfono"],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35 }, // Farmacia
        1: { cellWidth: 30 }, // Nombre
        2: { cellWidth: 35 }, // Zona
        3: { cellWidth: 25 }, // Localidad
        4: { cellWidth: 40 }, // Dirección
        5: { cellWidth: 25 }, // Teléfono
      },
    });

    pdf.save("Lista_de_Clientes.pdf");
  };

  const handleAddCliente = async () => {
    if (!newClient.nombre || !newClient.apellido) {
      Modal.warning({
        title: "Error",
        content: "Todos los campos son obligatorios",
        icon: <WarningOutlined />,
      });
      return;
    }
    if (!newClient.tipo_cliente) {
      Modal.warning({
        title: "Error",
        content: "El tipo de cliente es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }
    if (!newClient.zona_id) {
      Modal.warning({
        title: "Error",
        content: "El campo zona es obligatorio",
        icon: <WarningOutlined />,
      });
      return;
    }
    console.log(newClient);
    confirm({
      title: "¿Estas seguro de agregar este cliente?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await axios.post(
            "http://localhost:3001/addClient",
            newClient
          );
          setData([...data, response.data]);
          setOpenAddDrawer(false);
          fetchData(); //revisar para usar esto y resetear los inputs de cliente a vacio
          notification.success({
            message: "Cliente agregado",
            description: "El cliente se agrego correctamente",
            duration: 2,
            placement: "topRight",
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error("Error adding the cliente:", error);
        }
      },
    });
  };

  const handleEditCliente = async () => {
    if (!currentCliente.nombre || !currentCliente.apellido) {
      Modal.warning({
        title: "Error",
        content: "Todos los campos son obligatorios",
        icon: <WarningOutlined />,
      });
      return;
    }

    const clienteActualizado = {
      farmacia: currentCliente.farmacia,
      nombre: currentCliente.nombre,
      apellido: currentCliente.apellido,
      email: currentCliente.email,
      telefono: currentCliente.telefono,
      direccion: currentCliente.direccion,
      cuil: currentCliente.cuil,
      zona_id: currentCliente.zona_id,
      localidad: currentCliente.localidad,
      tipo_cliente: currentCliente.tipo_cliente,
      instagram: currentCliente.instagram,
      ID: currentCliente.id,
    };
    confirm({
      title: "¿Estas seguro de actualizar este cliente?",
      icon: <WarningOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(
            `http://localhost:3001/updateClients`,
            clienteActualizado
          );
          setOpenEditDrawer(false);
          fetchData();
          notification.success({
            message: "Cliente actualizado",
            description: "El cliente se actualizo correctamente",
            duration: 2,
            placement: "topRight",
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error("Error updating the cliente:", error);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de desactivar este Cliente?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropClient/${id}`);
            notification.success({
              message: "Cliente desactivado",
              description: "El cliente se desactivo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar este Cliente?",
          icon: <WarningOutlined />,
          okText: "Sí",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upClient/${id}`);
            notification.success({
              message: "Cliente activado",
              description: "El cliente se activo correctamente",
              duration: 2,
              placement: "topRight",
            });
            fetchData();
          },
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
    {
      name: "Farmacia",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.farmacia}
        >
          <span>{row.farmacia}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre + " " + row.apellido}
        >
          <span>{row.nombre + " " + row.apellido}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.email}
        >
          <span>{row.email}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.telefono}
        >
          <span>{row.telefono}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Dirección",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.direccion}
        >
          <span>{row.direccion}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "CUIL",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.cuil}
        >
          <span>{row.cuil}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Zona",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.zona_nombre}
        >
          <span>{row.zona_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Tipo de cliente",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre_tipo_cliente}
        >
          <span>{row.nombre_tipo_cliente}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Localidad",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.localidad}
        >
          <span>{row.localidad}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Instagram",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.instagram}
        >
          <span>{row.instagram}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Acciones",
      selector: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            className="custom-button"
            onClick={() => handleOpenEditDrawer(row.id)}
            icon={<EditOutlined />}
          ></Button>
          <Button
            className="custom-button"
            onClick={() => handleToggleState(row.id, row.estado)}
          >
            {row.estado ? <DeleteOutlined /> : <CheckCircleOutlined />}
          </Button>
        </div>
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

  const fetchClientesPorZona = async (zonaId) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/getClientesByZona/${zonaId}`
      );
      setClientesPorZona(res.data);
    } catch (err) {
      console.error("Error obteniendo clientes por zona:", err);
    }
  };

  // PDF por zona (incluye teléfono)
  const handleGeneratePDFZona = () => {
    if (!clientesPorZona.length) {
      notification.warning({
        message: "Sin datos",
        description: "No hay clientes para la zona seleccionada.",
        duration: 2,
        placement: "topRight",
      });
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(16);
    pdf.text(`Clientes - ${clientesPorZona[0]?.zona_nombre || ""}`, 105, 20, {
      align: "center",
    });

    const tableData = clientesPorZona.map((c) => [
      `${c.nombre} ${c.apellido}`,
      c.farmacia,
      c.direccion,
      c.localidad,
      c.telefono || "—",
    ]);

    pdf.autoTable({
      startY: 30,
      head: [["Nombre", "Farmacia", "Dirección", "Localidad", "Teléfono"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 45 }, // Nombre
        1: { cellWidth: 40 }, // Farmacia
        2: { cellWidth: 45 }, // Dirección
        3: { cellWidth: 30 }, // Localidad
        4: { cellWidth: 30 }, // Teléfono
      },
    });

    pdf.save(`Clientes_Zona_${clientesPorZona[0]?.zona_nombre || ""}.pdf`);
  };

  return (
    <MenuLayout>
      <h1>Listado de clientes</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={() => setOpenAddDrawer(true)} type="primary">
            Agregar Cliente
          </Button>
          <Button onClick={handleGoToZonas} type="primary">
            Ver Zonas
          </Button>
          <Button onClick={handleGeneratePDF} type="primary">
            Generar lista
          </Button>
          <Button onClick={() => setOpenClientesPorZona(true)} type="primary">
            Imprimir Clientes por Zona
          </Button>
        </div>
      </div>
      <Drawer
        open={openAddDrawer}
        title="Agregar Cliente"
        onClose={() => setOpenAddDrawer(false)}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Farmacia</Tooltip>
        </div>
        <Input
          value={newClient?.farmacia}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, farmacia: e.target.value }))
          }
          placeholder="Farmacia"
          style={{ marginBottom: 10 }}
          required
        />
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
          <Tooltip>Instagram</Tooltip>
        </div>
        <Input
          value={newClient?.instagram}
          onChange={(e) =>
            setNewClient((prev) => ({ ...prev, instagram: e.target.value }))
          }
          placeholder="instagram"
          style={{ marginBottom: 10 }}
          required
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
        <div style={{ display: "flex", marginBottom: 10, marginTop: 10 }}>
          <Tooltip>Tipo Cliente</Tooltip>
        </div>
        <TipoClienteInput
          onChangeTipoCliente={(value) => {
            setNewClient((prev) => ({ ...prev, tipo_cliente: value.id }));
          }}
        />
        <div style={{ display: "flex", marginBottom: 10, marginTop: 10 }}>
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
          <Tooltip>Farmacia</Tooltip>
        </div>
        <Input
          value={currentCliente?.farmacia}
          onChange={(e) =>
            setCurrentCliente((prev) => ({ ...prev, farmacia: e.target.value }))
          }
          placeholder="Farmacia"
          style={{ marginBottom: 10 }}
          required
        />
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
          <Tooltip>Instagram</Tooltip>
        </div>
        <Input
          value={currentCliente?.instagram}
          onChange={(e) =>
            setCurrentCliente((prev) => ({
              ...prev,
              instagram: e.target.value,
            }))
          }
          placeholder="Instagram"
          style={{ marginBottom: 10 }}
          required
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
      <Drawer
        open={openClientesPorZona}
        title="Seleccione una zona para ver sus clientes"
        onClose={() => setOpenClientesPorZona(false)}
        width={400} // Controla el ancho del Drawer
        bodyStyle={{ padding: "20px" }} // Espaciado interno
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "stretch", // Hace que los hijos ocupen todo el ancho
          }}
        >
          <ZonasInput
            onChangeZona={(value) => {
              setZonaSeleccionada(value);
              fetchClientesPorZona(value.id);
            }}
          />

          <Button
            type="primary"
            onClick={handleGeneratePDFZona}
            disabled={!clientesPorZona.length}
            style={{ width: "100%" }} // Botón ancho completo
          >
            Generar PDF por Zona
          </Button>
        </div>
      </Drawer>
      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        keyField="id"
        pagination
        paginationComponent={CustomPagination}
        customStyles={{
          headCells: {
            style: customHeaderStyles,
          },
          cells: {
            style: customCellsStyles,
          },
        }}
      />
    </MenuLayout>
  );
};

export default Clientes;
