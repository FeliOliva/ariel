import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DynamicList = ({ items, onDelete, onGiftChange }) => {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          {/* Usa el ID como key */}
          <ListItemText
            primary={item.label}
            secondary={`Cantidad: ${item.quantity}`}
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
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default DynamicList;
