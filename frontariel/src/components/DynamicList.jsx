import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DynamicList = ({ items, onDelete }) => {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={`item-${item.id}`}>
          <ListItemText
            primary={item.label}
            secondary={<Typography>Cantidad: {item.quantity}</Typography>}
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(item.id)}
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
