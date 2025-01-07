const cuentaCorrienteModel = require("../models/cuentaCorrienteModel");

const getAllCuentasCorrientesByCliente = async (req, res) => {
  try {
    const cliente_id = req.params.ID;
    const cuenta = await cuentaCorrienteModel.getAllCuentasCorrientesByCliente(
      cliente_id
    );
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const payByCuentaCorriente = async (req, res) => {
  const { monto, cliente_id, venta_id, metodo_pago, cheque_id, estado_pago, ID } = req.body;
  const total = await cuentaCorrienteModel.getTotalCuentaCorriente(ID);
  let totalCalc = total.saldo_total - monto;
  let total_restante = totalCalc;
  console.log(totalCalc);
  const payLoad = {
    cliente_id,
    cuenta_corriente_id: ID,
    venta_id,
    monto,
    metodo_pago_id: metodo_pago || null,
    total_restante,
    cheque_id,
    estado_pago,
  }
  console.log("PayLoad", payLoad)
  if (totalCalc < 0 || totalCalc === null || totalCalc === undefined || !ID) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    await cuentaCorrienteModel.updateLogPago(payLoad);
    await cuentaCorrienteModel.payByCuentaCorriente(monto, ID);
    await cuentaCorrienteModel.actualizarMetodoPago(metodo_pago, venta_id);
    await cuentaCorrienteModel.payCuentaByTotal(monto, cliente_id);
    await cuentaCorrienteModel.actualizarPagoEnVenta(venta_id, 2);
    if (totalCalc === 0) {
      await cuentaCorrienteModel.actualizarPagoEnVenta(venta_id, 1);
      await cuentaCorrienteModel.setEstadoCuentaCorriente(ID);
    }
    return res.status(200).json("Cuenta corriente pagada con exito");
  }
};
const payCuentaByTotal = async (req, res) => {
  const { monto, metodo_pago, cliente_id, cheque_id } = req.body;
  console.log("metodo de pago", metodo_pago);
  console.log("monto", monto);
  console.log("cliente", cliente_id);
  console.log("cheque", cheque_id);
  let estado_pago;
  let total_restante;
  try {
    const total = await cuentaCorrienteModel.getTotalPagoCuentaCorriente(
      cliente_id
    );
    totalCalc = total.monto_total - monto;
    if (
      totalCalc < 0 ||
      totalCalc === null ||
      totalCalc === undefined ||
      !cliente_id
    ) {
      return res
        .status(400)
        .json({ message: "El monto supera el total de la cuenta corriente" });
    } else {
      await cuentaCorrienteModel.payCuentaByTotal(monto, cliente_id);
      // 1. Obtener todas las cuentas corrientes del cliente ordenadas por saldo (de menor a mayor)
      const cuentas = await cuentaCorrienteModel.getCuentasByClienteOrdenadas(
        cliente_id
      );
      let montoRestante = parseFloat(monto);
      // 2. Iterar sobre cada cuenta corriente
      for (let cuenta of cuentas) {
        let saldo = parseFloat(cuenta.saldo_total);
        if (montoRestante <= 0) break;
        if (montoRestante >= saldo) {
          // Si el monto restante es mayor o igual al saldo, poner la cuenta en cero
          estado_pago = "CANCELADO";
          await cuentaCorrienteModel.actualizarSaldoCuentaCorriente(
            cuenta.id,
            0
          );
          const response = await cuentaCorrienteModel.getVentaId(cuenta.id);
          console.log(response.venta_id);
          montoRestante -= saldo; // Restar el saldo descontado del monto restante
          total_restante = 0;
          await cuentaCorrienteModel.actualizarPagoEnVenta(response.venta_id, 1);
          await cuentaCorrienteModel.actualizarMetodoPago(
            metodo_pago,
            response.venta_id
          );
          await cuentaCorrienteModel.setEstadoCuentaCorriente(cuenta.id);
        } else {
          const response = await cuentaCorrienteModel.getVentaId(cuenta.id);
          await cuentaCorrienteModel.actualizarPagoEnVenta(response.venta_id, 2);
          estado_pago = "PARCIAL";
          total_restante = saldo - montoRestante;
          await cuentaCorrienteModel.actualizarSaldoCuentaCorriente(
            cuenta.id,
            saldo - montoRestante
          );
          montoRestante = 0; // El monto restante se agota
        }
        const payLoad = {
          cliente_id,
          cuenta_corriente_id: cuenta.id,
          venta_id: cuenta.venta_id,
          monto,
          metodo_pago_id: metodo_pago || null,
          total_restante: total_restante,
          cheque_id,
          estado_pago,
        }
        console.log("payload", payLoad);
        await cuentaCorrienteModel.updateLogPago(payLoad);
      }
      res.status(200).json("Cuenta corriente pagada con éxito");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCuentasByCliente = async (req, res) => {
  const cliente_id = req.params.ID;
  const cuenta = await cuentaCorrienteModel.getCuentasByClienteOrdenadas(
    cliente_id
  );
  res.json(cuenta);
};
const getTotalCuentasByCliente = async (req, res) => {
  const cliente_id = req.params.ID;
  const cuenta = await cuentaCorrienteModel.getTotalPagoCuentaCorriente(
    cliente_id
  );
  res.json(cuenta);
};
module.exports = {
  getAllCuentasCorrientesByCliente,
  getCuentasByCliente,
  payByCuentaCorriente,
  payCuentaByTotal,
  getTotalCuentasByCliente,
};
