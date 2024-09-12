module.exports = {
  getAllOfertas: `
       SELECT 
      o.id,
      o.nombre,
      o.estado,
      o.fecha,
      SUM(d.cantidad * d.precioOferta) AS total_oferta
      FROM 
        oferta o
      LEFT JOIN 
        detalle_oferta d ON o.id = d.oferta_id
      GROUP BY 
        o.id, o.nombre, o.estado, o.fecha;
    `,
  addOferta: `INSERT INTO oferta (nombre) VALUES (?);`,
  addDetalleOferta: `INSERT INTO detalle_oferta (oferta_id, articulo_id, cantidad, precioOferta) VALUES (?, ?, ?, ?);`,
  dropOferta: `UPDATE oferta SET estado = 0 WHERE id = ?;`,
  upOferta: `UPDATE oferta SET estado = 1 WHERE id = ?;`,
  updateOferta: `UPDATE oferta SET nombre = ? WHERE id = ?;`,
  updateCantidadDetalleOferta: `UPDATE detalle_oferta SET cantidad = ? WHERE articulo_id = ? AND oferta_id = ?;`,
  getOfertaById: `
      SELECT 
        o.nombre,
        o.id,
        o.estado,
        o.fecha,
        a.id AS articulo_id,
        a.nombre AS nombre_articulo,
        a.codigo_producto AS cod_articulo,
        d.cantidad,
        d.precioOferta,
        (d.cantidad * d.precioOferta) AS subtotal,
        (SELECT SUM(d1.cantidad * d1.precioOferta)
         FROM detalle_oferta d1 
         WHERE d1.oferta_id = o.id) AS total_oferta
      FROM 
        oferta o
      INNER JOIN 
        detalle_oferta d ON o.id = d.oferta_id
      INNER JOIN 
        articulo a ON d.articulo_id = a.id
      WHERE 
        o.id = ?;
    `,
};
