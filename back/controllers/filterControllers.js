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
const totalVentas = async (req, res) => {
  try {
    const ventas = await filterModel.getTotalVentas();
    res.json(ventas);
  } catch (error) {
    console.error("Error fetching total ventas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const totalGastos = async (req, res) => {
  try {
    const gastos = await filterModel.getTotalGastos();
    res.json(gastos);
  } catch (error) {
    console.error("Error fetching total gastos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const totalCompras = async (req, res) => {
  try {
    const compras = await filterModel.getTotalCompras();
    res.json(compras);
  } catch (error) {
    console.error("Error fetching total compras:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const totalPagos = async (req, res) => {
  try {
    const pagos = await filterModel.getTotalPagos();
    res.json(pagos);
  } catch (error) {
    console.error("Error fetching total pagos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const totalClientes = async (req, res) => {
  try {
    const clientes = await filterModel.getTotalClientes();
    res.json(clientes);
  } catch (error) {
    console.error("Error fetching total clientes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = {
  filterVentasByCliente,
  totalVentas,
  totalGastos,
  totalCompras,
  totalPagos,
  totalClientes
};
