import React from "react";
import { List, ListItem, ListItemText, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DynamicListPedido = ({ items, onDelete }) => {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.uniqueId}>
          <ListItemText
            primary={item.label}
            secondary={<>{`Cantidad: ${item.quantity} `}</>}
          />
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(item.uniqueId)} // Cambiar a uniqueId
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default DynamicListPedido;
