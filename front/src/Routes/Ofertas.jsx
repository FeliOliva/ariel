import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Drawer, Button, InputNumber, Input, Tooltip } from "antd";
import MenuLayout from "../components/MenuLayout";
import ArticulosInput from "../components/ArticulosInput";
import { Link } from "react-router-dom";
import { format } from "date-fns";

function Ofertas() {
  const [data, setData] = useState([]);
  const [newOfert, setNewOfert] = useState([]);
  const [currentOfert, setCurrentOfert] = useState({});
  const [open, setOpen] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/ofertas");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditDrawer = async (id) => {
    console.log(id);
    try {
      const response = await axios.get(
        `http://localhost:3001/detalleOferta/${id}`
      );
      setCurrentOfert(response.data);
      console.log("response.data")
      console.log(response.data);
      setOpenEditDrawer(true);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      console.log("currentOfert")
      console.log(currentOfert);
    }
  };
  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Precio total",
      selector: (row) => row.total_oferta,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => (row.estado ? "Habilitado" : "Deshabilitado"),
      sortable: true,
    },
    {
      name: "Detalles",
      cell: (row) => (
        <Link to={`/ofertas/${row.id}`}>
          <Button type="primary">Detalles</Button>
        </Link>
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
  ];
  return (
    <MenuLayout>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Editar oferta"
        width={720}
      >
        <ArticulosInput id={newOfert.id} />
      </Drawer>
      <Drawer
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        title="Editar oferta"
      >
        <div style={{ display: "flex", marginBottom: 10 }}>
          <Tooltip>Nombre de la oferta</Tooltip>
        </div>
        {
          currentOfert?.productos?.map((valueProd, indexProd) => (
            <Input
            key={`dsdsad-${indexProd}`}
              value={valueProd?.nombre}
              onChange={(e) =>
                setCurrentOfert(i => {
                  i.productos[indexProd].nombre = e.target.value
                  return [...i]
                })
              }
              placeholder="Nombre"
              required
            ></Input>
            
          ))
        }
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        pagination
        title="Ofertas"
        highlightOnHover
      />
    </MenuLayout>
  );
}

export default Ofertas;
