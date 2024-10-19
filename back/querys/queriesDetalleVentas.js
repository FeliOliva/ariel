module.exports = {
  getDetalleVentaById: `
    select id, precio_monotributista from detalle_venta where ID = ?;
  `,
  updateDetalleVenta: `
    UPDATE detalle_venta 
    set precio_monotributista = ?
    WHERE ID = ?;
  `,
  getDetalleVenta: 'select * from detalle_venta where venta_id = ?',
  getPorcentage: 'select descuento from venta where ID = ?'
};
