const filterModel = require("../models/filterModel");

const filterVentasByCliente = async (req, res) => {
  try {
    const { startDate, endDate, clienteId } = req.body;

    if (!startDate || !endDate || !clienteId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const ventas = await filterModel.getVentasByDay(
      startDate,
      endDate,
      clienteId
    );

    res.json(ventas);
  } catch (error) {
    console.error("Error fetching ventas by cliente:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const filterComprasByFecha = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const compras = await filterModel.filterComprasByFecha(startDate, endDate);
    res.json(compras);
  } catch (error) {
    console.error("Error fetching compras by fecha:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const totalVentas = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const ventas = await filterModel.getTotalVentas(startDate, endDate);
    res.json(ventas);
  } catch (error) {
    console.error("Error fetching total ventas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const totalGastos = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const gastos = await filterModel.getTotalGastos(startDate, endDate);
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
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const pagos = await filterModel.getTotalPagos(startDate, endDate);
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
  totalClientes,
  filterComprasByFecha,
};
