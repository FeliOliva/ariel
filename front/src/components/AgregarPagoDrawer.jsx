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

dayjs.locale("es"); // Configura el idioma a español

const { Option } = Select;

const AgregarPagoDrawer = ({
  visible,
  onClose,
  clienteId,
  nextNroPago,
  onPagoAdded,
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
      confirm({
        title: "Confirmar pago",
        content: "¿Seguro que desea registrar este pago?",
        okText: "Si",
        cancelText: "No",
        onOk: async () => {
          if (metodo_pago === "cheque") {
            // Enviar datos del cheque al backend
            await axios.post("http://localhost:3001/addCheque", {
              banco,
              nro_cheque,
              fecha_emision: fecha_emision.format("YYYY-MM-DD"),
              fecha_cobro: fecha_cobro.format("YYYY-MM-DD"),
              importe: rest.monto,
              cliente_id: clienteId,
              nro_pago: nextNroPago,
            });
          }

          // Enviar datos del pago al backend
          await axios.post("http://localhost:3001/addPago", {
            ...rest,
            cliente_id: clienteId,
            nro_pago: nextNroPago,
            metodo_pago,
          });

          notification.success({
            message: "Pago registrado",
            description: "El pago se ha registrado correctamente.",
            duration: 1,
          });
          form.resetFields();
          onPagoAdded(); // Notifica al componente padre sobre el nuevo pago
          // setTimeout(() => {
          //   window.location.reload();
          // }, 1200);
          onClose(); // Cierra el drawer
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
        visible={visible}
        width={400}
      >
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
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="nro_pago"
            label="Nro. Pago"
            initialValue={nextNroPago}
          >
            <Input disabled />
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
