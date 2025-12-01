import React, { useState } from "react";
import { List, Checkbox, Input, Button, Space } from "antd";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";

const DynamicList = ({ items, onDelete, onGiftChange, onEdit }) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  // Función para manejar el clic en editar
  const handleEditClick = (item) => {
    setEditingItemId(item.uniqueId);
    setEditedPrice(item.price);
  };

  // Función para guardar el precio editado
  const handleSaveClick = (uniqueId) => {
    const parsedPrice = parseFloat(editedPrice);
    if (!isNaN(parsedPrice)) {
      onEdit(uniqueId, parsedPrice);
    }
    setEditingItemId(null);
  };

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item key={item.uniqueId}>
          <List.Item.Meta
            title={item.label}
            description={
              <>
                {`Cantidad: ${item.quantity} `}
                {editingItemId === item.uniqueId ? (
                  <Input
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    type="number"
                    placeholder="Precio"
                    style={{ width: 100 }}
                  />
                ) : (
                  `Precio: $${item.price}`
                )}
              </>
            }
          />
          <Space>
            <Checkbox
              checked={!!item.isGift}
              onChange={(e) => onGiftChange(item.uniqueId, e.target.checked)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(item.uniqueId)}
            />
            {editingItemId === item.uniqueId ? (
              <Button
                type="text"
                icon={<SaveOutlined />}
                onClick={() => handleSaveClick(item.uniqueId)}
              />
            ) : (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditClick(item)}
              />
            )}
          </Space>
        </List.Item>
      )}
    />
  );
};

export default DynamicList;
