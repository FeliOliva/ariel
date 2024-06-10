import * as React from "react";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FetchComboBox from "./FetchComboBox";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: "#e0e0e0", // Cambiar el color de fondo a un azul más claro
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  zIndex: 10000000, // Ajusta el valor de zIndex
};

export default function TransitionsModal({ url, title, fields }) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Formulario enviado con éxito");
        handleClose();
      } else {
        throw new Error("Error al enviar el formulario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el formulario");
    }
  };

  return (
    <div>
      <Button onClick={handleOpen}>{title.toLowerCase()}</Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              style={{ textTransform: "none" }}
            >
              {title}
            </Typography>
            <form onSubmit={handleSubmit}>
              {fields.map((field) => {
                if (field.type === "fetchComboBox") {
                  return (
                    <FetchComboBox
                      key={field.name}
                      url={field.url}
                      label={field.label}
                      labelKey="nombre"
                      valueKey="id"
                      onSelect={(selectedValue) =>
                        handleChange({
                          target: { name: field.name, value: selectedValue },
                        })
                      }
                      value={formData[field.name]}
                      style={{ marginBottom: 10, width: 150, zIndex: 1 }}
                    />
                  );
                } else {
                  return (
                    <TextField
                      key={field.name}
                      id={field.name}
                      name={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      style={{ marginBottom: 10 }}
                    />
                  );
                }
              })}
              <Button type="submit" variant="contained" color="primary">
                Enviar
              </Button>
            </form>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
