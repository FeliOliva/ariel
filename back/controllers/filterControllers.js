const filterModel = require("../models/filterModel");
const moment = require("moment");

const filterVentas = async (req, res) => {
  const { startDate, endDate, period } = req.query;

  try {
    // Verifica el período de agrupamiento y llama a la función correspondiente
    let data;
    switch (period) {
      case "day":
        data = await filterModel.getVentasByDay(startDate, endDate);
        break;
      case "month":
        data = await filterModel.getVentasByMonth(startDate, endDate);
        break;
      case "quarter":
        data = await filterModel.getVentasByQuarter(startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: "Invalid period specified" });
    }

    // Formatea las fechas en el formato DD/MM/YYYY
    const formattedData = data.map((item) => ({
      ...item,
      date: item.date ? moment(item.date).format("DD/MM/YYYY") : item.date,
      month: item.month
        ? moment(item.month, "YYYY-MM").format("MM/YYYY")
        : item.month,
      quarter: item.quarter, // Suponiendo que ya está en el formato deseado
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  filterVentas,
};
