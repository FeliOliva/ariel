module.exports = {
  getAllDetalleVentas: `
    SELECT 
      dv.ID,
      v.cliente_id,
      c.nombre AS nombre_cliente,
      p.nombre AS nombre_producto,
      dv.cantidad,
      dv.precio,
      v.zona_id,
      z.zona AS nombre_zona
    FROM 
      DetalleVentas dv
    INNER JOIN 
      Ventas v ON dv.venta_id = v.ID
    INNER JOIN 
      Producto p ON dv.producto_id = p.ID
    INNER JOIN 
      Cliente c ON v.cliente_id = c.ID
    INNER JOIN 
      Zona z ON v.zona_id = z.ID;
  `,
  addDetalleVenta: `
    INSERT INTO DetalleVentas (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?);
  `,
  deleteDetalleVenta: `
    DELETE FROM DetalleVentas WHERE ID = ?;
  `,
  updateDetalleVenta: `
    UPDATE DetalleVentas 
    SET venta_id = ?, producto_id = ?, cantidad = ?, precio = ? 
    WHERE ID = ?;
  `,
};
