-- Indices para tablas de movimientos (venta/pagos/notascredito/cliente)
-- Compatibles con MySQL 8.0+

-- venta
CREATE INDEX idx_venta_cliente_estado_fecha
  ON venta (cliente_id, estado, fecha_venta);
CREATE INDEX idx_venta_fecha
  ON venta (fecha_venta);

-- pagos
CREATE INDEX idx_pagos_cliente_estado_fecha
  ON pagos (cliente_id, estado, fecha_pago);
CREATE INDEX idx_pagos_fecha
  ON pagos (fecha_pago);
-- Opcional: ayuda a ordenar por nro_pago dentro de cliente
CREATE INDEX idx_pagos_cliente_nropago
  ON pagos (cliente_id, nro_pago);

-- notascredito
CREATE INDEX idx_nc_cliente_estado_fecha
  ON notascredito (cliente_id, estado, fecha);

-- cliente
CREATE INDEX idx_cliente_zona_estado
  ON cliente (zona_id, estado);
-- Opcional: acelera conteos por estado
CREATE INDEX idx_cliente_estado
  ON cliente (estado);
