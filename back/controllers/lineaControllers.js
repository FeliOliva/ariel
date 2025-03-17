const lineaModels = require("../models/lineaModel");

const getAllLineas = async (req, res) => {
  try {
    const linea = await lineaModels.getAllLineas();
    res.json(linea);
  } catch (error) {
    res.status(201).json({ error: error.message });
  }
};
const addLinea = async (req, res) => {
  try {
    const { nombre } = req.body;
    await lineaModels.addLinea(nombre);
    res.status(201).json({ message: "Linea agregada con exito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al agregar la linea" });
  }
};
const dropLinea = async (req, res) => {
  try {
    const ID = req.params.ID;
    await lineaModels.dropLinea(ID);
    res.status(200).json({ message: "Linea eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar la linea" });
  }
};
const upLinea = async (req, res) => {
  try {
    const ID = req.params.ID;
    await lineaModels.upLinea(ID);
    res.status(200).json({ message: "Linea activada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al activar la linea" });
  }
};
const updateLinea = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const linea = await lineaModels.updateLinea(nombre, ID);
    res.status(200).json({ message: "Linea actualizada" });
    res.json(linea);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al modificar la linea" });
  }
};
const getSubLineasByLinea = async (req, res) => {
  try {
    const { linea_id } = req.params;
    const sublineas = await lineaModels.getSublineasByLinea(linea_id);
    res.json(sublineas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getLastLinea = async (req, res) => {
  try {
    const lastLinea = await lineaModels.getLastLinea();
    res.json(lastLinea);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
const getLineaByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const linea = await lineaModels.getLineaByID(ID);
    res.json(linea[0]);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
const guardarLineas = async (req, res) => {
  try {
    const { lineas } = req.body;
    console.log("lineas", lineas)
    if (!lineas || lineas.length === 0) {
      return res.status(400).json({ error: "No se enviaron líneas válidas" });
    }
    await lineaModels.guardarLineas(lineas);
    res.json({ message: "Líneas guardadas exitosamente" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
const obtenerLineasGuardadas = async (req, res) => {
  try {
    const lineasGuardadas = await lineaModels.obtenerLineasGuardadas();
    res.json(lineasGuardadas);
  } catch (error) {
    console.error("Error obteniendo líneas guardadas:", error);
    res.status(500).send("Error del servidor");
  }
};
const deleteLineasStock = async (req, res) => {
  try {
    await lineaModels.deleteLineasStock()
    res.json("Lineas Eliminadas")
  } catch (error) {
    console.error("Error eliminando las líneas guardadas:", error);
    res.status(500).send("Error del servidor");
  }
}


module.exports = {
  getAllLineas,
  addLinea,
  dropLinea,
  upLinea,
  updateLinea,
  getSubLineasByLinea,
  getLastLinea,
  getLineaByID,
  guardarLineas,
  obtenerLineasGuardadas,
  deleteLineasStock
};
