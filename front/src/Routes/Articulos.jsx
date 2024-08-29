import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import ProveedorInput from "../components/ProveedoresInput";
import LineaInput from "../components/LineaInput";
import SubLineaInput from "../components/SubLineaInput";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../style/style.css";
import CustomPagination from "../components/CustomPagination";
function Articulos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/articulos");
      setData(response.data);
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
      selector: (row) => row.codigo_producto,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip title={row.nombre + " " + row.mediciones}>
          <span>{row.nombre + " " + row.mediciones}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    { name: "Stock", selector: (row) => row.stock, sortable: true },
    {
      name: "Linea",
      selector: (row) => (
        <Tooltip title={row.linea_nombre}>
          <span>{row.linea_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "SubLinea",
      selector: (row) => (
        <Tooltip title={row.sublinea_nombre}>
          <span>{row.sublinea_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Costo",
      selector: (row) => row.costo,
      sortable: true,
    },
    {
      name: "Precio monotributista",
      selector: (row) => row.precio_monotributista,
      sortable: true,
    },
    {
      name: "Proveedor",
      selector: (row) => (
        <Tooltip title={row.proveedor_nombre}>
          <span>{row.proveedor_nombre}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Editar",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleOpenEditDrawer(row.id)}
        >
          Editar
        </Button>
      ),
    },
    {
      name: "Logs",
      cell: (row) => (
        <Link to={`/Logs/${row.id}`}>
          <Button className="custom-button">Logs</Button>
        </Link>
      ),
    },
    {
      name: "Aumentos",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleIncrease(row.id)}
        >
          Aumentar
        </Button>
      ),
    },
    {
      name: "Activar/Desactivar",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() => handleToggleState(row.id, row.estado)}
        >
          {row.estado ? "Desactivar" : "Activar"}
        </Button>
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
      Swal.fire({
        title: "Advertencia",
        text: "El porcentaje debe estar entre 0 y 100",
        icon: "error",
      });
      return;
    }
    Swal.fire({
      title: "¿Esta seguro realizar este aumento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.get(
            `http://localhost:3001/getArticuloByID/${currentIncrease.id}`
          );
          const articuloAntiguo = response.data;

          await axios.put(
            `http://localhost:3001/increasePrice/${currentIncrease.id}`,
            {
              percentage: currentIncrease.percentage,
            }
          );

          const response2 = await axios.get(
            `http://localhost:3001/getArticuloByID/${currentIncrease.id}`
          );
          const articuloNuevo = response2.data;

          await axios.post(`http://localhost:3001/updateLog`, {
            articulo_id: currentIncrease.id,
            costo_nuevo: articuloNuevo.costo,
            costo_antiguo: articuloAntiguo.costo,
            precio_monotributista_nuevo: articuloNuevo.precio_monotributista,
            precio_monotributista_antiguo:
              articuloAntiguo.precio_monotributista,
            porcentaje: currentIncrease.percentage,
          });

          fetchData();
          setOpenIncreaseDrawer(false);
          Swal.fire({
            title: "Aumento realizado con exito",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error updating prices:", error);
        }
      }
    });
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState === 1) {
        Swal.fire({
          title: "¿Estas seguro de desactivar este articulo?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, desactivar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/dropArticulo/${id}`);
            Swal.fire({
              title: "Articulo desactivado",
              icon: "success",
              showConfirmButton: false,
              timer: 1000,
            });
            fetchData();
          }
        });
      } else {
        Swal.fire({
          title: "¿Estas seguro de activar este articulo?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, activar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/upArticulo/${id}`);
            Swal.fire({
              title: "Articulo activado",
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

  const handleOpenEditDrawer = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getArticuloByID/${id}`
      );
      setCurrentArticulo(response.data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleEditedArticulo = async () => {
    if (!subLineaExists) {
      Swal.fire({
        title: "Advertencia",
        text: "No cargaste una sublinea perteneciente a la linea seleccionada.",
        icon: "error",
      });
      return;
    }
    Swal.fire({
      title: "¿Estás seguro de hacer este cambio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
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
          ID: currentArticulo.id,
        };
        try {
          await axios.put(
            `http://localhost:3001/updateArticulos/`,
            articuloEdited
          );
          fetchData();
          setOpen(false);
          Swal.fire({
            title: "¡Artículo editado!",
            text: "El artículo ha sido editado con éxito.",
            icon: "success",
            timer: 1000,
          });
        } catch (error) {
          console.error("Error editing the articulo:", error);
        }
      }
    });
  };

  const handleAddArticulo = async () => {
    if (articulo === null) {
      Swal.fire({
        title: "Advertencia",
        text: "No cargaste un articulo.",
        icon: "error",
      });
      return;
    }

    if (articulo.linea_id === undefined) {
      Swal.fire({
        title: "Advertencia",
        text: "No cargaste una linea.",
        icon: "error",
      });
      return;
    }
    if (articulo.subLinea_id === undefined) {
      Swal.fire({
        title: "Advertencia",
        text: "No cargaste una sublinea.",
        icon: "error",
      });
      return;
    }
    if (articulo.proveedor_id === undefined) {
      Swal.fire({
        title: "Advertencia",
        text: "No cargaste un proveedor.",
        icon: "error",
      });
      return;
    }
    console.log(articulo);
    Swal.fire({
      title: "¿Estás seguro de agregar este artículo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, agregarlo",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`http://localhost:3001/addArticulo`, articulo);
          Swal.fire({
            title: "¡Artículo agregado!",
            text: "El artículo ha sido agregado con éxito.",
            icon: "success",
          });

          setOpenAddArticulo(false);
        } catch (error) {
          console.error("Error al agregar el artículo:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al agregar el artículo. Inténtalo de nuevo.",
            icon: "error",
          });
        } finally {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    });
  };

  const handleFilterChange = async () => {
    if (
      currentFilter.percentage < 0 ||
      currentFilter.percentage > 100 ||
      currentFilter.percentage === null
    ) {
      Swal.fire({
        title: "Advertencia",
        text: "El porcentaje debe estar entre 0 y 100",
        icon: "error",
      });
      return;
    }
    Swal.fire({
      title: "¿Esta seguro de aplicar este aumento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (!currentFilter.percentage || isNaN(currentFilter.percentage)) {
            throw new Error("El porcentaje es inválido o no está definido");
          }

          // Obtener los artículos antes de actualizar los precios
          const responseAntiguos = await axios.get(
            `http://localhost:3001/getArticulosByProveedorID/${currentFilter.proveedor_id}`
          );
          const articulosAntiguos = responseAntiguos.data;

          // Actualizar los precios
          await axios.put(
            `http://localhost:3001/increasePrices/${currentFilter.proveedor_id}`,
            { percentage: currentFilter.percentage }
          );

          // Obtener los artículos después de actualizar los precios
          const responseNuevos = await axios.get(
            `http://localhost:3001/getArticulosByProveedorID/${currentFilter.proveedor_id}`
          );
          const articulosNuevos = responseNuevos.data;

          // Crear un mapa de artículos antiguos para referencia rápida
          const articulosAntiguosMap = new Map(
            articulosAntiguos.map((articulo) => [articulo.id, articulo])
          );

          // Insertar logs para cada artículo actualizado
          for (const articuloNuevo of articulosNuevos) {
            const articuloAntiguo = articulosAntiguosMap.get(articuloNuevo.id);
            if (articuloAntiguo) {
              await axios.post(`http://localhost:3001/updateLog`, {
                articulo_id: articuloNuevo.id,
                costo_nuevo: articuloNuevo.costo,
                costo_antiguo: articuloAntiguo.costo,
                precio_monotributista_nuevo:
                  articuloNuevo.precio_monotributista,
                precio_monotributista_antiguo:
                  articuloAntiguo.precio_monotributista,
                porcentaje: currentFilter.percentage,
              });
            }
          }

          setData(articulosNuevos);
          setOpenFilterDrawer(false);
          Swal.fire({
            title: "¡Filtro aplicado!",
            text: "El filtro ha sido aplicado con exito.",
            icon: "success",
          });
        } catch (error) {
          console.error(
            "Error updating prices or fetching filtered data:",
            error
          );
        }
      }
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
      </div>
      <Drawer
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        title="Filtrar"
        style={{ padding: 0 }}
      >
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <Tooltip>
            Aplicar aumento por <strong>Proveedor</strong>
          </Tooltip>
        </div>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <ProveedorInput
            onChangeProveedor={(value) =>
              setCurrentFilter((prev) => ({
                ...prev,
                proveedor_id: value.id,
                proveedor_nombre: value.label,
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
          data={data}
          pagination={true}
          paginationComponent={CustomPagination}
          responsive={true}
          customStyles={{
            rows: {
              style: {
                fontSize: "14px", // Cambia este valor para reducir el tamaño del texto
                padding: "1px 2px", // Ajusta el padding para reducir el tamaño general de las filas
              },
            },
            headCells: {
              style: {
                fontSize: "14px", // Tamaño del texto en los encabezados
              },
            },
            cells: {
              style: {
                padding: "2px 4px", // Ajusta el padding de las celdas
              },
            },
          }}
        />
      </div>
    </MenuLayout>
  );
}

export default Articulos;
