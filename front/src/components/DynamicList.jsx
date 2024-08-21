import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DynamicList = ({ items, onDelete }) => {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          {" "}
          {/* Usa el ID como key */}
          <ListItemText
            primary={item.label}
            secondary={`Cantidad: ${item.quantity}`}
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
