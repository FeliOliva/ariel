import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import MenuLayout from "../components/MenuLayout";
import { Button, Drawer, Input, Row, Tooltip, message } from "antd";
// import SubLineasInput from "../components/InputSubLineas";
import Swal from "sweetalert2";
import "../style/style.css";

const Linea = () => {
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLineaDrawer, setOpenLineaDrawer] = useState(false);
  const [linea, setLinea] = useState({ nombre: "" });
  const [subLinea, setSubLinea] = useState([]);
  const [openSubLineaDrawer, setOpenSubLineaDrawer] = useState(false);
  const [subLineaExisted, setSubLineaDrawerExisted] = useState(false);
  const [currentLinea, setCurrentLinea] = useState({});
  const [OpenEditDrawer, setOpenEditDrawer] = useState(false);
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/lineas");
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
    Swal.fire({
      title: "¿Estás seguro de agregar esta linea?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post("http://localhost:3001/addLinea", {
            nombre: linea.nombre,
          });
          fetchData();
          setOpenLineaDrawer(false); // Cierra el drawer
          setLinea(""); // Resetea el estado del input
          Swal.fire({
            title: "Linea agregada con exito!",
            text: "La linea ha sido agregada con éxito.",
            icon: "success",
          });
        } catch (error) {
          console.error("Error al guardar la línea:", error);
          message.error("Hubo un error al añadir la línea.");
        }
      }
    });
  };
  const handleSubLineaChange = (e) => {
    setSubLinea({ ...subLinea, nombre: e.target.value });
  };

  const handleOpenSubLineaDrawer = async (id) => {
    setSubLinea({ linea_id: id });
    setOpenSubLineaDrawer(true);
  };
  const handleAddSubLinea = async () => {
    Swal.fire({
      title: "¿Estás seguro de agregar esta sublinea?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`http://localhost:3001/addSubLinea`, {
            nombre: subLinea.nombre,
            linea_id: subLinea.linea_id,
          });
          fetchData();
          setOpenSubLineaDrawer(false);
          Swal.fire({
            title: "Sublinea agregada con exito!",
            text: "La sublinea ha sido agregada con éxito.",
            icon: "success",
            timer: 1000,
          });
        } catch (error) {
          console.error("Error adding the linea or sublinea:", error);
        }
      }
    });
  };

  // const handleOpenDrawerExistedSL = async () => {
  //   setSubLineaDrawerExisted(true);
  // };
  // const handleAddExistedSL = async () => {
  //   try {
  //     await axios.post(`http://localhost:3001/addSubLineaByID`, {
  //       subLinea_id: subLinea.sublinea_id,
  //       linea_id: subLinea.linea_id,
  //     });
  //     window.location.reload();
  //     setSubLineaDrawerExisted(false);
  //     setOpenSubLineaDrawer(false);
  //   } catch (error) {
  //     console.error("Error adding the linea or sublinea:", error);
  //   }
  // };
  const handleToggleState = async (id, currentState) => {
    console.log(currentState);
    try {
      if (currentState === 1) {
        Swal.fire({
          title: "¿Estas seguro de deshabilitar esta Linea?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, deshabilitar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/dropLinea/${id}`);
            Swal.fire({
              title: "Linea desactivada",
              icon: "success",
              showConfirmButton: false,
              timer: 1000,
            });
            fetchData();
          }
        });
      } else {
        Swal.fire({
          title: "¿Estas seguro de habilitar esta Linea?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, habilitar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(`http://localhost:3001/upLinea/${id}`);
            Swal.fire({
              title: "Linea activada",
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
        `http://localhost:3001/getLineaByID/${id}`
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
    Swal.fire({
      title: "¿Estas seguro de editar esta Linea?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, editarla",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:3001/updateLinea`, editedLinea);
          setOpenEditDrawer(false);
          fetchData();
          Swal.fire({
            title: "Linea editada con exito!",
            text: "La Linea ha sido editada con exito.",
            icon: "success",
            timer: 1000,
          });
        } catch (error) {
          console.error("Error fetching the data:", error);
        }
      }
    });
  };
  const columns = [
    {
      name: "Nombre",
      selector: (row) => (
        <Tooltip title={row.nombre}>
          <span>{row.nombre}</span>
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
  return (
    <MenuLayout>
      <h1>Listado de lineas</h1>
      <Button
        style={{ marginBottom: 10 }}
        onClick={() => setOpenLineaDrawer(true)}
        type="primary"
      >
        Añadir Línea
      </Button>
      <div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <DataTable
            style={{ width: "100%" }}
            columns={columns}
            data={lineas}
            pagination={true}
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
        title="Añadir Nueva Sublínea"
      >
        <div>
          <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
            <strong>Añadir una nueva SubLinea</strong>
          </div>
          <Input
            placeholder="Nombre de la SubLínea"
            value={subLinea.nombre}
            onChange={handleSubLineaChange}
            style={{ padding: 0 }}
          />
        </div>
        {/* <div style={{ display: "flex", marginBottom: 10, marginTop: 10 }}>
          <Button
            style={{ backgroundColor: "#FF9800", borderColor: "#FF9800" }}
            onClick={handleOpenDrawerExistedSL}
          >
            Agregar a SubLinea existente
          </Button>
        </div> */}
        <div>
          <Button
            type="primary"
            onClick={handleAddSubLinea}
            style={{ marginTop: 20 }}
          >
            Guardar
          </Button>
        </div>
      </Drawer>
      <Drawer
        open={subLineaExisted}
        onClose={() => setSubLineaDrawerExisted(false)}
        title="Añadir a Sublínea existente"
      >
        {/* <div style={{ display: "flex", marginBottom: 10 }}>
          <strong>Añadir a SubLinea Existente</strong>
        </div>
        <SubLineasInput
          onChangeSubLineas={(value) => {
            setSubLinea((prev) => ({
              ...prev,
              sublinea_id: value.id,
            }));
          }}
        />
        <Button
          type="primary"
          onClick={handleAddExistedSL}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button> */}
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
