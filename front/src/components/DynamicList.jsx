import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const DynamicList = ({ items, onDelete, onGiftChange, onEdit }) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  // Función para manejar el clic en editar
  const handleEditClick = (item) => {
    setEditingItemId(item.uniqueId); // Cambiar a uniqueId
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
    <List>
      {items.map((item) => (
        <ListItem key={item.uniqueId}>
          <ListItemText
            primary={item.label}
            secondary={
              <>
                {`Cantidad: ${item.quantity} `}
                {editingItemId === item.uniqueId ? ( // Cambiar a uniqueId
                  <TextField
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    type="number"
                    label="Precio"
                  />
                ) : (
                  `Precio: $${item.price}`
                )}
              </>
            }
          />
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              checked={!!item.isGift}
              onChange={(e) => onGiftChange(item.uniqueId, e.target.checked)} // Cambiar a uniqueId
            />
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(item.uniqueId)} // Cambiar a uniqueId
            >
              <DeleteIcon />
            </IconButton>
            {editingItemId === item.uniqueId ? ( // Cambiar a uniqueId
              <IconButton
                edge="end"
                aria-label="save"
                onClick={() => handleSaveClick(item.uniqueId)} // Cambiar a uniqueId
              >
                <SaveIcon />
              </IconButton>
            ) : (
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditClick(item)}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default DynamicList;
