import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  message,
} from "antd";
import axios from "axios";

const { Option } = Select;

const AgregarPagoDrawer = ({
  visible,
  onClose,
  clienteId,
  nextNroPago,
  onPagoAdded,
}) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log(values);
    console.log(clienteId);
    console.log(nextNroPago);
    try {
      const response = await axios.post("http://localhost:3001/addPago", {
        ...values,
        cliente_id: clienteId,
        nro_pago: nextNroPago,
      });

      message.success("Pago agregado exitosamente");
      onPagoAdded(response.data);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error al agregar el pago:", error);
      message.error("Hubo un problema al agregar el pago");
    }
  };

  return (
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
        <Form.Item name="nro_pago" label="Nro. Pago" initialValue={nextNroPago}>
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
          <Select>
            <Option value="efectivo">Efectivo</Option>
            <Option value="transferencia">Transferencia</Option>
            <Option value="cheque">Cheque</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Agregar Pago
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AgregarPagoDrawer;
