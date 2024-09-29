const filterModel = require("../models/filterModel");

const filterVentasByCliente = async (req, res) => {
  try {
    const { startDate, endDate, clienteId } = req.body;

    // Asegúrate de que los datos requeridos están presentes
    if (!startDate || !endDate || !clienteId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Llama al modelo para obtener los datos
    const ventas = await filterModel.getVentasByDay(
      startDate,
      endDate,
      clienteId
    );

    res.json(ventas); // Devolvemos los resultados
  } catch (error) {
    console.error("Error fetching ventas by cliente:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  filterVentasByCliente,
};
