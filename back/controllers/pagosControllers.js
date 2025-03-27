const pagosModel = require("../models/pagosModel");

const getAllPagos = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query; // Obtener las fechas del query string

  try {
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    const pagos = await pagosModel.getAllPagos(fecha_inicio, fecha_fin);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPagosByClienteId = async (req, res) => {
  try {
    const { ID: cliente_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query; // Obtener las fechas del query string

    console.log("ID desde el back:", cliente_id);
    console.log("Fecha inicio:", fecha_inicio);
    console.log("Fecha fin:", fecha_fin);

    // Validar los parámetros requeridos
    if (!cliente_id) {
      return res.status(400).json({ error: "ID de cliente no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    // Llamar al modelo con los parámetros
    const pagos = await pagosModel.getPagosByClienteId(
      cliente_id,
      fecha_inicio,
      fecha_fin
    );

    console.log("Pagos obtenidos:", pagos);

    // Manejar el caso de que no existan pagos
    if (!pagos || pagos.length === 0) {
      return res.json([]); // Devuelve un array vacío
    }

    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener pagos" });
  }
};

const addPago = async (req, res) => {
  try {
    const { nro_pago, cliente_id, monto, metodo_pago } = req.body;
    console.log("datos recibido del backend", req.body);
    await pagosModel.addPago(nro_pago, cliente_id, monto, metodo_pago);
    res.status(201).json({ message: "Pago agregado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getPagoById = async (req, res) => {
  try {
    const { ID } = req.params;
    const pago = await pagosModel.getPagoById(ID);
    res.json(pago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updatePago = async (req, res) => {
  try {
    let { monto, fecha_pago, ID } = req.body;
    await pagosModel.updatePago(monto, fecha_pago, ID);
    res.status(200).json({ message: "Pago actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPagosByZona_id = async (req, res) => {
  try {
    const { ID: zona_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query; // Obtener las fechas del query string

    console.log("ID desde el back:", zona_id);

    // Validar los parámetros requeridos
    if (!zona_id) {
      return res.status(400).json({ error: "ID de zona no proporcionado" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: "Los parámetros fecha_inicio y fecha_fin son requeridos.",
      });
    }

    // Llamar al modelo con los parámetros
    const pagos = await pagosModel.getPagosByZona_id(
      zona_id,
      fecha_inicio,
      fecha_fin
    );

    console.log("Pagos obtenidos:", pagos);

    // Manejar el caso de que no existan pagos
    if (!pagos || pagos.length === 0) {
      return res.json([]); // Devuelve un array vacío
    }

    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener pagos" });
  }
};

const upPago = async (req, res) => {
  try {
    const { id } = req.params;
    await pagosModel.upPago(id);
    res.status(200).json({ message: "Pago actualizado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const dropPago = async (req, res) => {
  try {
    const { id } = req.params;
    await pagosModel.dropPago(id);
    res.status(200).json({ message: "Pago eliminado con exito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPagos,
  addPago,
  updatePago,
  getPagosByClienteId,
  getPagosByZona_id,
  upPago,
  dropPago,
  getPagoById,
};
