import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import ProveedorInput from "../components/ProveedoresInput";
import LineaInput from "../components/LineaInput";
import SubLineaInput from "../components/SubLineaInput";
import { Link } from "react-router-dom";

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
  const [openAddLineaDrawer, setOpenAddLineaDrawer] = useState(false);
  const [linea, setLinea] = useState([]);
  const [isSubLineaEnabled, setIsSubLineaEnabled] = useState(false);
  const [subLinea, setSubLinea] = useState("");
  const [openAddSubLineaDrawer, setOpenAddSubLineaDrawer] = useState(false);

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
    { name: "Codigo", selector: (row) => row.codigo_producto, sortable: true },
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
      name: "Logs",
      cell: (row) => (
        <Link to={`/Logs/${row.id}`}>
          <Button type="primary">Logs</Button>
        </Link>
      ),
    },
    {
      name: "Aumentos",
      cell: (row) => (
        <Button type="primary" onClick={() => handleIncrease(row.id)}>
          Aumentar
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
  const handleIncrease = (id) => {
    setOpenIncreaseDrawer(true);
    setCurrentIncrease({
      id: id,
      percentage: null,
    });
  };

  const handleIncreaseChange = async () => {
    try {
      if (!currentIncrease?.percentage || isNaN(currentIncrease.percentage)) {
        throw new Error("El porcentaje es inválido o no está definido");
      }

      console.log("Porcentaje:", currentIncrease?.percentage);
      console.log("ID:", currentIncrease?.id);

      const response = await axios.get(
        `http://localhost:3001/getArticuloByID/${currentIncrease.id}`
      );
      const articuloAntiguo = response.data;

      console.log("Costo antiguo:", articuloAntiguo.costo);
      console.log(
        "Precio Monotributista antiguo:",
        articuloAntiguo.precio_monotributista
      );

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

      console.log("Costo nuevo:", articuloNuevo.costo);
      console.log(
        "Precio Monotributista nuevo:",
        articuloNuevo.precio_monotributista
      );

      await axios.post(`http://localhost:3001/updateLog`, {
        articulo_id: currentIncrease.id,
        costo_nuevo: articuloNuevo.costo,
        costo_antiguo: articuloAntiguo.costo,
        precio_monotributista_nuevo: articuloNuevo.precio_monotributista,
        precio_monotributista_antiguo: articuloAntiguo.precio_monotributista,
        porcentaje: currentIncrease.percentage,
      });

      fetchData();
      setOpenIncreaseDrawer(false);
    } catch (error) {
      console.error("Error updating prices:", error);
    }
  };

  const handleToggleState = async (id, currentState) => {
    try {
      if (currentState) {
        await axios.put(`http://localhost:3001/dropArticulo/${id}`);
      } else {
        await axios.put(`http://localhost:3001/upArticulo/${id}`);
      }
      fetchData();
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
    if (currentArticulo.sublinea_id === undefined) {
      currentArticulo.sublinea_id = currentArticulo.subLinea_id;
    }
    console.log(currentArticulo);
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
    console.log(articuloEdited);
    try {
      await axios.put(`http://localhost:3001/updateArticulos/`, articuloEdited);
      window.location.reload();
      setOpen(false);
    } catch (error) {
      console.error("Error editing the articulo:", error);
    }
  };

  const handleAddArticulo = async () => {
    console.log(articulo);
    try {
      await axios.post(`http://localhost:3001/addArticulo`, articulo);
      fetchData();
      window.location.reload();
      setOpenAddArticulo(false);
    } catch (error) {
      console.error("Error adding the articulo:", error);
    }
  };

  const handleFilterChange = async () => {
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
            precio_monotributista_nuevo: articuloNuevo.precio_monotributista,
            precio_monotributista_antiguo:
              articuloAntiguo.precio_monotributista,
            porcentaje: currentFilter.percentage,
          });
        }
      }

      setData(articulosNuevos);
      setOpenFilterDrawer(false);
    } catch (error) {
      console.error("Error updating prices or fetching filtered data:", error);
    }
  };

  const handleCloseEditProveedorDrawer = async () => {
    setOpenEditProveedorDrawer(false);
  };
  const handleCloseEditLineaDrawer = async () => {
    setOpenEditLineaDrawer(false);
  };

  const handleCloseEditSubLineaDrawer = async () => {
    setOpenEditSubLineaDrawer(false);
  };
  const reload = async () => {
    window.location.reload();
  };
  const handleOpenLineaDrawer = async () => {
    setOpenAddLineaDrawer(true);
  };
  const handleOpenSubLineaDrawer = async () => {
    setOpenAddSubLineaDrawer(true);
  };
  const handleLineaChange = (e) => {
    const newLinea = e.target.value;
    setLinea((prev) => ({
      ...prev,
      linea: newLinea,
    }));
    if (newLinea) {
      setIsSubLineaEnabled(true);
    } else {
      setIsSubLineaEnabled(false);
    }
  };

  const handleAddLinea = async () => {
    try {
      await axios.post(`http://localhost:3001/addLinea`, {
        nombre: linea.linea,
      });

      const response = await axios.get("http://localhost:3001/getLastLinea");
      const lastLinea = response.data;
      console.log(lastLinea);
      console.log(subLinea);

      // Finalmente, agrega la sublínea con el ID de la línea recién creada
      await axios.post(`http://localhost:3001/addSubLinea`, {
        nombre: subLinea,
        linea_id: lastLinea.id,
      });

      setOpenAddLineaDrawer(false);
    } catch (error) {
      console.error("Error adding the linea or sublinea:", error);
    }
  };
  const handleAddSubLinea = async () => {
    try {
      await axios.post(`http://localhost:3001/addSubLinea`, {
        nombre: subLinea,
        linea_id: linea.linea_id,
      });
      setOpenAddSubLineaDrawer(false);
    } catch (error) {
      console.error("Error adding the linea or sublinea:", error);
    }
  };

  return (
    <MenuLayout>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button type="primary" onClick={setOpenAddArticulo}>
          Agregar artículo
        </Button>
        <Button type="primary" onClick={reload}>
          Recargar
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
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Proveedor</Tooltip>
        </div>
        <ProveedorInput
          onChangeProveedor={(value) =>
            setCurrentFilter((prev) => ({
              ...prev,
              proveedor_id: value.id,
              proveedor_nombre: value.label,
            }))
          }
        />
        <InputNumber
          value={currentFilter?.percentage}
          onChange={(value) =>
            setCurrentFilter((prev) => ({
              ...prev,
              percentage: value,
            }))
          }
        />{" "}
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
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Porcentaje</Tooltip>
        </div>
        <InputNumber
          value={currentIncrease?.percentage}
          onChange={(value) =>
            setCurrentIncrease((prev) => ({
              ...prev,
              percentage: value,
            }))
          }
        />
        <Button type="primary" onClick={handleIncreaseChange}>
          Aplicar
        </Button>
      </Drawer>
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
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            type="primary"
            onClick={() => setOpenAddLineaDrawer(true)}
            style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
          >
            Agregar Línea
          </Button>
          <Button
            type="primary"
            onClick={() => setOpenAddSubLineaDrawer(true)}
            style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}
          >
            Agregar SubLínea
          </Button>
        </div>
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
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Editar Articulo"
        style={{ padding: 0 }}
      >
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
      </Drawer>
      <Drawer
        open={openAddLineaDrawer}
        onClose={() => setOpenAddLineaDrawer(false)}
        title="Añadir Línea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip title="Línea">Línea</Tooltip>
        </div>
        <Input
          value={linea?.linea}
          onChange={handleLineaChange}
          style={{ padding: 0 }}
        />

        {isSubLineaEnabled && (
          <div style={{ marginTop: 20 }}>
            <Tooltip title="SubLínea">SubLínea</Tooltip>
            <Input
              value={subLinea}
              onChange={(e) => setSubLinea(e.target.value)}
              style={{ padding: 0 }}
            />
          </div>
        )}
        <Button
          onClick={handleAddLinea}
          type="primary"
          style={{ marginTop: 10 }}
        >
          Guardar
        </Button>
      </Drawer>
      <Drawer
        open={openAddSubLineaDrawer}
        onClose={() => setOpenAddSubLineaDrawer(false)}
        title="Añadir SubLínea"
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Linea</Tooltip>
        </div>
        <LineaInput
          onChangeLinea={(value) =>
            setLinea((prev) => ({
              ...prev,
              linea_id: value.id,
              linea_nombre: value.nombre,
            }))
          }
        />
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>SubLinea</Tooltip>
        </div>
        <Input
          value={subLinea}
          onChange={(e) => setSubLinea(e.target.value)}
          style={{ padding: 0 }}
        />
        <Button
          onClick={handleAddSubLinea}
          style={{ marginTop: 10 }}
          type="primary"
        >
          Guardar
        </Button>
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
          responsive={true}
        />
      </div>
    </MenuLayout>
  );
}

export default Articulos;
