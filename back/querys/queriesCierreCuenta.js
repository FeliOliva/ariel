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
  // Obtiene todos los clientes de una zona con su saldo inicial del cierre más reciente antes de la fecha especificada
  // Si no hay cierre, devuelve 0 como saldo_inicial
  getCierresByZona: `
    SELECT
      c.id AS cliente_id,
      c.nombre,
      c.apellido,
      c.farmacia,
      c.zona_id,
      z.nombre AS zona_nombre,
      COALESCE(cc.saldo_cierre, 0) AS saldo_cierre,
      cc.fecha_corte,
      cc.id AS cierre_id,
      cc.observaciones
    FROM cliente c
    INNER JOIN zona z ON z.id = c.zona_id AND z.estado = 1
    LEFT JOIN (
      SELECT 
        cc1.id,
        cc1.cliente_id,
        cc1.saldo_cierre,
        cc1.fecha_corte,
        cc1.observaciones
      FROM cierre_cuenta cc1
      INNER JOIN (
        SELECT cliente_id, MAX(fecha_corte) AS max_fecha
        FROM cierre_cuenta
        WHERE fecha_corte <= ?
        GROUP BY cliente_id
      ) cc_max ON cc1.cliente_id = cc_max.cliente_id 
        AND cc1.fecha_corte = cc_max.max_fecha
    ) cc ON cc.cliente_id = c.id
    WHERE c.zona_id = ?
      AND c.estado = 1
    ORDER BY c.farmacia, c.nombre, c.apellido
  `,

  // Verificar si existe un cierre para un cliente y fecha de corte
  existeCierre: `
    SELECT COUNT(*) as count FROM cierre_cuenta 
    WHERE cliente_id = ? AND fecha_corte = ?
  `,

  // Obtener el saldo de todos los clientes activos para cierre masivo
  // Base: ultimo cierre anterior a la fecha_corte
  // Movimientos: ventas/pagos/NC desde ese cierre hasta fecha_corte
  getSaldosTodosClientes: `
    SELECT 
      c.id AS cliente_id,
      c.nombre,
      c.apellido,
      c.farmacia,
      z.nombre AS zona_nombre,
      COALESCE(last_cierre.saldo_cierre, 0) AS saldo_base,
      COALESCE((
        SELECT SUM(v.total_con_descuento)
        FROM venta v
        WHERE v.cliente_id = c.id
          AND v.estado = 1
          AND v.fecha_venta > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND v.fecha_venta < DATE(?)
      ), 0) AS total_ventas,
      COALESCE((
        SELECT SUM(p.monto)
        FROM pagos p
        WHERE p.cliente_id = c.id
          AND p.estado = 1
          AND p.fecha_pago > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND p.fecha_pago < DATE(?)
      ), 0) AS total_pagos,
      COALESCE((
        SELECT SUM(dnc.subTotal)
        FROM notascredito nc
        JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
        WHERE nc.cliente_id = c.id
          AND nc.estado = 1
          AND nc.fecha > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND nc.fecha < DATE(?)
      ), 0) AS total_nc,
      (COALESCE(last_cierre.saldo_cierre, 0)
        + COALESCE((
          SELECT SUM(v.total_con_descuento)
          FROM venta v
          WHERE v.cliente_id = c.id
            AND v.estado = 1
            AND v.fecha_venta > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND v.fecha_venta < DATE(?)
        ), 0)
        - COALESCE((
          SELECT SUM(p.monto)
          FROM pagos p
          WHERE p.cliente_id = c.id
            AND p.estado = 1
            AND p.fecha_pago > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND p.fecha_pago < DATE(?)
        ), 0)
        - COALESCE((
          SELECT SUM(dnc.subTotal)
          FROM notascredito nc
          JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
          WHERE nc.cliente_id = c.id
            AND nc.estado = 1
            AND nc.fecha > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND nc.fecha < DATE(?)
        ), 0)
      ) AS saldo
    FROM cliente c
    LEFT JOIN zona z ON c.zona_id = z.id
    LEFT JOIN (
      SELECT 
        cc1.id,
        cc1.cliente_id,
        cc1.saldo_cierre,
        cc1.fecha_corte
      FROM cierre_cuenta cc1
      INNER JOIN (
        SELECT cliente_id, MAX(fecha_corte) AS max_fecha
        FROM cierre_cuenta
        WHERE fecha_corte < ?
        GROUP BY cliente_id
      ) cc_max ON cc1.cliente_id = cc_max.cliente_id 
        AND cc1.fecha_corte = cc_max.max_fecha
    ) last_cierre ON last_cierre.cliente_id = c.id
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
  `,

  // Recalcular el saldo de un cliente específico para una fecha de corte
  // Base: ultimo cierre anterior a la fecha_corte
  // Movimientos: ventas/pagos/NC desde ese cierre hasta fecha_corte
  recalcularSaldoCliente: `
    SELECT 
      c.id AS cliente_id,
      COALESCE(last_cierre.saldo_cierre, 0) AS saldo_base,
      COALESCE((
        SELECT SUM(v.total_con_descuento)
        FROM venta v
        WHERE v.cliente_id = c.id
          AND v.estado = 1
          AND v.fecha_venta > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND v.fecha_venta < DATE(?)
      ), 0) AS total_ventas,
      COALESCE((
        SELECT SUM(p.monto)
        FROM pagos p
        WHERE p.cliente_id = c.id
          AND p.estado = 1
          AND p.fecha_pago > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND p.fecha_pago < DATE(?)
      ), 0) AS total_pagos,
      COALESCE((
        SELECT SUM(dnc.subTotal)
        FROM notascredito nc
        JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
        WHERE nc.cliente_id = c.id
          AND nc.estado = 1
          AND nc.fecha > COALESCE(last_cierre.fecha_corte, '1900-01-01')
          AND nc.fecha < DATE(?)
      ), 0) AS total_nc,
      (COALESCE(last_cierre.saldo_cierre, 0)
        + COALESCE((
          SELECT SUM(v.total_con_descuento)
          FROM venta v
          WHERE v.cliente_id = c.id
            AND v.estado = 1
            AND v.fecha_venta > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND v.fecha_venta < DATE(?)
        ), 0)
        - COALESCE((
          SELECT SUM(p.monto)
          FROM pagos p
          WHERE p.cliente_id = c.id
            AND p.estado = 1
            AND p.fecha_pago > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND p.fecha_pago < DATE(?)
        ), 0)
        - COALESCE((
          SELECT SUM(dnc.subTotal)
          FROM notascredito nc
          JOIN detallenotacredito dnc ON nc.id = dnc.notaCredito_id
          WHERE nc.cliente_id = c.id
            AND nc.estado = 1
            AND nc.fecha > COALESCE(last_cierre.fecha_corte, '1900-01-01')
            AND nc.fecha < DATE(?)
        ), 0)
      ) AS saldo
    FROM cliente c
    LEFT JOIN (
      SELECT 
        cc1.id,
        cc1.cliente_id,
        cc1.saldo_cierre,
        cc1.fecha_corte
      FROM cierre_cuenta cc1
      INNER JOIN (
        SELECT cliente_id, MAX(fecha_corte) AS max_fecha
        FROM cierre_cuenta
        WHERE fecha_corte < ?
        GROUP BY cliente_id
      ) cc_max ON cc1.cliente_id = cc_max.cliente_id 
        AND cc1.fecha_corte = cc_max.max_fecha
    ) last_cierre ON last_cierre.cliente_id = c.id
    WHERE c.id = ?
  `
};

