import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
  message,
  Modal,
  notification,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { ConfigProvider } from "antd";
import axios from "axios";
import VendedoresInput from "./VendedoresInput";

dayjs.locale("es"); // Configura el idioma a español

const { Option } = Select;

const AgregarPagoDrawer = ({
  visible,
  onClose,
  clienteId,
  nextNroPago,
  onPagoAdded,
  saldoRestante,
}) => {
  const [form] = Form.useForm();
  const [isCheque, setIsCheque] = useState(false);
  const { confirm } = Modal;
  const onFinish = async (values) => {
    try {
      const {
        banco,
        nro_cheque,
        fecha_emision,
        fecha_cobro,
        metodo_pago,
        ...rest
      } = values;

      // 👇 Convertimos el monto a número (stringMode devuelve string)
      const montoNumero = Number(rest.monto);

      if (Number.isNaN(montoNumero) || montoNumero <= 0) {
        message.error("Ingrese un monto válido.");
        return;
      }

      // 👇 Validación contra saldo restante (solo si es positivo)
      if (
        saldoRestante != null &&
        saldoRestante > 0 &&
        montoNumero > saldoRestante
      ) {
        notification.warning({
          message: "Monto excede el saldo",
          description: `El saldo restante del cliente es $${saldoRestante.toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}. No puede registrar un pago mayor.`,
          duration: 3,
        });
        return; // 👉 No seguimos, no se abre el confirm
      }

      confirm({
        title: "Confirmar pago",
        content: "¿Seguro que desea registrar este pago?",
        okText: "Si",
        cancelText: "No",
        onOk: async () => {
          await axios.post("http://localhost:3001/addPago", {
            cliente_id: clienteId,
            metodo_pago,
            monto: rest.monto,
            vendedor_id: values.vendedor_id,
            cheque:
              metodo_pago === "cheque"
                ? {
                    banco,
                    nro_cheque,
                    fecha_emision: fecha_emision.format("YYYY-MM-DD"),
                    fecha_cobro: fecha_cobro.format("YYYY-MM-DD"),
                  }
                : null,
          });
          notification.success({
            message: "Pago registrado",
            description: "El pago se ha registrado correctamente.",
            duration: 1,
          });
          form.resetFields();
          onPagoAdded();
          onClose();
        },
      });
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      message.error("Hubo un problema al registrar el pago");
    }
  };

  const handleMetodoPagoChange = (value) => {
    setIsCheque(value === "cheque");
  };

  return (
    <ConfigProvider locale={{ locale: "es" }}>
      <Drawer
        title="Agregar Pago"
        placement="right"
        onClose={onClose}
        open={visible}
        width={400}
      >
        <p>
          <strong>Saldo restante del cliente:</strong>{" "}
          {saldoRestante != null
            ? `$ ${saldoRestante.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "N/D"}
        </p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="monto"
            label="Monto"
            rules={[{ required: true, message: "Por favor ingrese el monto" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              precision={2} // <-- fuerza 2 decimales
              stringMode // <-- ¡la clave! evita redondeos y floats raros
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="metodo_pago"
            label="Método de Pago"
            rules={[
              {
                required: true,
                message: "Por favor seleccione el método de pago",
              },
            ]}
          >
            <Select onChange={handleMetodoPagoChange}>
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
              <Option value="cheque">Cheque</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="vendedor_id"
            label="Vendedor"
            rules={[
              { required: true, message: "Porfavor seleccione un vendedor" },
            ]}
          >
            <VendedoresInput />
          </Form.Item>
          {isCheque && (
            <>
              <Form.Item
                name="banco"
                label="Banco"
                rules={[
                  { required: true, message: "Por favor ingrese el banco" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="nro_cheque"
                label="Número de Cheque"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingrese el número de cheque",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="fecha_emision"
                label="Fecha de Emisión"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione la fecha de emisión",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="fecha_cobro"
                label="Fecha de Vencimiento"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione la fecha de vencimiento",
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Agregar Pago
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </ConfigProvider>
  );
};

export default AgregarPagoDrawer;
