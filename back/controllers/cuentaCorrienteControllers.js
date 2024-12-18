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
  console.log(totalCalc);
  const payLoad = {
    cliente_id,
    cuenta_corriente_id: ID,
    venta_id,
    monto,
    metodo_pago_id: metodo_pago || null,
    cheque_id,
    estado_pago,
  }
  console.log("payload", payLoad);
  if (totalCalc < 0 || totalCalc === null || totalCalc === undefined || !ID) {
    return res
      .status(400)
      .json({ message: "El monto supera el total de la cuenta corriente" });
  } else {
    await cuentaCorrienteModel.updateLogPago(payLoad);
    await cuentaCorrienteModel.payByCuentaCorriente(monto, ID);
    await cuentaCorrienteModel.actualizarMetodoPago(metodo_pago, venta_id);
    await cuentaCorrienteModel.payCuentaByTotal(monto, cliente_id);
    if (totalCalc === 0) {
      await cuentaCorrienteModel.actualizarPagoEnVenta(venta_id);
      await cuentaCorrienteModel.setEstadoCuentaCorriente(ID);
    }
    return res.status(200).json("Cuenta corriente pagada con exito");
  }
};
const payCuentaByTotal = async (req, res) => {
  const { monto, metodo_pago, cliente_id } = req.body;

  try {
    const total = await cuentaCorrienteModel.getTotalPagoCuentaCorriente(
      cliente_id
    );
    console.log("total");
    console.log(total.monto_total);
    totalCalc = total.monto_total - monto;
    console.log(totalCalc);
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
        // 3. Descontar el saldo de la cuenta corriente
        if (montoRestante >= saldo) {
          // Si el monto restante es mayor o igual al saldo, poner la cuenta en cero
          await cuentaCorrienteModel.actualizarSaldoCuentaCorriente(
            cuenta.id,
            0
          );
          const response = await cuentaCorrienteModel.getVentaId(cuenta.id);
          console.log(response.venta_id);
          montoRestante -= saldo; // Restar el saldo descontado del monto restante
          await cuentaCorrienteModel.actualizarPagoEnVenta(response.venta_id);
          await cuentaCorrienteModel.actualizarMetodoPago(
            metodo_pago,
            response.venta_id
          );
          await cuentaCorrienteModel.setEstadoCuentaCorriente(cuenta.id);
        } else {
          // Si el monto restante es menor que el saldo, solo descontar parte del saldo
          await cuentaCorrienteModel.actualizarSaldoCuentaCorriente(
            cuenta.id,
            saldo - montoRestante
          );
          montoRestante = 0; // El monto restante se agota
        }
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
