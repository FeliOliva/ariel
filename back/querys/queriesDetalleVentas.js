module.exports = {
  getDetalleVentaById: `
    select id, precio_monotributista, cantidad from detalle_venta where ID = ?;
  `,
  updateDetalleVenta: `
    UPDATE detalle_venta 
SET precio_monotributista = ?, 
    sub_total = ?
WHERE ID = ?;

  `,
  getDetalleVenta: "select * from detalle_venta where venta_id = ?",
  getPorcentage: "select descuento from venta where ID = ?",
};
