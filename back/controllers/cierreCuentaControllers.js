const cierreCuentaModel = require("../models/cierreCuentaModel");

// Fecha de corte por defecto (1 de enero de 2026)
const FECHA_CORTE_DEFAULT = "2026-01-01";

// Obtener cierre de cuenta por cliente
const getCierreCuentaByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { fecha_corte } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ error: "cliente_id es requerido" });
    }

    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;
    const cierre = await cierreCuentaModel.getCierreCuentaByCliente(
      cliente_id,
      fechaCorte
    );

    res.json(cierre);
  } catch (error) {
    console.error("Error en getCierreCuentaByCliente:", error);
    res.status(500).json({ error: "Error al obtener el cierre de cuenta" });
  }
};

// Obtener todos los cierres de un cliente
const getAllCierresByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    if (!cliente_id) {
      return res.status(400).json({ error: "cliente_id es requerido" });
    }

    const cierres = await cierreCuentaModel.getAllCierresByCliente(cliente_id);
    res.json(cierres);
  } catch (error) {
    console.error("Error en getAllCierresByCliente:", error);
    res.status(500).json({ error: "Error al obtener los cierres de cuenta" });
  }
};

// Agregar o actualizar cierre de cuenta
const addCierreCuenta = async (req, res) => {
  try {
    const { cliente_id, saldo_cierre, fecha_corte, observaciones } = req.body;

    if (!cliente_id || saldo_cierre === undefined) {
      return res.status(400).json({
        error: "cliente_id y saldo_cierre son requeridos",
      });
    }

    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    const result = await cierreCuentaModel.addCierreCuenta(
      cliente_id,
      saldo_cierre,
      fechaCorte,
      observaciones
    );

    res.json({
      success: true,
      message: "Cierre de cuenta guardado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en addCierreCuenta:", error);
    res.status(500).json({ error: "Error al guardar el cierre de cuenta" });
  }
};

// Actualizar cierre de cuenta existente
const updateCierreCuenta = async (req, res) => {
  try {
    const { id, saldo_cierre, observaciones } = req.body;

    if (!id || saldo_cierre === undefined) {
      return res.status(400).json({
        error: "id y saldo_cierre son requeridos",
      });
    }

    const result = await cierreCuentaModel.updateCierreCuenta(
      id,
      saldo_cierre,
      observaciones
    );

    res.json({
      success: true,
      message: "Cierre de cuenta actualizado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en updateCierreCuenta:", error);
    res.status(500).json({ error: "Error al actualizar el cierre de cuenta" });
  }
};

// Eliminar cierre de cuenta
const deleteCierreCuenta = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id es requerido" });
    }

    const result = await cierreCuentaModel.deleteCierreCuenta(id);
    res.json({
      success: true,
      message: "Cierre de cuenta eliminado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en deleteCierreCuenta:", error);
    res.status(500).json({ error: "Error al eliminar el cierre de cuenta" });
  }
};

// Obtener todos los últimos cierres por fecha de corte
const getAllUltimosCierres = async (req, res) => {
  try {
    const { fecha_corte } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    const cierres = await cierreCuentaModel.getAllUltimosCierres(fechaCorte);
    res.json(cierres);
  } catch (error) {
    console.error("Error en getAllUltimosCierres:", error);
    res.status(500).json({ error: "Error al obtener los cierres de cuenta" });
  }
};

// Obtener cierres por zona
const getCierresByZona = async (req, res) => {
  try {
    const { fecha_corte, zona_id } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    // Convertir zona_id a número para asegurar el tipo correcto
    const zonaIdNum = parseInt(zona_id, 10);


    if (!zona_id || isNaN(zonaIdNum)) {
      return res.status(400).json({ error: "zona_id es requerido y debe ser un número válido" });
    }

    const cierres = await cierreCuentaModel.getCierresByZona(fechaCorte, zonaIdNum);
    
    if (!cierres || cierres.length === 0) {
    }
    
    // Asegurar que siempre devolvemos un array, nunca null
    res.json(cierres || []);
  } catch (error) {
    console.error("Error en getCierresByZona:", error);
    res.status(500).json({ error: "Error al obtener los cierres de cuenta por zona" });
  }
};

// Verificar si existe un cierre para un cliente
const existeCierre = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { fecha_corte } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ error: "cliente_id es requerido" });
    }

    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;
    const existe = await cierreCuentaModel.existeCierre(cliente_id, fechaCorte);

    res.json({ existe });
  } catch (error) {
    console.error("Error en existeCierre:", error);
    res.status(500).json({ error: "Error al verificar el cierre de cuenta" });
  }
};

// Obtener vista previa de saldos de todos los clientes (para mostrar antes del cierre)
const getSaldosTodosClientes = async (req, res) => {
  try {
    const { fecha_corte } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    const saldos = await cierreCuentaModel.getSaldosTodosClientes(fechaCorte);
    res.json(saldos);
  } catch (error) {
    console.error("Error en getSaldosTodosClientes:", error);
    res.status(500).json({ error: "Error al obtener los saldos de los clientes" });
  }
};

// Ejecutar cierre masivo de todas las cuentas
const ejecutarCierreMasivo = async (req, res) => {
  try {
    const { fecha_corte, observaciones } = req.body;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    // Verificar si ya existe un cierre masivo para esa fecha
    const cierresExistentes = await cierreCuentaModel.contarCierresPorFecha(fechaCorte);
    
    const resultado = await cierreCuentaModel.cierreMasivo(
      fechaCorte,
      observaciones || `Cierre masivo de cuentas`
    );

    res.json({
      success: true,
      message: cierresExistentes > 0 
        ? `Cierre masivo actualizado correctamente` 
        : `Cierre masivo ejecutado correctamente`,
      data: {
        fecha_corte: fechaCorte,
        total_clientes: resultado.total,
        nuevos: resultado.insertados,
        actualizados: resultado.actualizados,
        detalle: resultado.resultados,
      },
    });
  } catch (error) {
    console.error("Error en ejecutarCierreMasivo:", error);
    res.status(500).json({ error: "Error al ejecutar el cierre masivo" });
  }
};

// Contar cierres existentes por fecha
const contarCierresPorFecha = async (req, res) => {
  try {
    const { fecha_corte } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    const count = await cierreCuentaModel.contarCierresPorFecha(fechaCorte);
    res.json({ count, fecha_corte: fechaCorte });
  } catch (error) {
    console.error("Error en contarCierresPorFecha:", error);
    res.status(500).json({ error: "Error al contar los cierres" });
  }
};

// Obtener el saldo total del cierre masivo
const getSaldoTotalCierreMasivo = async (req, res) => {
  try {
    const { fecha_corte } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    const saldoTotal = await cierreCuentaModel.getSaldoTotalCierreMasivo(fechaCorte);
    res.json({ saldo_total: saldoTotal, fecha_corte: fechaCorte });
  } catch (error) {
    console.error("Error en getSaldoTotalCierreMasivo:", error);
    res.status(500).json({ error: "Error al obtener el saldo total del cierre masivo" });
  }
};

// Recalcular el cierre de cuenta de un cliente específico
const recalcularCierreCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { fecha_corte } = req.query;
    const fechaCorte = fecha_corte || FECHA_CORTE_DEFAULT;

    if (!cliente_id) {
      return res.status(400).json({ error: "cliente_id es requerido" });
    }

    const resultado = await cierreCuentaModel.recalcularCierreCliente(
      cliente_id,
      fechaCorte
    );

    if (!resultado.actualizado) {
      return res.status(404).json({
        success: false,
        message: resultado.mensaje,
      });
    }

    res.json({
      success: true,
      message: "Cierre de cuenta recalculado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("Error en recalcularCierreCliente:", error);
    res.status(500).json({ error: "Error al recalcular el cierre de cuenta" });
  }
};

module.exports = {
  getCierreCuentaByCliente,
  getAllCierresByCliente,
  addCierreCuenta,
  updateCierreCuenta,
  deleteCierreCuenta,
  getAllUltimosCierres,
  getCierresByZona,
  existeCierre,
  getSaldosTodosClientes,
  ejecutarCierreMasivo,
  contarCierresPorFecha,
  getSaldoTotalCierreMasivo,
  recalcularCierreCliente,
};

