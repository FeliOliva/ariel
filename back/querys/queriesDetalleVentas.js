module.exports = {
  getDetalleVentaById: `
    select id, precio_monotributista from detalle_venta where ID = ?;
  `,
  updateDetalleVenta: `
    UPDATE detalle_venta 
    set precio_monotributista = ?
    WHERE ID = ?;
  `,
};
