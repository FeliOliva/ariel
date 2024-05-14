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

const addClient = async (nombre, apellido, direccion, email, telefono) => {
  try {
    const emailValue = email ?? "";
    const telefonoValue = telefono ?? "";

    const query = queriesClients.addClient;
    await db.query(query, [
      nombre,
      apellido,
      direccion,
      emailValue,
      telefonoValue,
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getAllClients,
  addClient,
};
