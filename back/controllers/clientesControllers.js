const clientModels = require("../models/clienteModel");
const { get } = require("../routes/productosRoutes");

const getAllClients = async (req, res) => {
  try {
    const clients = await clientModels.getAllClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addClient = async (req, res) => {
  try {
    const { nombre, apellido, direccion, email, telefono } = req.body;
    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";

    const client = await clientModels.addClient(
      nombre,
      apellido,
      direccion,
      emailValue,
      telefonoValue
    );
    res.status(201).json({ message: "Cliente agregado con exito" }, client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el cliente" });
  }
};

module.exports = {
  getAllClients,
  addClient,
};
