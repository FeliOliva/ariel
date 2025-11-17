const vendedoresModel = require("../models/vendedoresModel");

const getAllVendedores = async (req, res) => {
  try {
    const vendedores = await vendedoresModel.getAllVendedores();
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addVendedor = async (req, res) => {
  try {
    const { nombre } = req.body;
    await vendedoresModel.addVendedor(nombre);
    res.status(201).json({ message: "Vendedor agregado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getVendedorByID = async (req, res) => {
  try {
    const ID = req.params.ID;
    const vendedor = await vendedoresModel.getVendedorByID(ID);
    res.json(vendedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropVendedor = async (req, res) => {
  try {
    const ID = req.params.ID;
    await vendedoresModel.dropVendedor(ID);
    res.status(200).json({ message: "Vendedor Eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al desactivar el Vendedor" });
  }
};
const updateVendedor = async (req, res) => {
  try {
    const { nombre, ID } = req.body;
    const vendedor = await vendedoresModel.updateVendedor(nombre, ID);
    res.status(200).json({ message: "Vendedor actualizado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el Vendedor" });
  }
};

const getPagosPorVendedor = async (req, res) => {
  try {
    const { vendedor_id, fecha_inicio, fecha_fin } = req.query;

    if (!vendedor_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error:
          "Los parámetros vendedor_id, fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const pagos = await vendedoresModel.getPagosPorVendedor(
      vendedor_id,
      fecha_inicio,
      fecha_fin
    );

    if (!pagos || pagos.length === 0) {
      return res.json([]);
    }
    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener los pagos por vendedor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getAllVendedores,
  addVendedor,
  getVendedorByID,
  dropVendedor,
  updateVendedor,
  getPagosPorVendedor,
};
