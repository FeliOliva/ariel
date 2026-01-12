const db = require("../database");
const queriesCierreCuenta = require("../querys/queriesCierreCuenta");

// Obtener cierre de cuenta por cliente y fecha de corte
const getCierreCuentaByCliente = async (cliente_id, fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.getCierreCuentaByCliente, [
      cliente_id,
      fecha_corte,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("Error en getCierreCuentaByCliente:", err);
    throw err;
  }
};

// Obtener todos los cierres de un cliente
const getAllCierresByCliente = async (cliente_id) => {
  try {
    const [rows] = await db.query(
      queriesCierreCuenta.getAllCierresByCliente,
      [cliente_id]
    );
    return rows;
  } catch (err) {
    console.error("Error en getAllCierresByCliente:", err);
    throw err;
  }
};

// Agregar o actualizar cierre de cuenta
const addCierreCuenta = async (cliente_id, saldo_cierre, fecha_corte, observaciones = null) => {
  try {
    const [result] = await db.query(queriesCierreCuenta.addCierreCuenta, [
      cliente_id,
      saldo_cierre,
      fecha_corte,
      observaciones,
    ]);
    return result;
  } catch (err) {
    console.error("Error en addCierreCuenta:", err);
    throw err;
  }
};

// Actualizar cierre de cuenta existente
const updateCierreCuenta = async (id, saldo_cierre, observaciones) => {
  try {
    const [result] = await db.query(queriesCierreCuenta.updateCierreCuenta, [
      saldo_cierre,
      observaciones,
      id,
    ]);
    return result;
  } catch (err) {
    console.error("Error en updateCierreCuenta:", err);
    throw err;
  }
};

// Eliminar cierre de cuenta
const deleteCierreCuenta = async (id) => {
  try {
    const [result] = await db.query(queriesCierreCuenta.deleteCierreCuenta, [id]);
    return result;
  } catch (err) {
    console.error("Error en deleteCierreCuenta:", err);
    throw err;
  }
};

// Obtener todos los últimos cierres por fecha de corte
const getAllUltimosCierres = async (fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.getAllUltimosCierres, [
      fecha_corte,
    ]);
    return rows;
  } catch (err) {
    console.error("Error en getAllUltimosCierres:", err);
    throw err;
  }
};

// Obtener cierres por zona
const getCierresByZona = async (fecha_corte, zona_id) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.getCierresByZona, [
      fecha_corte,
      zona_id,
    ]);
    return rows;
  } catch (err) {
    console.error("Error en getCierresByZona:", err);
    throw err;
  }
};

// Verificar si existe un cierre
const existeCierre = async (cliente_id, fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.existeCierre, [
      cliente_id,
      fecha_corte,
    ]);
    return rows[0].count > 0;
  } catch (err) {
    console.error("Error en existeCierre:", err);
    throw err;
  }
};

// Obtener saldo de todos los clientes para cierre masivo
const getSaldosTodosClientes = async (fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.getSaldosTodosClientes, [
      fecha_corte,
      fecha_corte,
      fecha_corte,
    ]);
    return rows;
  } catch (err) {
    console.error("Error en getSaldosTodosClientes:", err);
    throw err;
  }
};

// Cierre masivo de todas las cuentas
const cierreMasivo = async (fecha_corte, observaciones = null) => {
  try {
    // Obtener saldos de todos los clientes
    const saldos = await getSaldosTodosClientes(fecha_corte);
    
    let insertados = 0;
    let actualizados = 0;
    const resultados = [];

    for (const cliente of saldos) {
      // Solo guardar si el saldo no es 0 o si queremos guardar todos
      const result = await addCierreCuenta(
        cliente.cliente_id,
        cliente.saldo,
        fecha_corte,
        observaciones
      );
      
      if (result.insertId) {
        insertados++;
      } else {
        actualizados++;
      }

      resultados.push({
        cliente_id: cliente.cliente_id,
        farmacia: cliente.farmacia,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        saldo: cliente.saldo,
      });
    }

    return {
      total: saldos.length,
      insertados,
      actualizados,
      resultados,
    };
  } catch (err) {
    console.error("Error en cierreMasivo:", err);
    throw err;
  }
};

// Contar cierres por fecha
const contarCierresPorFecha = async (fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.contarCierresPorFecha, [
      fecha_corte,
    ]);
    return rows[0].count;
  } catch (err) {
    console.error("Error en contarCierresPorFecha:", err);
    throw err;
  }
};

// Obtener el saldo total del cierre masivo
const getSaldoTotalCierreMasivo = async (fecha_corte) => {
  try {
    const [rows] = await db.query(queriesCierreCuenta.getSaldoTotalCierreMasivo, [
      fecha_corte,
    ]);
    return rows[0].saldo_total || 0;
  } catch (err) {
    console.error("Error en getSaldoTotalCierreMasivo:", err);
    throw err;
  }
};

// Recalcular y actualizar el cierre de cuenta de un cliente específico
const recalcularCierreCliente = async (cliente_id, fecha_corte) => {
  try {
    // Verificar si existe un cierre para este cliente y fecha
    const existe = await existeCierre(cliente_id, fecha_corte);
    
    if (!existe) {
      // Si no existe cierre, no hay nada que recalcular
      return { actualizado: false, mensaje: "No existe cierre de cuenta para este cliente y fecha" };
    }

    // Recalcular el saldo actual del cliente
    const [rows] = await db.query(queriesCierreCuenta.recalcularSaldoCliente, [
      fecha_corte,
      fecha_corte,
      fecha_corte,
      cliente_id,
    ]);

    if (rows.length === 0) {
      throw new Error("Cliente no encontrado");
    }

    const nuevoSaldo = rows[0].saldo || 0;

    // Actualizar el cierre de cuenta con el nuevo saldo
    const [result] = await db.query(queriesCierreCuenta.addCierreCuenta, [
      cliente_id,
      nuevoSaldo,
      fecha_corte,
      `Recalculado automáticamente - ${new Date().toISOString()}`,
    ]);

    return {
      actualizado: true,
      cliente_id,
      saldo_anterior: null, // Podríamos obtenerlo antes de actualizar si es necesario
      saldo_nuevo: nuevoSaldo,
      fecha_corte,
    };
  } catch (err) {
    console.error("Error en recalcularCierreCliente:", err);
    throw err;
  }
};

module.exports = {
  getCierreCuentaByCliente,
  getAllCierresByCliente,
  getCierresByZona,
  addCierreCuenta,
  updateCierreCuenta,
  deleteCierreCuenta,
  getAllUltimosCierres,
  existeCierre,
  getSaldosTodosClientes,
  cierreMasivo,
  contarCierresPorFecha,
  getSaldoTotalCierreMasivo,
  recalcularCierreCliente,
};

