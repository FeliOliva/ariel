module.exports = {
  getDetalleVentaById: `
    select id, precio_monotributista from detalle_venta where ID = ?;
  `,
  updateDetalleVenta: `
    UPDATE detalle_venta 
    set precio_monotributista = ?
    WHERE ID = ?;
  `,
  getTotalVenta: ` select total from venta WHERE ID = ?;`,
  updateTotalVenta: "UPDATE venta SET total_con_descuento = ? WHERE ID = ?;",
};
