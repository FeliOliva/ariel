import React, { useState } from "react";
import { List, InputNumber, Button, Space, Typography } from "antd";
import { DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Función para formatear números con 2 decimales (formato es-AR) redondeando hacia arriba
const formatNumberWithDecimals = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "0,00";
  const number = typeof num === "string" ? parseFloat(num.replace(",", ".")) : num;
  const roundedNumber = Math.ceil(number);
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedNumber);
};

const DynamicListCompras = ({ items, onDelete, onEdit, onAumentoPorcentaje, onEditCantidad }) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedCosto, setEditedCosto] = useState(0);
  const [editedPrecioMonotributista, setEditedPrecioMonotributista] = useState(0);
  const [editedCantidad, setEditedCantidad] = useState(0);
  const [porcentajeAumentoItem, setPorcentajeAumentoItem] = useState({}); // { uniqueId: { costo: X, precioMonotributista: Y } }

  // Función para manejar el clic en editar
  const handleEditClick = (item) => {
    setEditingItemId(item.uniqueId);
    setEditedCosto(item.costo || 0);
    setEditedPrecioMonotributista(item.precio_monotributista || 0);
    setEditedCantidad(item.cantidad || 0);
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedCosto(0);
    setEditedPrecioMonotributista(0);
    setEditedCantidad(0);
  };

  // Función para guardar los precios editados
  const handleSaveClick = (uniqueId) => {
    if (!isNaN(editedCosto) && !isNaN(editedPrecioMonotributista)) {
      onEdit(uniqueId, editedCosto, editedPrecioMonotributista);
    }
    // Si hay función para editar cantidad y la cantidad cambió, actualizarla
    if (onEditCantidad && !isNaN(editedCantidad) && editedCantidad > 0) {
      onEditCantidad(uniqueId, editedCantidad);
    }
    setEditingItemId(null);
  };

  // Guardar los porcentajes cuando cambien (se aplicarán al registrar)
  const handlePorcentajeCostoChange = (item, porcentaje) => {
    const newValue = { costo: porcentaje || 0 };
    setPorcentajeAumentoItem((prev) => ({
      ...prev,
      [item.uniqueId]: {
        ...(prev[item.uniqueId] || {}),
        ...newValue,
      },
    }));
    // Notificar al padre sobre el cambio de porcentaje
    if (onAumentoPorcentaje) {
      const current = porcentajeAumentoItem[item.uniqueId] || {};
      onAumentoPorcentaje(item.uniqueId, {
        costo: porcentaje || 0,
        precio: current.precio || 0,
      });
    }
  };

  const handlePorcentajePrecioChange = (item, porcentaje) => {
    const newValue = { precio: porcentaje || 0 };
    setPorcentajeAumentoItem((prev) => ({
      ...prev,
      [item.uniqueId]: {
        ...(prev[item.uniqueId] || {}),
        ...newValue,
      },
    }));
    // Notificar al padre sobre el cambio de porcentaje
    if (onAumentoPorcentaje) {
      const current = porcentajeAumentoItem[item.uniqueId] || {};
      onAumentoPorcentaje(item.uniqueId, {
        costo: current.costo || 0,
        precio: porcentaje || 0,
      });
    }
  };

  return (
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item key={item.uniqueId}>
          <List.Item.Meta
            title={item.nombre}
            description={
              <>
                {editingItemId === item.uniqueId ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px", width: "120px" }}>Cantidad:</Text>
                      <InputNumber
                        value={editedCantidad}
                        onChange={(value) => setEditedCantidad(value || 0)}
                        min={1}
                        style={{ width: 100 }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px", width: "120px" }}>Costo:</Text>
                      <InputNumber
                        value={editedCosto}
                        onChange={(value) => setEditedCosto(value || 0)}
                        min={0}
                        style={{ width: 100 }}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        precision={2}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Text type="secondary" style={{ fontSize: "12px", width: "120px" }}>P. Monot.:</Text>
                      <InputNumber
                        value={editedPrecioMonotributista}
                        onChange={(value) => setEditedPrecioMonotributista(value || 0)}
                        min={0}
                        style={{ width: 100 }}
                        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        precision={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>
                      {`Cantidad: ${item.cantidad} `}
                      {`Costo: $${formatNumberWithDecimals(item.costo)} `}
                      {`P. Monot.: $${formatNumberWithDecimals(item.precio_monotributista)}`}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Text type="secondary" style={{ fontSize: "11px", width: "80px" }}>Aum. Costo %:</Text>
                        <InputNumber
                          min={0}
                          max={1000}
                          value={porcentajeAumentoItem[item.uniqueId]?.costo || 0}
                          onChange={(value) => handlePorcentajeCostoChange(item, value)}
                          formatter={(value) => `${value}%`}
                          parser={(value) => value.replace('%', '')}
                          style={{ width: 80 }}
                          size="small"
                          placeholder="%"
                        />
                      </div>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Text type="secondary" style={{ fontSize: "11px", width: "80px" }}>Aum. P. Mon. %:</Text>
                        <InputNumber
                          min={0}
                          max={1000}
                          value={porcentajeAumentoItem[item.uniqueId]?.precio || 0}
                          onChange={(value) => handlePorcentajePrecioChange(item, value)}
                          formatter={(value) => `${value}%`}
                          parser={(value) => value.replace('%', '')}
                          style={{ width: 80 }}
                          size="small"
                          placeholder="%"
                        />
                      </div>
                      <Text type="secondary" style={{ fontSize: "10px", fontStyle: "italic" }}>
                        (se aplica al registrar)
                      </Text>
                    </div>
                  </div>
                )}
              </>
            }
          />
          <Space>
            {editingItemId === item.uniqueId ? (
              <>
                <Button
                  type="text"
                  icon={<SaveOutlined />}
                  onClick={() => handleSaveClick(item.uniqueId)}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                />
              </>
            ) : (
              <>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(item.uniqueId)}
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditClick(item)}
                />
              </>
            )}
          </Space>
        </List.Item>
      )}
    />
  );
};

export default DynamicListCompras;

