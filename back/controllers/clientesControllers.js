const clientModels = require("../models/clienteModel");
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
    const direccionValue = direccion ?? "";

    const client = await clientModels.addClient(
      nombre,
      apellido,
      direccionValue,
      emailValue,
      telefonoValue
    );
    res
      .status(201)
      .json({ message: "Cliente agregado con exito", client: client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar el cliente" });
  }
};
const dropClient = async (req, res) => {
  try {
    const ID = req.params.ID;
    await clientModels.dropClient(ID);
    res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el cliente" });
  }
};
const upClient = async (req, res) => {
  try {
    const ID = req.params.ID;
    await clientModels.upClient(ID);
    res.status(200).json({ message: "Cliente activado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar el cliente" });
  }
};
const updateClients = async (req, res) => {
  try {
    const { nombre, apellido, direccion, email, telefono, ID } = req.body;
    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";
    const direccionValue = direccion ?? "";
    const products = await clientModels.updateClients(
      nombre,
      apellido,
      direccionValue,
      emailValue,
      telefonoValue,
      ID
    );
    res.status(200).json({ message: "Cliente actualizado correctamente" });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllClients,
  addClient,
  dropClient,
  upClient,
  updateClients,
};
