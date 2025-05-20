const estadisticasModel = require("../models/estadisticasModel");

const getMasVendidos = async (req, res) => {
  try {
    const { filtro, id } = req.query; // filtro = 'linea', 'sublinea', 'proveedor'
    const data = await estadisticasModel.getMasVendidos(filtro, id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMasRentables = async (req, res) => {
  try {
    const data = await estadisticasModel.getMasRentables();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getComparativaVentas = async (req, res) => {
  try {
    const { filtro } = req.query; // filtro = 'linea', 'sublinea', 'proveedor'
    const data = await estadisticasModel.getComparativaVentas(filtro);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getArticulosSinVentas = async (req, res) => {
  try {
    const data = await estadisticasModel.getArticulosSinVentas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEvolucionVentas = async (req, res) => {
  try {
    const data = await estadisticasModel.getEvolucionVentas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMasUnidadesVendidas = async (req, res) => {
  try {
    const data = await estadisticasModel.getMasUnidadesVendidas();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPrecioPromedioVenta = async (req, res) => {
  try {
    const data = await estadisticasModel.getPrecioPromedioVenta();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMasVendidos,
  getMasRentables,
  getComparativaVentas,
  getArticulosSinVentas,
  getEvolucionVentas,
  getMasUnidadesVendidas,
  getPrecioPromedioVenta,
};
