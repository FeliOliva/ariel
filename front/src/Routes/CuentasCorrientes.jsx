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
  Form,
  DatePicker,
  message,
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
import dayjs from "dayjs";

function CuentasCorrientes() {
  const [client, setClient] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTotal, setOpenTotal] = useState(false);
  const [total, setTotal] = useState(0);
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState(null);
  const [cheque, setCheque] = useState(null);
  const [cuentaCorriente, setCuentaCorriente] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Nuevo estado para controlar la búsqueda
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { confirm } = Modal;
  let idCheque = null;
  let estado_pago = "";
  const [form] = Form.useForm();
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
    console.log(cliente);
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
    console.log("cuenta corriente", cuentaCorriente);
    console.log("cliente", client);
    console.log("monto", monto);
    console.log("metodo de pago", metodoPago);
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
    if (monto === cuentaCorriente.saldo_total) {
      estado_pago = "CANCELADO";
    } else {
      estado_pago = "PARCIAL";
    }

    console.log("estado de pago", estado_pago);
    confirm({
      title: "¿Esta seguro de pagar este monto?",
      icon: <ExclamationCircleOutlined />,
      okText: "Si, confirmar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          if (cheque) {
            const response = await axios.post(
              "http://localhost:3001/addCheque",
              cheque,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            idCheque = response.data.cheque[0].id;
          }
          console.log("id del cheque", idCheque);
          await axios.put("http://localhost:3001/payByCuentaCorriente", {
            monto: monto,
            cliente_id: client,
            ID: cuentaCorriente.id,
            venta_id: cuentaCorriente.venta_id,
            metodo_pago: metodoPago,
            cheque_id: idCheque,
            estado_pago: estado_pago,
          });
          notification.success({
            message: "Exito",
            description: "Cuenta corriente pagada con exito",
            duration: 2,
          });
          fetchCuentasCorrientes(client);
          fetchPagoCuentasCorrientes(client);
          setMonto(0);
          setOpen(false);
          setCheque(null);
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
          if (cheque) {
            const response = await axios.post(
              "http://localhost:3001/addCheque",
              cheque,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            idCheque = response.data.cheque[0].id;
            console.log("id del cheque", response.data.cheque[0].id);
          }
          await axios.put("http://localhost:3001/payCuentaByTotal", {
            monto: monto,
            cliente_id: client,
            metodo_pago: metodoPago,
          });
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
    console.log(metodo);
    if (metodo.id === 3) {
      setIsModalVisible(true);
    }
  };
  const handleOk = () => {
    // Aquí podrías procesar los datos del formulario

    form.submit();
  };

  const handleCancel = () => {
    // Cierra el modal sin hacer nada
    setIsModalVisible(false);
  };
  const onFinish = (values) => {
    const chequeData = {
      banco: values.banco,
      nro_cheque: values.nro_cheque,
      fecha_emision: dayjs(values.fecha_emision).format("YYYY-MM-DD"),
      fecha_cobro: dayjs(values.fecha_cobro).format("YYYY-MM-DD"),
      importe: parseFloat(values.importe), // Asegúrate de convertir a número
    };
    console.log("Datos del cheque:", chequeData);
    setCheque(chequeData);
    setIsModalVisible(false);
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
      <Modal
        title="Ingrese los datos de su cheque"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish} // Maneja el envío del formulario
        >
          <Form.Item
            label="Número de Cheque"
            name="nro_cheque"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el número de cheque",
              },
            ]}
          >
            <Input placeholder="Ingrese el número de cheque" />
          </Form.Item>

          <Form.Item
            label="Banco"
            name="banco"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre del banco",
              },
            ]}
          >
            <Input placeholder="Ingrese el nombre del banco" />
          </Form.Item>

          <Form.Item
            label="Monto"
            name="importe"
            rules={[{ required: true, message: "Por favor ingrese el monto" }]}
          >
            <Input placeholder="Ingrese el monto" type="number" />
          </Form.Item>

          <Form.Item
            label="Fecha de Emisión"
            name="fecha_emision"
            rules={[
              {
                required: true,
                message: "Por favor ingrese la fecha de emisión",
              },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Fecha de Cobro"
            name="fecha_cobro"
            rules={[
              {
                required: true,
                message: "Por favor ingrese la fecha de cobro",
              },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
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
          style={{ marginTop: "5px", display: "flex", alignItems: "center" }}
        >
          <div style={{ marginTop: "5px" }}>
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
        <div style={{ margin: "20px", marginLeft: "0px" }}>
          <Tooltip title="Metodo de pago">
            <span style={{ display: "block", marginBottom: "8px" }}>
              Método de pago
            </span>
          </Tooltip>
          <MetodosPagoInput
            value={metodoPago}
            onChangeMetodo={handleMetodoChange}
            onInputChange={setMetodoPago}
            style={{ marginTop: "8px" }}
          />
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
