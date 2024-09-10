import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { Drawer, Button, Input, Spin, Tooltip, InputNumber } from "antd";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import ArticulosInput from "../components/ArticulosInput";
import ClienteInput from "../components/ClienteInput";
import DynamicList from "../components/DynamicList";
import CustomPagination from "../components/CustomPagination";
import { customHeaderStyles } from "../style/dataTableStyles"; //

function Compras() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [compra, setCompra] = useState({
    articulos: [],
    cliente: null,
    nro_compra: "",
  });
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [articuloValue, setArticuloValue] = useState(""); // Estado para el valor del input del tamaño
  const [clienteValue, setClienteValue] = useState(""); // Estado para el valor del input del cliente

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/compras");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const determineNextCompraNumber = () => {
    if (data.length > 0) {
      const lastCompra = data.reduce((max, compra) => {
        const nro = parseInt(compra.nro_compra.replace("C", ""));
        return nro > max ? nro : max;
      }, 0);
      return `C${String(lastCompra + 1).padStart(3, "0")}`;
    } else {
      return "C001";
    }
  };

  const handleOpenDrawer = () => {
    const nextCompraNumber = determineNextCompraNumber();
    setCompra((prev) => ({
      ...prev,
      nro_compra: nextCompraNumber,
    }));
    setOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "Nro. Compra",
      selector: (row) => row.nro_compra,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => format(new Date(row.fecha_compra), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Proveedor",
      selector: (row) => row.proveedor_nombre,
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => row.total,
      sortable: true,
    },
  ];

  return (
    <MenuLayout>
      <h1>Compras</h1>
      <Button onClick={handleOpenDrawer} type="primary">
        Registrar Compra
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva Compra"
        placement="right"
        closable={true}
        maskClosable={false}
      >
        <div style={{ display: "flex", marginTop: 10 }}>
          <Tooltip>Nro de Compra</Tooltip>
        </div>
        <Input
          value={compra?.nro_compra}
          style={{ marginBottom: 10 }}
          readOnly
        />
      </Drawer>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        highlightOnHover
        pagination
        customStyles={customHeaderStyles}
      />
    </MenuLayout>
  );
}

export default Compras;
