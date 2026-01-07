module.exports = {
  // Obtener el cierre de cuenta de un cliente por fecha de corte
  getCierreCuentaByCliente: `
    SELECT * FROM cierre_cuenta 
    WHERE cliente_id = ? AND fecha_corte = ?
    ORDER BY fecha_cierre DESC 
    LIMIT 1
  `,

  // Obtener todos los cierres de un cliente
  getAllCierresByCliente: `
    SELECT * FROM cierre_cuenta 
    WHERE cliente_id = ? 
    ORDER BY fecha_cierre DESC
  `,

  // Insertar un nuevo cierre de cuenta
  addCierreCuenta: `
    INSERT INTO cierre_cuenta (cliente_id, saldo_cierre, fecha_cierre, fecha_corte, observaciones) 
    VALUES (?, ?, NOW(), ?, ?)
    ON DUPLICATE KEY UPDATE 
      saldo_cierre = VALUES(saldo_cierre),
      fecha_cierre = NOW(),
      observaciones = VALUES(observaciones)
  `,

  // Actualizar un cierre existente
  updateCierreCuenta: `
    UPDATE cierre_cuenta 
    SET saldo_cierre = ?, observaciones = ?, fecha_cierre = NOW()
    WHERE id = ?
  `,

  // Eliminar un cierre de cuenta
  deleteCierreCuenta: `
    DELETE FROM cierre_cuenta WHERE id = ?
  `,

  // Obtener el último cierre de todos los clientes (para reportes)
  getAllUltimosCierres: `
    SELECT 
      cc.*,
      c.nombre,
      c.apellido,
      c.farmacia,
      c.zona_id,
      z.nombre AS zona_nombre
    FROM cierre_cuenta cc
    INNER JOIN cliente c ON cc.cliente_id = c.id
    LEFT JOIN zona z ON c.zona_id = z.id
    WHERE cc.fecha_corte = ?
    ORDER BY c.farmacia, c.nombre
  `,
  // Obtener cierres por zona
  getCierresByZona: `
    SELECT 
      cc.*,
      c.nombre,
      c.apellido,
      c.farmacia,
      c.zona_id,
      z.nombre AS zona_nombre
    FROM cierre_cuenta cc
    INNER JOIN cliente c ON cc.cliente_id = c.id
    LEFT JOIN zona z ON c.zona_id = z.id
    WHERE cc.fecha_corte = ? AND c.zona_id = ? AND c.estado = 1
    ORDER BY c.farmacia, c.nombre
  `,

  // Verificar si existe un cierre para un cliente y fecha de corte
  existeCierre: `
    SELECT COUNT(*) as count FROM cierre_cuenta 
    WHERE cliente_id = ? AND fecha_corte = ?
  `,

  // Obtener el saldo de todos los clientes activos para cierre masivo
  getSaldosTodosClientes: `
    SELECT 
      c.id AS cliente_id,
      c.nombre,
      c.apellido,
      c.farmacia,
      z.nombre AS zona_nombre,
      COALESCE(ventas.total_ventas, 0) AS total_ventas,
      COALESCE(pagos.total_pagos, 0) AS total_pagos,
      COALESCE(notas_credito.total_nc, 0) AS total_nc,
      (COALESCE(ventas.total_ventas, 0) - COALESCE(pagos.total_pagos, 0) - COALESCE(notas_credito.total_nc, 0)) AS saldo
    FROM cliente c
    LEFT JOIN zona z ON c.zona_id = z.id
    LEFT JOIN (
      SELECT cliente_id, SUM(total_con_descuento) AS total_ventas
      FROM venta
      WHERE estado = 1 AND fecha_venta < ?
      GROUP BY cliente_id
    ) AS ventas ON c.id = ventas.cliente_id
    LEFT JOIN (
      SELECT cliente_id, SUM(monto) AS total_pagos
      FROM pagos
      WHERE estado = 1 AND fecha_pago < ?
      GROUP BY cliente_id
    ) AS pagos ON c.id = pagos.cliente_id
    LEFT JOIN (
      SELECT nc.cliente_id, SUM(dnc.subTotal) AS total_nc
      FROM notascredito nc
      JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
      WHERE nc.estado = 1 AND nc.fecha < ?
      GROUP BY nc.cliente_id
    ) AS notas_credito ON c.id = notas_credito.cliente_id
    WHERE c.estado = 1
    ORDER BY c.farmacia, c.nombre
  `,

  // Contar cuántos cierres existen para una fecha de corte
  contarCierresPorFecha: `
    SELECT COUNT(*) as count FROM cierre_cuenta WHERE fecha_corte = ?
  `,

  // Obtener el saldo total del cierre masivo para una fecha de corte
  getSaldoTotalCierreMasivo: `
    SELECT COALESCE(SUM(saldo_cierre), 0) AS saldo_total
    FROM cierre_cuenta
    WHERE fecha_corte = ?
  `
};

