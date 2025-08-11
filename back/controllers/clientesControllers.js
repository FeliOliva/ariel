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
    const {
      farmacia = "", // Valores por defecto para evitar undefined
      nombre = "",
      apellido = "",
      direccion = "",
      email = "",
      telefono = "",
      cuil = "",
      zona_id,
      tipo_cliente,
      localidad = "",
      instagram = "",
    } = req.body;
    const direccionValue = direccion ? direccion.toUpperCase() : "";
    const cuilValue = cuil ? cuil.toUpperCase() : "";
    const localidadValue = localidad ? localidad.toUpperCase() : "";
    const instagramValue = instagram ? instagram.toUpperCase() : "";
    const nombreMayus = nombre ? nombre.toUpperCase() : "";
    const apellidoMayus = apellido ? apellido.toUpperCase() : "";
    const farmaciaMayus = farmacia ? farmacia.toUpperCase() : "";

    const client = await clientModels.addClient(
      farmaciaMayus,
      nombreMayus,
      apellidoMayus,
      direccionValue,
      email, // Email y teléfono no necesitan toUpperCase()
      telefono,
      cuilValue,
      zona_id,
      tipo_cliente,
      localidadValue,
      instagramValue
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
    const {
      farmacia,
      nombre,
      apellido,
      direccion,
      email,
      telefono,
      cuil,
      zona_id,
      tipo_cliente,
      localidad,
      instagram,
      ID,
    } = req.body;

    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";
    const direccionValue = direccion ?? "";
    const cuilValue = cuil ?? "";
    const localidadValue = localidad ?? "";

    await clientModels.updateClients(
      farmacia,
      nombre,
      apellido,
      direccionValue,
      emailValue,
      telefonoValue,
      cuilValue,
      zona_id,
      tipo_cliente,
      localidadValue,
      instagram,
      ID
    );

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getClientsByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const client = await clientModels.getClientsByID(ID);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClientesByZona = async (req, res) => {
  try {
    const ID = req.params.ID;
    const clients = await clientModels.getClientesByZona(ID);
    res.json(clients);
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
  getClientsByID,
  getClientesByZona,
};
