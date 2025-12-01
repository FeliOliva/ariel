import React from "react";
import { List, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const DynamicListPedido = ({ items, onDelete }) => {
  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item key={item.uniqueId}>
          <List.Item.Meta
            title={item.label}
            description={`Cantidad: ${item.quantity}`}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(item.uniqueId)}
          />
        </List.Item>
      )}
    />
  );
};

export default DynamicListPedido;
