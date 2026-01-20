import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Input,
  Tooltip,
  message,
  Modal,
  notification,
  Radio,
  Space,
} from "antd";
import {
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "../style/style.css";
import CustomPagination from "../components/CustomPagination";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import LineaSelect from "../components/LineaSelect";

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [linea, setLinea] = useState({ nombre: "" });
  const [subLinea, setSubLinea] = useState({});
  const [openSubLineaDrawer, setOpenSubLineaDrawer] = useState(false);
  const [currentLinea, setCurrentLinea] = useState({});
  const [OpenEditDrawer, setOpenEditDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subLineaMode, setSubLineaMode] = useState("single"); // single | bulk
  const [bulkSubLineasText, setBulkSubLineasText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [currentLineaForSub, setCurrentLineaForSub] = useState(null);
  const filteredLineas = lineas.filter((linea) =>
    linea.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { confirm } = Modal;
  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/lineas`);
      setLineas(response.data);
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
    if (linea.nombre === "") {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de agregar esta linea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/addLinea`, {
            nombre: linea.nombre,
          });
          notification.success({
            message: "Linea agregada",
            description: "La linea se agrego exitosamente",
            duration: 1,
          });
          fetchData();
          setOpenLineaDrawer(false); // Cierra el drawer
          setLinea({ nombre: "" }); // Resetea el estado del input
        } catch (error) {
          console.error("Error al guardar la linea:", error);
          message.error("Hubo un error al añadir la linea.");
        }
      },
    });
  };
  const handleSubLineaChange = (e) => {
    setSubLinea({ ...subLinea, nombre: e.target.value });
  };

  const handleOpenSubLineaDrawer = async (id) => {
    const lineaObj = (Array.isArray(lineas) ? lineas : []).find((l) => l.id === id);
    setCurrentLineaForSub(lineaObj || { id });
    setSubLinea({ linea_id: id, nombre: "" });
    setSubLineaMode("single");
    setBulkSubLineasText("");
    setOpenSubLineaDrawer(true);
  };
  const handleAddSubLinea = async () => {
    if (!subLinea?.nombre || !String(subLinea.nombre).trim()) {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de agregar esta sublinea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/addSubLinea`, {
            nombre: String(subLinea.nombre).trim(),
            linea_id: subLinea.linea_id,
          });
          fetchData();
          setOpenSubLineaDrawer(false);
          notification.success({
            message: "SubLinea agregada",
            description: "La sublinea se agrego exitosamente",
            duration: 1,
          });
        } catch (error) {
          console.error("Error adding the linea or sublinea:", error);
        }
      },
    });
  };

  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();

  const parseBulkNames = (text) => {
    const raw = String(text || "")
      .split(/\r?\n|,|;|\t/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const n of raw) {
      const key = normalize(n);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(n);
    }
    return out;
  };

  const runInBatches = async (items, batchSize, fn, onProgress) => {
    let done = 0;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(fn));
      done += batch.length;
      onProgress?.(done);
    }
  };

  const handleAddSubLineasBulk = async () => {
    const lineaId = subLinea?.linea_id;
    const names = parseBulkNames(bulkSubLineasText);
    if (!lineaId || names.length === 0) {
      notification.warning({
        message: "Faltan datos",
        description: "Pegá una lista de sublíneas (una por línea)",
        duration: 2,
      });
      return;
    }

    confirm({
      title: "Agregar sublíneas (por lote)",
      icon: <ExclamationCircleOutlined />,
      content: `Se van a agregar ${names.length} sublíneas a esta línea.`,
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        const key = "bulk-add-sublineas-linea";
        setBulkSaving(true);
        try {
          notification.open({
            key,
            message: "Agregando sublíneas...",
            description: `0 / ${names.length}`,
            duration: 0,
          });

          await runInBatches(
            names,
            5,
            (nombreSub) =>
              axios.post(`${process.env.REACT_APP_API_URL}/addSubLinea`, {
                nombre: nombreSub,
                linea_id: lineaId,
              }),
            (done) => {
              notification.open({
                key,
                message: "Agregando sublíneas...",
                description: `${done} / ${names.length}`,
                duration: 0,
              });
            }
          );

          notification.success({
            key,
            message: "Listo",
            description: `Se agregaron ${names.length} sublíneas.`,
            duration: 2,
          });
          setBulkSubLineasText("");
          setOpenSubLineaDrawer(false);
          fetchData();
        } catch (error) {
          console.error("Error bulk add sublineas:", error);
          notification.error({
            key,
            message: "Error",
            description: "No se pudieron agregar todas las sublíneas.",
            duration: 3,
          });
        } finally {
          setBulkSaving(false);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de deshabilitar esta Linea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/dropLinea/${id}`);
            notification.success({
              message: "Linea desactivada",
              description: "La linea se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de habilitar esta Linea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/upLinea/${id}`);
            notification.success({
              message: "Linea activada",
              description: "La linea se activo exitosamente",
              duration: 1,
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
  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getLineaByID/${id}`
      );
      setCurrentLinea(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleEditedLinea = async () => {
    const editedLinea = {
      nombre: currentLinea.nombre,
      ID: currentLinea.id,
    };
    if (!editedLinea.nombre) {
      Modal.warning({
        title: "Error",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de editar esta Linea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/updateLinea`, editedLinea);
          setOpenEditDrawer(false);
          fetchData();
          notification.success({
            message: "Linea editada con exito!",
            description: "La Linea ha sido editada con exito.",
            duration: 2,
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };
  const columns = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip title={row.nombre}>
          <span className={row.estado === 0 ? "strikethrough" : ""}>
            {row.nombre}
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Añadir Sublineas",
      cell: (row) => (
        <Button
          onClick={() => handleOpenSubLineaDrawer(row.id)}
          className="custom-button"
        >
          Añadir SubLineas
        </Button>
      ),
    },

    {
      name: "Sublíneas",
      cell: (row) => (
        <Link to={`/linea/${row.id}`} style={{ textDecoration: "none" }}>
          <Button className="custom-button">Ver Sublíneas</Button>
        </Link>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
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
  const handleClearLineas = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/eliminarLineas`);
      window.location.reload();
    } catch (error) {
    }
  };
  return (
    <MenuLayout>
      <h1>Listado de lineas</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Input
          placeholder="Buscar línea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => setOpenLineaDrawer(true)}>
          Añadir Línea
        </Button>
      </div>

      {/* ⬇️ LineaSelect + Limpiar Filtro */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <LineaSelect />
        <Button
          icon={<CloseOutlined />}
          onClick={handleClearLineas}
          style={{ width: 40 }}
        />
      </div>

      <div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable
            style={{ width: "100%" }}
            columns={columns}
            data={filteredLineas}
            pagination={true}
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
        title={`Añadir Sublíneas ${currentLineaForSub?.nombre ? `a "${currentLineaForSub.nombre}"` : ""}`}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Radio.Group
            value={subLineaMode}
            onChange={(e) => setSubLineaMode(e.target.value)}
          >
            <Radio.Button value="single">Una por vez</Radio.Button>
            <Radio.Button value="bulk">Por lote</Radio.Button>
          </Radio.Group>

          {subLineaMode === "single" ? (
            <>
              <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
                <strong>Añadir una nueva SubLínea</strong>
              </div>
              <Input
                placeholder="Nombre de la SubLínea"
                value={subLinea?.nombre}
                onChange={handleSubLineaChange}
              />
              <Button type="primary" onClick={handleAddSubLinea}>
                Guardar
              </Button>
            </>
          ) : (
            <>
              <div>
                <strong>Agregar por lote</strong>
                <div style={{ color: "#666", marginTop: 4 }}>
                  Pegá una lista (una sublínea por línea). También podés separar por coma.
                </div>
              </div>
              <Input.TextArea
                rows={10}
                value={bulkSubLineasText}
                onChange={(e) => setBulkSubLineasText(e.target.value)}
                placeholder={"Ej:\nANALGÉSICOS\nANTIBIÓTICOS\nDERMOCOSMÉTICA"}
              />
              <Space>
                <Button onClick={() => setBulkSubLineasText("")} disabled={bulkSaving}>
                  Limpiar
                </Button>
                <Button
                  type="primary"
                  onClick={handleAddSubLineasBulk}
                  loading={bulkSaving}
                >
                  Agregar
                </Button>
              </Space>
            </>
          )}
        </Space>
      </Drawer>
      <Drawer
        open={OpenEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        title="Editar Línea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={currentLinea?.nombre}
          onChange={(e) =>
            setCurrentLinea((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Linea"
          style={{ marginBottom: 10 }}
          required
        ></Input>
        <Button type="primary" onClick={handleEditedLinea}>
          Actualizar Sublinea
        </Button>
      </Drawer>
    </MenuLayout>
  );
};

export default Linea;
