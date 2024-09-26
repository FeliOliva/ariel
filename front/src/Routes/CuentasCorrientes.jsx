import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Drawer,
  InputNumber,
  Tooltip,
  Modal,
  notification,
} from "antd";
import ClienteInput from "../components/ClienteInput";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { customHeaderStyles } from "../style/dataTableStyles";
import CustomPagination from "../components/CustomPagination";
import { format, set } from "date-fns";
import "../style/style.css";
import Swal from "sweetalert2";
import { ExclamationCircleOutlined } from "@ant-design/icons";

function CuentasCorrientes() {
  const [client, setClient] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTotal, setOpenTotal] = useState(false);
  const [total, setTotal] = useState(0);
  const [monto, setMonto] = useState(0);
  const [cuentaCorriente, setCuentaCorriente] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Nuevo estado para controlar la búsqueda
  const { confirm } = Modal;
  const fetchCuentasCorrientes = async (clientId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/cuentasCorrientesByCliente/${clientId}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener las cuentas corrientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPagoCuentasCorrientes = async (client_id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/TotalCuentasByCliente/${client_id}`
      );
      setTotal(response.data.monto_total);
    } catch (error) {
      console.error("Error al obtener el monto total:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedClient = () => {
    if (!client) {
      Modal.warning({
        title: "Advertencia",
        content: "Por favor, selecciona un cliente.",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
    } else {
      fetchCuentasCorrientes(client);
      fetchPagoCuentasCorrientes(client);
      setHasSearched(true); // Activar después de hacer clic en Buscar
    }
  };

  const handleClienteChange = (cliente) => {
    setClient(cliente);
  };

  const handlePayByCuenta = (id) => () => {
    setCuentaCorriente(id);
    setOpen(true);
  };

  const handlePayMonto = async () => {
    console.log(cuentaCorriente);
    console.log(client);
    console.log(monto);
    if (!monto) {
      Modal.warning({
        title: "Advertencia",
        content: "No has ingresado un valor de pago.",
        icon: "error",
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Esta seguro de pagar este monto?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await axios.put(
            "http://localhost:3001/payByCuentaCorriente",
            { monto: monto, cliente_id: client, ID: cuentaCorriente }
          );
          console.log(response.data);
          notification.success({
            message: "Exito",
            description: "Cuenta corriente pagada con exito",
            duration: 2,
          });
          fetchCuentasCorrientes(client);
          fetchPagoCuentasCorrientes(client);
          setMonto(0);
          setOpen(false);
        } catch (error) {
          console.error("Error al pagar la cuenta:", error);
        }
      },
    });
  };
  const handleOpenPayTotalDrawer = () => {
    setOpenTotal(true);
  };
  // Función para pagar todo el saldo
  const handlePayTotal = async () => {
    console.log(monto);
    console.log(client);
    if (!monto) {
      Modal.warning({
        title: "Advertencia",
        content: "No has ingresado un valor de pago.",
        icon: "error",
        timer: 1500,
      });
      return;
    }
    confirm({
      title: "¿Esta seguro de pagar todo el saldo?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await axios.put(
            "http://localhost:3001/payCuentaByTotal",
            { monto: monto, cliente_id: client }
          );
          console.log(response.data);
          notification.success({
            message: "Exito",
            description: "Total pagado con exito",
            duration: 2,
          });
          setOpenTotal(false);
          fetchCuentasCorrientes(client);
          fetchPagoCuentasCorrientes(client);
          setMonto(0);
        } catch (error) {
          console.error("Error al pagar el total:", error);
        }
      },
    });
  };
  const columns = [
    {
      name: "Monto Total",
      selector: (row) => row.saldo_total,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) =>
        format(new Date(row.fecha_ultima_actualizacion), "dd/MM/yyyy"),
      sortable: true,
    },
    {
      name: "Pagar",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() =>
            row.saldo_total > 0
              ? handlePayByCuenta(row.id)()
              : Swal.fire({
                  title: "Advertencia",
                  text: "Esta cuenta ya está en 0",
                  icon: "warning",
                  timer: 1500,
                })
          }
          disabled={row.saldo_total === 0} // Deshabilitar si el saldo es 0
        >
          Pagar
        </Button>
      ),
    },
  ];

  return (
    <MenuLayout>
      <div>Cuentas Corrientes</div>
      <div style={{ display: "flex", width: "30%" }}>
        <ClienteInput
          value={client}
          onChangeCliente={handleClienteChange}
          onInputChange={setClient}
        />
        <Button onClick={handleSelectedClient} type="primary">
          Buscar
        </Button>
      </div>

      <Drawer
        title="Pagar Cuenta Corriente"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <div style={{ marginBottom: "20px" }}>
          <Tooltip title="Monto a descontar">
            <span>Monto a pagar</span>
          </Tooltip>
          <div style={{ marginTop: "10px" }}>
            <InputNumber
              value={monto}
              onChange={setMonto}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <Button
          type="primary"
          onClick={handlePayMonto}
          style={{ marginTop: "20px" }}
        >
          Pagar
        </Button>
      </Drawer>

      <Drawer
        title="Pagar por total"
        placement="right"
        onClose={() => setOpenTotal(false)}
        open={openTotal}
      >
        <div style={{ marginBottom: "20px" }}>
          <Tooltip title="Monto a descontar">
            <span>Monto a pagar</span>
          </Tooltip>
          <div style={{ marginTop: "10px" }}>
            <InputNumber
              value={monto}
              onChange={setMonto}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <Button
          type="primary"
          onClick={handlePayTotal}
          style={{ marginTop: "20px" }}
        >
          Pagar
        </Button>
      </Drawer>

      <div>
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          // Mostrar diferentes mensajes según si se ha hecho o no la búsqueda
          noDataComponent={
            hasSearched
              ? "No se han encontrado registros"
              : "Seleccione un cliente para ver los registros"
          }
          customStyles={customHeaderStyles}
          pagination
          paginationComponent={CustomPagination}
        />

        {hasSearched && client && (
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <strong>Total: {total}</strong>
            {total > 0 && (
              <Button
                onClick={handleOpenPayTotalDrawer}
                type="primary"
                style={{ marginLeft: "10px" }}
              >
                Pagar Total
              </Button>
            )}
          </div>
        )}
      </div>
    </MenuLayout>
  );
}

export default CuentasCorrientes;
