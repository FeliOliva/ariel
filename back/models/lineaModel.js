const db = require("../database");
const queriesLineas = require("../querys/queriesLineas");

const getAllLineas = async () => {
  try {
    const [rows] = await db.query(queriesLineas.getAllLineas);
    return rows;
  } catch (err) {
    throw err;
  }
};
const addLinea = async (nombre) => {
  try {
    const query = queriesLineas.addLinea;
    await db.query(query, [nombre]);
  } catch (err) {
    throw err;
  }
};
const dropLinea = async (ID) => {
  try {
    const query = queriesLineas.dropLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const upLinea = async (ID) => {
  try {
    const query = queriesLineas.upLinea;
    await db.query(query, [ID]);
  } catch (err) {
    throw err;
  }
};
const updateLinea = async (nombre, ID) => {
  try {
    const query = queriesLineas.updateLinea;
    await db.query(query, [nombre, ID]);
  } catch (err) {
    throw err;
  }
};
const getSublineasByLinea = async (lineaId) => {
  try {
    const query = queriesLineas.getSublineaByLinea;
    const [rows] = await db.query(query, [lineaId]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const getLastLinea = async () => {
  try {
    const query = queriesLineas.getLastLinea;
    const [rows] = await db.query(query);
    return rows[0];
  } catch (err) {
    throw err;
  }
};
const getLineaByID = async (ID) => {
  try {
    const query = queriesLineas.getLineaByID;
    const [rows] = await db.query(query, [ID]);
    return rows;
  } catch (err) {
    throw err;
  }
};
const guardarLineas = async (lineas) => {
  try {
    if (!lineas || !Array.isArray(lineas) || lineas.length === 0) {
      throw new Error("No se recibieron líneas válidas.");
    }

    // Desactivar SQL_SAFE_UPDATES y eliminar los registros
    await db.query("SET SQL_SAFE_UPDATES = 0;");
    await db.query("DELETE FROM lineas_stock;");
    const query = `
      INSERT INTO lineas_stock (linea_id) 
      SELECT ? 
      WHERE NOT EXISTS (
          SELECT 1 FROM lineas_stock WHERE linea_id = ?
      );
    `;

    for (const id of lineas) {
      await db.query(query, [id, id]);
    }

  } catch (error) {
    console.error("Error guardando líneas:", error);
    throw error;
  }
};
const obtenerLineasGuardadas = async () => {
  try {
    const query = "SELECT linea_id FROM lineas_stock";
    const [rows] = await db.query(query);
    return rows.map(row => row.linea_id); // Devuelve solo los IDs
  } catch (error) {
    console.error("Error obteniendo líneas guardadas:", error);
    throw error;
  }
};
const deleteLineasStock = async () => {
  try {
    await db.query("SET SQL_SAFE_UPDATES = 0;");
    await db.query("DELETE FROM lineas_stock;");
  } catch (error) {
    console.error("Error guardando líneas:", error);
    throw error;
  }
}
module.exports = {
  getAllLineas,
  addLinea,
  dropLinea,
  upLinea,
  updateLinea,
  getSublineasByLinea,
  getLastLinea,
  getLineaByID,
  guardarLineas,
  obtenerLineasGuardadas,
  deleteLineasStock
};
