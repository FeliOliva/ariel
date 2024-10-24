import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const DynamicList = ({ items, onDelete, onGiftChange, onEdit }) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  // Función para manejar el clic en editar
  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditedPrice(item.price); // Inicializa con el precio actual
    console.log(item.price);
  };

  // Función para guardar el precio editado
  const handleSaveClick = (itemId) => {
    console.log("itemiId", itemId);
    const parsedPrice = parseFloat(editedPrice);
    if (!isNaN(parsedPrice)) {
      onEdit(itemId, parsedPrice); // Pasa el precio como número
    }
    setEditingItemId(null); // Finaliza el modo edición
    console.log("editedPrice", editedPrice);
  };
  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          {/* Usa el ID como key */}
          <ListItemText
            primary={item.label}
            secondary={
              <>
                {`Cantidad: ${item.quantity} `}
                {editingItemId === item.id ? (
                  <TextField
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    type="number"
                    label="Precio"
                  />
                ) : (
                  `Precio: $${item?.price ? item.price : editedPrice}`
                )}
              </>
            }
          />
          <Checkbox
            checked={!!item.isGift} // Asegúrate de que sea un valor booleano
            onChange={(e) => onGiftChange(item.id, e.target.checked)} // Manejo del cambio de estado
            label="Es regalo"
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(item.id)} // Pasa el ID en lugar del índice
            >
              <DeleteIcon />
            </IconButton>
            {editingItemId === item.id ? (
              <IconButton
                edge="end"
                aria-label="save"
                onClick={() => handleSaveClick(item.id)}
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
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default DynamicList;
