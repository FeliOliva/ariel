import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Drawer,
  InputNumber,
  Tooltip,
  Modal,
  notification,
  Input,
} from "antd";
import ClienteInput from "../components/ClienteInput";
import MetodosPagoInput from "../components/MetodosPagoInput";
import DataTable from "react-data-table-component";
import MenuLayout from "../components/MenuLayout";
import { customHeaderStyles } from "../style/dataTableStyles";
import CustomPagination from "../components/CustomPagination";
import { format } from "date-fns";
import "../style/style.css";
import { ExclamationCircleOutlined } from "@ant-design/icons";

function CuentasCorrientes() {
  const [client, setClient] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTotal, setOpenTotal] = useState(false);
  const [total, setTotal] = useState(0);
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState(null);
  const [metodoPagoValue, setMetodoPagoValue] = useState("");
  const [cuentaCorriente, setCuentaCorriente] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Nuevo estado para controlar la búsqueda
  const { confirm } = Modal;
  const fetchCuentasCorrientes = async (clientId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/cuentasCorrientesByCliente/${clientId}`
      );
      console.log(response.data);
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

  const handlePayByCuenta = (id, venta_id, saldo_total) => () => {
    setCuentaCorriente({
      id: id,
      venta_id: venta_id,
      saldo_total: saldo_total,
    });
    console.log(id, venta_id);
    setOpen(true);
  };

  const handlePayMonto = async () => {
    console.log(cuentaCorriente);
    console.log(client);
    console.log(monto);
    console.log(metodoPago); // Solo el id del método de pago
    if (!monto || monto <= 0) {
      Modal.warning({
        title: "Advertencia",
        content: "No has ingresado un valor de pago.",
        icon: <ExclamationCircleOutlined />,
        timer: 1500,
      });
      return;
    }
    if (monto > cuentaCorriente.saldo_total) {
      Modal.warning({
        title: "Advertencia",
        content: "El valor de pago es mayor al saldo de la cuenta.",
        icon: <ExclamationCircleOutlined />,
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
          // await axios.put("http://localhost:3001/payByCuentaCorriente", {
          //   monto: monto,
          //   cliente_id: client,
          //   ID: cuentaCorriente.id,
          //   venta_id: cuentaCorriente.venta_id,
          // });
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
    console.log(metodoPago);
    if (!monto || monto <= 0) {
      Modal.warning({
        title: "Advertencia",
        content: "No has ingresado un valor de pago.",
        icon: <ExclamationCircleOutlined />,
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
          // await axios.put("http://localhost:3001/payCuentaByTotal", {
          //   monto: monto,
          //   cliente_id: client,
          // });
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
  const handlePonerTotal = () => {
    setMonto(cuentaCorriente.saldo_total);
  };
  const handlePonerMontoTotal = () => {
    setMonto(total);
  };
  const handleMetodoChange = (metodo) => {
    setMetodoPago(metodo);
  };

  const columns = [
    {
      name: "Monto Total",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {row.saldo_total}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => (
        <span className={row.estado === 0 ? "strikethrough" : ""}>
          {format(new Date(row.fecha_ultima_actualizacion), "dd/MM/yyyy")}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Pagar",
      cell: (row) => (
        <Button
          className="custom-button"
          onClick={() =>
            row.saldo_total > 0
              ? handlePayByCuenta(row.id, row.venta_id, row.saldo_total)()
              : notification.warning({
                  message: "Advertencia",
                  description: "No hay saldo disponible para pagar",
                  duration: 2,
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
          <div
            style={{ marginTop: "10px", display: "flex", alignItems: "center" }}
          >
            <InputNumber
              value={monto}
              onChange={setMonto}
              style={{ width: "70%", marginRight: "10px" }} // Reduce el ancho del InputNumber
            />
            <Button
              className="custom-button"
              onClick={handlePonerTotal}
              style={{ marginTop: "20px" }}
            >
              Poner Total
            </Button>
          </div>
          <Tooltip title="Metodo de pago">
            <span>Metodo de pago</span>
          </Tooltip>
          <MetodosPagoInput
            value={metodoPago}
            onChangeMetodo={handleMetodoChange}
            onInputChange={setMetodoPago}
          />
        </div>
        <Button
          type="primary"
          onClick={handlePayMonto}
          style={{ marginLeft: "10px", flexShrink: 0 }} // Coloca el botón junto al InputNumber
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
        <Tooltip title="Monto a descontar">
          <span>Monto a pagar</span>
        </Tooltip>
        <div
          style={{ marginTop: "10px", display: "flex", alignItems: "center" }}
        >
          <div style={{ marginTop: "10px" }}>
            <InputNumber
              value={monto}
              onChange={setMonto}
              style={{ width: "70%" }}
            />
          </div>
          <Button
            onClick={handlePonerMontoTotal}
            type="default"
            style={{ display: "flex" }}
          >
            Poner Total
          </Button>
        </div>
        <Tooltip title="Metodo de pago">
          <span>Metodo de pago</span>
        </Tooltip>
        <Input
          value={metodoPago}
          onChange={setMetodoPago}
          style={{ marginTop: "10px", width: "70%" }}
        />
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
              <>
                <Button
                  onClick={handleOpenPayTotalDrawer}
                  type="primary"
                  style={{ marginLeft: "10px" }}
                >
                  Pagar Total
                </Button>
                {/* Botón para establecer el monto total como el monto a pagar */}
              </>
            )}
          </div>
        )}
      </div>
    </MenuLayout>
  );
}

export default CuentasCorrientes;
