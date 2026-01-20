import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import {
  Button,
  Drawer,
  Tooltip,
  Input,
  Modal,
  notification,
  Space,
  Select,
  Checkbox,
} from "antd";
import CustomPagination from "../components/CustomPagination";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import "../style/style.css";

const SubLinea = () => {
  const { id } = useParams();
  const [subLineas, setSubLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [editDrawer, setEditDrawer] = useState(false);
  const [currentSubLinea, setCurrentSubLinea] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubLineas, setSelectedSubLineas] = useState([]);

  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [lineas, setLineas] = useState([]);
  const [destLineaId, setDestLineaId] = useState(null);
  const [deactivateAfterMove, setDeactivateAfterMove] = useState(true);
  const [moving, setMoving] = useState(false);
  const { confirm } = Modal;

  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();

  const parseBulkNames = (text) => {
    const raw = String(text || "")
      .split(/\r?\n|,|;|\t/)
      .map((s) => s.trim())
      .filter(Boolean);

    // dedupe case-insensitive
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

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getSubLineasByLinea/${id}`
      );
      setSubLineas(response.data);
      setNombre(response.data?.[0]?.nombre_linea || "");
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/lineas`);
        setLineas(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching lineas:", error);
      }
    };
    fetchLineas();
  }, []);

  const filteredSubLineas = useMemo(() => {
    const base = Array.isArray(subLineas) ? subLineas : [];
    const q = normalize(searchTerm);
    if (!q) return base;
    return base.filter((s) => normalize(s.nombre).includes(q));
  }, [subLineas, searchTerm]);

  const selectedIds = useMemo(
    () => selectedSubLineas.map((s) => s.id),
    [selectedSubLineas]
  );

  const selectedCount = selectedSubLineas.length;
  const activeSelectedCount = selectedSubLineas.filter((s) => s.estado === 1)
    .length;
  const inactiveSelectedCount = selectedSubLineas.filter((s) => s.estado === 0)
    .length;

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Estas seguro de deshabilitar esta sublinea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/dropSubLinea/${id}`);
            notification.success({
              message: "SubLinea desactivada",
              description: "La subLinea se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Estas seguro de activar esta sublinea?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`${process.env.REACT_APP_API_URL}/upSubLinea/${id}`);
            notification.success({
              message: "SubLinea activada",
              description: "La subLinea se activo exitosamente",
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
        `${process.env.REACT_APP_API_URL}/getSublineaByID/${id}`
      );
      setCurrentSubLinea(response.data);
      setEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };
  const handleEditedSubLinea = async () => {
    const editedSubLinea = {
      nombre: currentSubLinea.nombre,
      ID: currentSubLinea.id,
    };
    if (!editedSubLinea.nombre) {
      Modal.warning({
        title: "Advertencia",
        content: "El campo de nombre es obligatorio",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Estas seguro de editar esta sublinea?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/updateSubLinea`,
            editedSubLinea
          );
          setEditDrawer(false);
          fetchData();
          notification.success({
            message: "Sublinea editada con exito!",
            description: "La sublinea ha sido editada con exito.",
            duration: 1,
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      },
    });
  };

  const handleBulkAdd = async () => {
    const names = parseBulkNames(bulkText);
    if (names.length === 0) {
      notification.warning({
        message: "Sin datos",
        description: "Pegá una lista de sublíneas (una por línea)",
        duration: 2,
      });
      return;
    }

    // Evitar duplicados obvios por nombre dentro de la misma línea (case-insensitive)
    const existing = new Set(
      (Array.isArray(subLineas) ? subLineas : []).map((s) => normalize(s.nombre))
    );
    const toCreate = names.filter((n) => !existing.has(normalize(n)));

    if (toCreate.length === 0) {
      notification.info({
        message: "Nada para agregar",
        description: "Todas las sublíneas pegadas ya existen en esta línea.",
        duration: 2,
      });
      return;
    }

    confirm({
      title: "Agregar sublíneas (por lote)",
      icon: <ExclamationCircleOutlined />,
      content: `Se van a agregar ${toCreate.length} sublíneas en la línea actual.`,
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        const key = "bulk-sublineas";
        setBulkSaving(true);
        try {
          notification.open({
            key,
            message: "Agregando sublíneas...",
            description: `0 / ${toCreate.length}`,
            duration: 0,
          });

          await runInBatches(
            toCreate,
            5,
            (nombreSub) =>
              axios.post(`${process.env.REACT_APP_API_URL}/addSubLinea`, {
                nombre: nombreSub,
                linea_id: Number(id),
              }),
            (done) => {
              notification.open({
                key,
                message: "Agregando sublíneas...",
                description: `${done} / ${toCreate.length}`,
                duration: 0,
              });
            }
          );

          notification.success({
            key,
            message: "Listo",
            description: `Se agregaron ${toCreate.length} sublíneas.`,
            duration: 2,
          });
          setBulkText("");
          setBulkDrawerOpen(false);
          await fetchData();
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

  const handleBulkToggle = async (targetState /* 1|0 */) => {
    if (selectedCount === 0) {
      notification.warning({
        message: "Seleccioná sublíneas",
        description: "Elegí al menos una sublínea para aplicar el cambio.",
        duration: 2,
      });
      return;
    }

    const key = targetState === 1 ? "bulk-activate" : "bulk-deactivate";
    const actionText = targetState === 1 ? "activar" : "desactivar";

    confirm({
      title: `¿Confirmás ${actionText} ${selectedCount} sublíneas?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          notification.open({
            key,
            message: `Aplicando (${actionText})...`,
            description: `0 / ${selectedCount}`,
            duration: 0,
          });

          let done = 0;
          await runInBatches(
            selectedIds,
            10,
            (subId) =>
              axios.put(
                `${process.env.REACT_APP_API_URL}/${
                  targetState === 1 ? "upSubLinea" : "dropSubLinea"
                }/${subId}`
              ),
            (d) => {
              done = d;
              notification.open({
                key,
                message: `Aplicando (${actionText})...`,
                description: `${done} / ${selectedCount}`,
                duration: 0,
              });
            }
          );

          notification.success({
            key,
            message: "Listo",
            description: `Se aplicó el cambio a ${selectedCount} sublíneas.`,
            duration: 2,
          });
          setSelectedSubLineas([]);
          await fetchData();
        } catch (error) {
          console.error("Error bulk toggle:", error);
          notification.error({
            key,
            message: "Error",
            description: "No se pudo aplicar el cambio masivo.",
            duration: 3,
          });
        }
      },
    });
  };

  const handleMoveSelected = async () => {
    if (selectedCount === 0) {
      notification.warning({
        message: "Seleccioná sublíneas",
        description: "Elegí al menos una sublínea.",
        duration: 2,
      });
      return;
    }
    setMoveModalOpen(true);
  };

  const confirmMove = async () => {
    if (!destLineaId) {
      notification.warning({
        message: "Falta destino",
        description: "Seleccioná la línea destino.",
        duration: 2,
      });
      return;
    }

    // Nota: el backend hoy NO permite cambiar linea_id; esto duplica y opcionalmente desactiva la original.
    confirm({
      title: "Mover sublíneas (masivo)",
      icon: <ExclamationCircleOutlined />,
      content: deactivateAfterMove
        ? `Se van a duplicar ${selectedCount} sublíneas en la línea destino y se desactivarán las originales.`
        : `Se van a duplicar ${selectedCount} sublíneas en la línea destino (las originales quedan activas).`,
      okText: "Confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        const key = "bulk-move";
        setMoving(true);
        try {
          notification.open({
            key,
            message: "Moviendo sublíneas...",
            description: `0 / ${selectedCount}`,
            duration: 0,
          });

          let done = 0;
          await runInBatches(
            selectedIds,
            5,
            async (subId) => {
              await axios.post(`${process.env.REACT_APP_API_URL}/addSubLineaByID`, {
                subLinea_id: subId,
                linea_id: destLineaId,
              });
              if (deactivateAfterMove) {
                await axios.put(`${process.env.REACT_APP_API_URL}/dropSubLinea/${subId}`);
              }
            },
            (d) => {
              done = d;
              notification.open({
                key,
                message: "Moviendo sublíneas...",
                description: `${done} / ${selectedCount}`,
                duration: 0,
              });
            }
          );

          notification.success({
            key,
            message: "Listo",
            description: "Operación masiva completada.",
            duration: 2,
          });

          setMoveModalOpen(false);
          setDestLineaId(null);
          setSelectedSubLineas([]);
          await fetchData();
        } catch (error) {
          console.error("Error bulk move:", error);
          notification.error({
            key,
            message: "Error",
            description: "No se pudo completar el movimiento masivo.",
            duration: 3,
          });
        } finally {
          setMoving(false);
        }
      },
    });
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre}
        >
          <span>{row.nombre}</span>
        </Tooltip>
      ),
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

  return (
    <MenuLayout>
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Button onClick={() => window.history.back()} type="primary">
          Volver
        </Button>

        <Space wrap>
          <Button onClick={() => setBulkDrawerOpen(true)}>
            Agregar sublíneas (lote)
          </Button>
          <Button
            disabled={selectedCount === 0}
            onClick={() => handleBulkToggle(1)}
          >
            Activar seleccionadas ({inactiveSelectedCount})
          </Button>
          <Button
            danger
            disabled={selectedCount === 0}
            onClick={() => handleBulkToggle(0)}
          >
            Desactivar seleccionadas ({activeSelectedCount})
          </Button>
          <Button
            type="primary"
            disabled={selectedCount === 0}
            onClick={handleMoveSelected}
          >
            Mover/Duplicar ({selectedCount})
          </Button>
        </Space>
      </Space>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <Input
          placeholder="Buscar sublínea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <Drawer
        open={editDrawer}
        onClose={() => setEditDrawer(false)}
        title="Editar Sublínea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={currentSubLinea?.nombre}
          onChange={(e) =>
            setCurrentSubLinea((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Sublínea"
          style={{ marginBottom: 10 }}
          required
        ></Input>
        <Button className="custom-button" onClick={handleEditedSubLinea}>
          Actualizar Sublinea
        </Button>
      </Drawer>
      <div>
        <h1>Lista de Sublíneas de la Línea {nombre || id}</h1>
        <DataTable
          style={{ width: "100%" }}
          columns={columns}
          data={filteredSubLineas}
          progressPending={loading}
          pagination
          paginationComponent={CustomPagination}
          selectableRows
          onSelectedRowsChange={({ selectedRows }) => {
            setSelectedSubLineas(selectedRows || []);
          }}
          customStyles={{
            headCells: {
              style: customHeaderStyles,
            },
            cells: {
              style: customCellsStyles,
            },
          }}
        />
      </div>

      <Drawer
        open={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        title="Agregar sublíneas (por lote)"
        width={520}
      >
        <p style={{ marginBottom: 8 }}>
          Pegá sublíneas (una por línea). También podés separar por coma.
        </p>
        <Input.TextArea
          rows={10}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={"Ej:\nANALGÉSICOS\nANTIBIÓTICOS\nDERMOCOSMÉTICA"}
        />
        <Space style={{ marginTop: 12 }}>
          <Button onClick={() => setBulkText("")} disabled={bulkSaving}>
            Limpiar
          </Button>
          <Button type="primary" onClick={handleBulkAdd} loading={bulkSaving}>
            Agregar
          </Button>
        </Space>
      </Drawer>

      <Modal
        open={moveModalOpen}
        title="Mover/Duplicar sublíneas seleccionadas"
        okText="Aplicar"
        cancelText="Cancelar"
        onOk={confirmMove}
        onCancel={() => setMoveModalOpen(false)}
        confirmLoading={moving}
      >
        <p style={{ marginBottom: 8 }}>
          Se seleccionaron <strong>{selectedCount}</strong> sublíneas.
        </p>
        <p style={{ marginBottom: 8, color: "#666" }}>
          Nota: hoy el sistema no actualiza el <code>linea_id</code>. Esto crea una
          copia en la línea destino y opcionalmente desactiva la original.
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>
            <strong>Línea destino</strong>
          </div>
          <Select
            style={{ width: "100%" }}
            placeholder="Seleccionar línea destino"
            value={destLineaId}
            onChange={setDestLineaId}
            showSearch
            optionFilterProp="label"
            options={(Array.isArray(lineas) ? lineas : [])
              .filter((l) => l.estado === 1)
              .map((l) => ({ label: l.nombre, value: l.id }))}
          />
        </div>

        <Checkbox
          checked={deactivateAfterMove}
          onChange={(e) => setDeactivateAfterMove(e.target.checked)}
        >
          Desactivar las originales (simula “mover”)
        </Checkbox>
      </Modal>
    </MenuLayout>
  );
};

export default SubLinea;
