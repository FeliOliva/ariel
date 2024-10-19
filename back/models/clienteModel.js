const db = require("../database");
const queriesClients = require("../querys/queriesClients");

const getAllClients = async () => {
  try {
    const [rows] = await db.query(queriesClients.getAllClients);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addClient = async (
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
  instagram
) => {
  try {
    const query = queriesClients.addClient;
    await db.query(query, [
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
    ]);
  } catch (err) {
    throw err;
  }
};
const dropClient = async (ID) => {
  try {
    const query = queriesClients.dropClient;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upClient = async (ID) => {
  try {
    const query = queriesClients.upClient;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateClients = async (
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
) => {
  try {
    const query = queriesClients.updateClients;

    await db.query(query, [
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
      ID,
    ]);
  } catch (err) {
    throw err;
  }
};
const getClientsByID = async (ID) => {
  try {
    const query = queriesClients.getClientsByID;
    const [rows] = await db.query(query, [ID]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllClients,
  addClient,
  dropClient,
  upClient,
  updateClients,
  getClientsByID,
};
