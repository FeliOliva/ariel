import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  Drawer,
  Button,
  InputNumber,
  Input,
  Tooltip,
  Modal,
  notification,
  Switch,
  Select,
} from "antd";
import {
  CloseOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons"; // Importa el ícono para borrar
import MenuLayout from "../components/MenuLayout";
import ProveedorInput from "../components/ProveedoresInput";
import LineaInput from "../components/LineaInput";
import SubLineaInput from "../components/SubLineaInput";
import { useNavigate } from "react-router-dom";
import "../style/style.css";
import {
  customHeaderStyles,
  customCellsStyles,
} from "../style/dataTableStyles"; // Importa los estilos reutilizables
import CustomPagination from "../components/CustomPagination";

function Articulos() {
  const [data, setData] = useState([]);
  const [, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]); // Artículos filtrados por la búsqueda
  const [searchValue, setSearchValue] = useState(""); // Valor del input de búsqueda
  const [searchType, setSearchType] = useState("linea"); // "linea" o "articulo"
  const [open, setOpen] = useState(false);
  const [currentArticulo, setCurrentArticulo] = useState(null);
  const [openEditProveedorDrawer, setOpenEditProveedorDrawer] = useState(false);
  const [openEditLineaDrawer, setOpenEditLineaDrawer] = useState(false);
  const [openEditSubLineaDrawer, setOpenEditSubLineaDrawer] = useState(false);
  const [openAddArticulo, setOpenAddArticulo] = useState(false);
  const [articulo, setArticulo] = useState(null);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [openIncreaseDrawer, setOpenIncreaseDrawer] = useState(false);
  const [currentIncrease, setCurrentIncrease] = useState(null);
  const [subLineaExists, setSubLineaExists] = useState(true);
  const [isIncrease, setIsIncrease] = useState(false);
  const [isIndividualIncrease, setIsIndividualIncrease] = useState(true);
  const navigate = useNavigate();
  const { confirm } = Modal;
  const { Option } = Select;

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/articulos");
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "Codigo",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.codigo_producto}
        </span>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        return rowA.codigo_producto.localeCompare(rowB.codigo_producto);
      },
    },
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.nombre + " " + row.mediciones}
        >
          <span>{row.nombre + " " + row.mediciones}</span>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        return rowA.nombre.localeCompare(rowB.nombre);
      },
    },
    {
      name: "Stock",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.stock}
        </span>
      ),
      sortable: true,
      // Orden numérico de mayor a menor
      sortFunction: (rowA, rowB) => {
        return rowB.stock - rowA.stock; // Para ordenar de mayor a menor
      },
    },
    {
      name: "Linea",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.linea_nombre}
        >
          <span>{row.linea_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        return rowA.linea_nombre.localeCompare(rowB.linea_nombre);
      },
    },
    {
      name: "SubLinea",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.sublinea_nombre}
        >
          <span>{row.sublinea_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        return rowA.sublinea_nombre.localeCompare(rowB.sublinea_nombre);
      },
    },
    {
      name: "Costo",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.costo}
        </span>
      ),
      sortable: true,
      // Orden numérico de mayor a menor (si costo es un número)
      sortFunction: (rowA, rowB) => {
        return rowB.costo - rowA.costo; // Orden descendente por costo
      },
    },
    {
      name: "Precio monotributista",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.precio_monotributista}
        </span>
      ),
      sortable: true,
      // Orden numérico de mayor a menor
      sortFunction: (rowA, rowB) => {
        return rowB.precio_monotributista - rowA.precio_monotributista;
      },
    },
    {
      name: "Precio Oferta",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.precio_oferta !== null ? row.precio_oferta : "Inexistente"}
        </span>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        // Si precio_oferta es null, lo tratamos como valor muy bajo
        const precioA =
          rowA.precio_oferta !== null ? rowA.precio_oferta : -Infinity;
        const precioB =
          rowB.precio_oferta !== null ? rowB.precio_oferta : -Infinity;
        return precioB - precioA; // De mayor a menor precio
      },
    },
    {
      name: "Proveedor",
      selector: (row) => (
        <Tooltip
          className={row.estado === 0 ? "strikethrough" : ""}
          title={row.proveedor_nombre}
        >
          <span>{row.proveedor_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (rowA, rowB) => {
        return rowA.proveedor_nombre.localeCompare(rowB.proveedor_nombre);
      },
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
            icon={<PlusCircleOutlined />}
            className="custom-button"
            onClick={() => handleIncrease(row.id)}
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

  const handleIncrease = (id) => {
    setOpenIncreaseDrawer(true);
    setCurrentIncrease({
      id: id,
      percentage: null,
    });
  };

  const handleIncreaseChange = async () => {
    if (
      currentIncrease.percentage < 0 ||
      currentIncrease.percentage > 100 ||
      currentIncrease.percentage === null
    ) {
      Modal.warning({
        title: "Advertencia",
        content: "El porcentaje debe estar entre 0 y 100",
      });
      return;
    }

    confirm({
      title: `¿Esta seguro de ${
        isIndividualIncrease ? "aumentar" : "bajar"
      } este precio?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const endpoint = isIndividualIncrease
            ? "increasePrice"
            : "decreasePrice";
          await axios.put(
            `http://localhost:3001/${endpoint}/${currentIncrease.id}`,
            {
              percentage: currentIncrease.percentage,
            }
          );
          fetchData();
          setOpenIncreaseDrawer(false);
          notification.success({
            message: `${isIndividualIncrease ? "Aumento" : "Baja"} exitosa`,
            description: `El ${
              isIndividualIncrease ? "aumento" : "baja"
            } se realizó exitosamente`,
            duration: 1,
          });
        } catch (error) {
          console.error("Error actualizando precios:", error);
        }
      },
    });
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        confirm({
          title: "¿Esta seguro de desactivar este articulo?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/dropArticulo/${id}`);
            notification.success({
              message: "Articulo desactivado",
              description: "El articulo se desactivo exitosamente",
              duration: 1,
            });
            fetchData();
          },
        });
      } else {
        confirm({
          title: "¿Esta seguro de activar este articulo?",
          icon: <ExclamationCircleOutlined />,
          okText: "Si, confirmar",
          cancelText: "Cancelar",
          onOk: async () => {
            await axios.put(`http://localhost:3001/upArticulo/${id}`);
            notification.success({
              message: "Articulo activado",
              description: "El articulo se activo exitosamente",
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
        `http://localhost:3001/getArticuloByID/${id}`
      );
      setCurrentArticulo(response.data);
      console.log(response.data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleEditedArticulo = async () => {
    if (!subLineaExists) {
      Modal.warning({
        title: "Advertencia",
        content:
          "No cargaste una sublinea perteneciente a la linea seleccionada.",
      });
      return;
    }

    confirm({
      title: "¿Estás seguro de hacer este cambio?",
      icon: <ExclamationCircleOutlined />,
      okText: "Sí",
      cancelText: "Cancelar",
      onOk: async () => {
        if (currentArticulo.sublinea_id === undefined) {
          currentArticulo.sublinea_id = currentArticulo.subLinea_id;
        }
        const articuloEdited = {
          nombre: currentArticulo.nombre,
          stock: currentArticulo.stock,
          codigo_producto: currentArticulo.codigo_producto,
          proveedor_id: currentArticulo?.proveedor_id,
          precio_monotributista: currentArticulo.precio_monotributista,
          costo: currentArticulo.costo,
          subLinea_id: currentArticulo?.sublinea_id,
          mediciones: currentArticulo.mediciones,
          linea_id: currentArticulo?.linea_id,
          precio_oferta: currentArticulo.precio_oferta,
          ID: currentArticulo.id,
        };

        try {
          await axios.put(
            `http://localhost:3001/updateArticulos/`,
            articuloEdited
          );

          // Actualizar datos
          setData((i) => {
            const index = i.findIndex(
              (articulo) => articulo.id === currentArticulo.id
            );
            if (i !== -1) {
              i[index] = { ...currentArticulo, ...articuloEdited };
            }
            return [...i];
          }); // Actualizar el estado con los datos completos
          setOpen(false); // Cerrar el drawer
          notification.success({
            message: "¡Artículo editado!",
            description: "El artículo ha sido editado con éxito.",
            duration: 1,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          // Refiltrar los datos después de la edición
          filterData(searchValue);
          setTimeout(() => {}, 1500);
        } catch (error) {
          console.error("Error editing the articulo:", error);
        }
      },
    });
  };

  const handleAddArticulo = async () => {
    if (articulo === null) {
      Modal.warning({
        title: "Advertencia",
        content: "No cargaste un articulo.",
        icon: "error",
      });
      return;
    }
    if (articulo.proveedor_id === undefined) {
      Modal.warning({
        title: "Advertencia",
        content: "No cargaste un proveedor.",
        icon: "error",
      });
      return;
    }
    if (articulo.linea_id === undefined) {
      Modal.warning({
        title: "Advertencia",
        content: "No cargaste una linea.",
        icon: "error",
      });
      return;
    }
    if (articulo.subLinea_id === undefined) {
      Modal.warning({
        title: "Advertencia",
        content: "No cargaste una sublinea.",
        icon: "error",
      });
      return;
    }

    confirm({
      title: "¿Estás seguro de agregar este articulo?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await axios.post(`http://localhost:3001/addArticulo`, articulo);
          notification.success({
            message: "Articulo agregado",
            description: "El articulo se agrego exitosamente",
            duration: 1,
          });
          setOpenAddArticulo(false);
        } catch (error) {
          console.error("Error al agregar el articulo:", error);
        } finally {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      },
    });
  };

  const handleFilterChange = async () => {
    console.log("is Increase", isIncrease);
    console.log("current filter", currentFilter);
    if (currentFilter === null) {
      Modal.warning({
        title: "Advertencia",
        content: "No seleccionaste un proveedor.",
        icon: "error",
      });
      return;
    }
    if (
      currentFilter.percentage < 0 ||
      currentFilter.percentage > 100 ||
      currentFilter.percentage === null ||
      currentFilter.percentage === undefined
    ) {
      Modal.warning({
        title: "Advertencia",
        content: "El porcentaje es inválido.",
        icon: "error",
      });
      return;
    }
    if (isIncrease === true) {
      notification.warning({
        message: "Estas por aumentar los precios",
        description: "Estas aumentando los precios",
        duration: 1,
      });
    } else {
      notification.warning({
        message: "Estas por bajar los precios",
        description: "Estas bajando los precios",
        duration: 1,
      });
    }
    confirm({
      title: "¿Estas seguro de aplicar este cambio?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          if (!currentFilter.percentage || isNaN(currentFilter.percentage)) {
            throw new Error("El porcentaje es inválido o no está definido");
          }
          if (isIncrease === true) {
            await axios.put(
              `http://localhost:3001/AumentarPrecioxLinea/${currentFilter.linea_id}`,
              { percentage: currentFilter.percentage }
            );
          } else if (isIncrease === false) {
            await axios.put(
              `http://localhost:3001/BajarPrecioxLinea/${currentFilter.linea_id}`,
              { percentage: currentFilter.percentage }
            );
          }
          notification.success({
            message: "Filtro aplicado",
            description: "El filtro se aplicó exitosamente",
            duration: 1,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error(
            "Error updating prices or fetching filtered data:",
            error
          );
        }
      },
    });
  };

  const handleCloseEditProveedorDrawer = async () => {
    setOpenEditProveedorDrawer(false);
  };
  const handleCloseEditLineaDrawer = async () => {
    setSubLineaExists(false);
    setOpenEditLineaDrawer(false);
  };

  const handleCloseEditSubLineaDrawer = async () => {
    setOpenEditSubLineaDrawer(false);
  };

  // Actualizar datos filtrados según la búsqueda
  useEffect(() => {
    filterData(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchValue, searchType]);

  // Filtrar los datos según el valor de búsqueda
  const filterData = (search) => {
    if (search) {
      const filtered = data.filter((articulo) =>
        searchType === "linea"
          ? articulo.linea_nombre.toLowerCase().includes(search.toLowerCase())
          : articulo.nombre.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  // Manejar el cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  // Manejar el cambio en el select
  const handleSearchTypeChange = (value) => {
    setSearchType(value);
  };
  const handleClearSearch = () => {
    setSearchValue("");
    filterData(""); // Limpiar el filtro y mostrar todos los datos
  };

  const handleGoToProveedores = () => {
    navigate("/proveedor");
  };

  const handleGoToDetallesArticulos = () => {
    navigate("/ArticulosDetalles");
  };

  return (
    <MenuLayout>
      <h1>Listado de articulos</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          style={{ marginBottom: 10 }}
          type="primary"
          onClick={setOpenAddArticulo}
        >
          Agregar artículo
        </Button>
        <Button type="primary" onClick={setOpenFilterDrawer}>
          Aumentos
        </Button>
        <Button type="primary" onClick={handleGoToProveedores}>
          Ver Proveedores
        </Button>
        <Button type="primary" onClick={handleGoToDetallesArticulos}>
          Imprimir lista de articulos
        </Button>
      </div>
      <div
        className="search-container"
        style={{ marginBottom: 10, display: "flex", gap: "8px" }}
      >
        <Select
          value={searchType}
          onChange={handleSearchTypeChange}
          style={{ width: 180 }}
        >
          <Option value="linea">Buscar por Línea</Option>
          <Option value="articulo">Buscar por Artículo</Option>
        </Select>
        <Input
          placeholder={`Buscar por ${
            searchType === "linea" ? "Línea" : "Artículo"
          }`}
          value={searchValue}
          onChange={handleSearchChange}
          style={{ width: 300 }}
        />
        <Button
          icon={<CloseOutlined />}
          onClick={handleClearSearch}
          style={{ width: "40px" }}
        />
      </div>
      <Drawer
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        title="Filtrar"
        style={{ padding: 0 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <Tooltip title="Cambiar de aumentar a bajar">
              <span> Cambiar de aumentar a bajar </span>
            </Tooltip>
          </div>
          <Switch
            checked={isIncrease}
            onChange={(checked) => setIsIncrease(checked)}
            defaultChecked
            checkedChildren={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                AUMENTO
              </span>
            }
            unCheckedChildren={
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                BAJADO
              </span>
            }
          />
        </div>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <Tooltip>
            Aplicar aumento por <strong>Linea</strong>
          </Tooltip>
        </div>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <LineaInput
            onChangeLinea={(value) =>
              setCurrentFilter((prev) => ({
                ...prev,
                linea_id: value.id,
                linea_nombre: value.label,
              }))
            }
          />
        </div>
        <Tooltip>
          <strong>Porcentaje</strong>
        </Tooltip>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={currentFilter?.percentage}
            onChange={(value) =>
              setCurrentFilter((prev) => ({
                ...prev,
                percentage: value,
              }))
            }
          />{" "}
        </div>
        <Button type="primary" onClick={handleFilterChange}>
          Aplicar
        </Button>
      </Drawer>
      <Drawer
        open={openIncreaseDrawer}
        onClose={() => setOpenIncreaseDrawer(false)}
        title="Aumentar precio"
        style={{ padding: 0 }}
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip title="Cambiar de aumentar a bajar">
            <span> Cambiar de aumentar a bajar </span>
          </Tooltip>
        </div>
        <Switch
          checked={isIndividualIncrease}
          onChange={(checked) => setIsIndividualIncrease(checked)}
          defaultChecked
          checkedChildren={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              AUMENTO
            </span>
          }
          unCheckedChildren={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>BAJADO</span>
          }
        />
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <Tooltip>
            <strong>Porcentaje</strong>
          </Tooltip>
        </div>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <InputNumber
            value={currentIncrease?.percentage}
            onChange={(value) =>
              setCurrentIncrease((prev) => ({
                ...prev,
                percentage: value,
              }))
            }
          />
        </div>
        <Button type="primary" onClick={handleIncreaseChange}>
          Aplicar
        </Button>
      </Drawer>

      {/* agregado de articulo */}
      <Drawer
        open={openAddArticulo}
        onClose={() => setOpenAddArticulo(false)}
        title="Agregar Articulo"
        style={{ padding: 0 }}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nombre</Tooltip>
        </div>
        <Input
          value={articulo?.nombre}
          onChange={(e) =>
            setArticulo((prev) => ({
              ...prev,
              nombre: e.target.value,
            }))
          }
        ></Input>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Medicion</Tooltip>
        </div>
        <Input
          value={articulo?.mediciones}
          onChange={(e) =>
            setArticulo((prev) => ({
              ...prev,
              mediciones: e.target.value,
            }))
          }
        ></Input>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Stock</Tooltip>
        </div>
        <InputNumber
          value={articulo?.stock}
          onChange={(value) =>
            setArticulo((prev) => ({
              ...prev,
              stock: value,
            }))
          }
        ></InputNumber>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Codigo</Tooltip>
        </div>
        <Input
          value={articulo?.codigo_producto}
          onChange={(e) =>
            setArticulo((prev) => ({
              ...prev,
              codigo_producto: e.target.value,
            }))
          }
        ></Input>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Proveedor</Tooltip>
        </div>
        <ProveedorInput
          onChangeProveedor={(value) =>
            setArticulo((prev) => ({
              ...prev,
              proveedor_id: value.id,
            }))
          }
        />
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Precio monotributista</Tooltip>
        </div>
        <InputNumber
          value={articulo?.precio_monotributista}
          onChange={(value) =>
            setArticulo((prev) => ({
              ...prev,
              precio_monotributista: value,
            }))
          }
        ></InputNumber>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Costo</Tooltip>
        </div>
        <InputNumber
          value={articulo?.costo}
          onChange={(value) =>
            setArticulo((prev) => ({
              ...prev,
              costo: value,
            }))
          }
        ></InputNumber>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Precio Oferta</Tooltip>
        </div>
        <InputNumber
          value={articulo?.precio_oferta}
          onChange={(value) =>
            setArticulo((prev) => ({
              ...prev,
              precio_oferta: value,
            }))
          }
        ></InputNumber>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Linea</Tooltip>
        </div>
        <LineaInput
          onChangeLinea={(value) => {
            setArticulo((prev) => ({
              ...prev,
              linea_id: value.id,
            }));
            setSelectedLinea(value.id);
          }}
        />
        {selectedLinea && (
          <>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>SubLinea</Tooltip>
            </div>
            <SubLineaInput
              lineaId={selectedLinea}
              onChangeSubLinea={(value) =>
                setArticulo((prev) => ({
                  ...prev,
                  subLinea_id: value.id,
                }))
              }
            />
          </>
        )}
        <div style={{ display: "flex", marginTop: 10 }}>
          <Button
            onClick={handleAddArticulo}
            style={{ display: "flex", marginTop: 10 }}
            type="primary"
          >
            Agregar
          </Button>
        </div>
      </Drawer>

      {/* Editar articulo */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Editar Articulo"
        style={{ padding: 0 }}
      >
        {currentArticulo ? (
          <>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Codigo</Tooltip>
            </div>
            <Input
              value={currentArticulo?.codigo_producto}
              onChange={(e) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  codigo_producto: e.target.value,
                }))
              }
            ></Input>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Nombre</Tooltip>
            </div>
            <Input
              value={currentArticulo?.nombre}
              onChange={(e) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  nombre: e.target.value,
                }))
              }
            ></Input>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Stock</Tooltip>
            </div>
            <InputNumber
              value={currentArticulo?.stock}
              onChange={(value) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  stock: value,
                }))
              }
            ></InputNumber>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Medición</Tooltip>
            </div>
            <Input
              value={currentArticulo?.mediciones}
              onChange={(e) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  mediciones: e.target.value,
                }))
              }
            ></Input>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Linea</Tooltip>
            </div>
            <Input
              value={currentArticulo?.linea_nombre}
              readOnly
              style={{ padding: 0 }}
            ></Input>
            <Button
              onClick={() => setOpenEditLineaDrawer(true)}
              title="Editar Linea"
              style={{ marginTop: 10, backgroundColor: "ActiveBorder" }}
            >
              Cambiar linea
            </Button>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>SubLinea</Tooltip>
            </div>
            <Input
              value={currentArticulo?.sublinea_nombre}
              readOnly
              style={{ padding: 0 }}
            ></Input>
            <Button
              onClick={() => setOpenEditSubLineaDrawer(true)}
              title="Editar subLinea"
              style={{ marginTop: 10, backgroundColor: "ActiveBorder" }}
            >
              Cambiar Sublinea
            </Button>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Proveedor</Tooltip>
            </div>
            <Input
              value={currentArticulo?.proveedor_nombre}
              readOnly
              style={{ padding: 0 }}
            ></Input>
            <Button
              onClick={() => setOpenEditProveedorDrawer(true)}
              title="Editar proveedor"
              style={{ marginTop: 10, backgroundColor: "ActiveBorder" }}
            >
              Cambiar proveedor
            </Button>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Precio</Tooltip>
            </div>
            <InputNumber
              value={currentArticulo?.precio_monotributista}
              onChange={(value) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  precio_monotributista: value,
                }))
              }
            ></InputNumber>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Costo</Tooltip>
            </div>
            <InputNumber
              value={currentArticulo?.costo}
              onChange={(value) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  costo: value,
                }))
              }
            ></InputNumber>
            <div style={{ display: "flex", marginTop: 10 }}>
              <Tooltip>Precio de oferta</Tooltip>
            </div>
            <InputNumber
              value={currentArticulo?.precio_oferta}
              onChange={(value) =>
                setCurrentArticulo((prev) => ({
                  ...prev,
                  precio_oferta: value,
                }))
              }
            ></InputNumber>
            <Button
              onClick={handleEditedArticulo}
              style={{ display: "flex", marginTop: 10 }}
              type="primary"
            >
              Confirmar cambios
            </Button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Drawer>
      <Drawer
        open={openEditProveedorDrawer}
        onClose={() => setOpenEditProveedorDrawer(false)}
        title="Seleccionar Proveedor"
      >
        <ProveedorInput
          onChangeProveedor={(value) =>
            setCurrentArticulo((prev) => ({
              ...prev,
              proveedor_id: value.id,
              proveedor_nombre: value.nombre,
            }))
          }
        />
        <Button onClick={handleCloseEditProveedorDrawer}>Guardar</Button>
      </Drawer>
      <Drawer
        open={openEditLineaDrawer}
        onClose={() => setOpenEditLineaDrawer(false)}
        title="Seleccionar Linea"
      >
        <LineaInput
          onChangeLinea={(value) =>
            setCurrentArticulo((prev) => ({
              ...prev,
              linea_id: value.id,
              linea_nombre: value.nombre,
            }))
          }
        />
        <Button onClick={handleCloseEditLineaDrawer}>Guardar</Button>
      </Drawer>
      <Drawer
        open={openEditSubLineaDrawer}
        onClose={() => setOpenEditSubLineaDrawer(false)}
        title="Seleccionar SubLinea"
      >
        <SubLineaInput
          lineaId={currentArticulo?.linea_id}
          onChangeSubLinea={(value) => {
            setCurrentArticulo((prev) => ({
              ...prev,
              sublinea_id: value.id,
              sublinea_nombre: value.nombre,
            }));
            setSubLineaExists(true);
            setOpenEditSubLineaDrawer(false);
          }}
        />
        <Button onClick={handleCloseEditSubLineaDrawer}>Guardar</Button>
      </Drawer>
      <div>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination={true}
          paginationComponent={CustomPagination}
          responsive={true}
          customStyles={{
            rows: {
              style: {
                fontSize: "12px", // Reducir aún más el tamaño del texto
                padding: "0px 0px", // Reducir padding al mínimo
              },
            },
            headCells: {
              style: customHeaderStyles,
            },
            cells: {
              style: customCellsStyles,
            },
          }}
        />
      </div>
    </MenuLayout>
  );
}

export default Articulos;
