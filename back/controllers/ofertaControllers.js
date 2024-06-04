const ofertaModel = require("../models/ofertaModel");

const getAllOfertas = async (req, res) => {
  try {
    const ofertas = await ofertaModel.getAllOfertas();
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addOferta = async (req, res) => {
  try {
    const { nombre, detalles } = req.body;
    const ofertaId = await ofertaModel.addOferta(nombre, detalles);
    res.status(201).json({ message: "Oferta agregada con éxito", ofertaId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar la oferta" });
  }
};

const dropOferta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ofertaModel.dropOferta(ID);
    res.status(200).json({ message: "Oferta eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la oferta" });
  }
};

const upOferta = async (req, res) => {
  try {
    const ID = req.params.ID;
    await ofertaModel.upOferta(ID);
    res.status(200).json({ message: "Oferta activada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar la oferta" });
  }
};

const updateOferta = async (req, res) => {
  try {
    const { nombre, detalles, ID } = req.body;
    await ofertaModel.updateOferta(nombre, detalles, ID);
    res.status(200).json({ message: "Oferta actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllOfertas,
  addOferta,
  dropOferta,
  upOferta,
  updateOferta,
};
