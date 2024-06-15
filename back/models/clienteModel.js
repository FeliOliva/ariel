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
  nombre,
  apellido,
  direccion,
  email,
  telefono,
  cuil,
  zona_id,
  es_responsable_inscripto
) => {
  try {
    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";
    const direccionValue = direccion ?? "";
    const cuilValue = cuil ?? null;

    const query = queriesClients.addClient;
    await db.query(query, [
      nombre,
      apellido,
      direccionValue,
      emailValue,
      telefonoValue,
      cuilValue,
      zona_id,
      es_responsable_inscripto,
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
  nombre,
  apellido,
  direccion,
  email,
  telefono,
  cuil,
  zona_id,
  es_responsable_inscripto,
  ID
) => {
  try {
    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";
    const direccionValue = direccion ?? "";
    const cuilValue = cuil ?? null;

    const query = queriesClients.updateClients;

    await db.query(query, [
      nombre,
      apellido,
      direccionValue,
      emailValue,
      telefonoValue,
      cuilValue,
      zona_id,
      es_responsable_inscripto,
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
