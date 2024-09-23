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
  const { id, nombre, productos } = req.body;

  try {
    await ofertaModel.updateOferta(nombre, id);

    for (const detalle of productos) {
      await ofertaModel.updateCantidadDetalleOferta(
        detalle.cantidad,
        detalle.articulo_id,
        id
      );
    }

    res.status(200).json({ message: "Oferta actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la oferta:", error.message);
    res.status(500).json({ error: "Error al actualizar la oferta" });
  }
};

const getOfertaById = async (req, res) => {
  try {
    const oferta_id = req.params.ID;
    const oferta = await ofertaModel.getOfertaById(oferta_id);

    if (oferta.length <= 0) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    } else {
      let data = {
        nombre: oferta[0].nombre,
        id: oferta[0].id,
        productos: oferta.map((oferta) => ({
          id: oferta.articulo_id,
          nombre: oferta.nombre_articulo,
          cod: oferta.cod_articulo,
          nombre_linea: oferta.nombre_linea,
          nombre_sublinea: oferta.nombre_sublinea,
          precio: oferta.precioOferta,
          cantidad: oferta.cantidad,
        })),
      };
      res.json(data);
    }
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
  getOfertaById,
};
