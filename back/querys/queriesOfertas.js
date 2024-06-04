module.exports = {
  getAllOfertas: `
      SELECT 
        o.id,
        o.nombre,
        o.estado,
        d.articulo_id,
        d.cantidad,
        d.precioOferta AS detalle_precioOferta,
        a.nombre AS articulo_nombre
      FROM 
        oferta o
      LEFT JOIN 
        detalle_oferta d ON o.id = d.oferta_id
      LEFT JOIN 
        articulo a ON d.articulo_id = a.id;`,
  addOferta: `INSERT INTO oferta (nombre) VALUES (?);`,
  addDetalleOferta: `INSERT INTO detalle_oferta (oferta_id, articulo_id, cantidad, precioOferta) VALUES (?, ?, ?, ?);`,
  dropOferta: `UPDATE oferta SET estado = 0 WHERE id = ?;`,
  upOferta: `UPDATE oferta SET estado = 1 WHERE id = ?;`,
  updateOferta: `UPDATE oferta SET nombre = ? WHERE id = ?;`,
  deleteDetallesOferta: `DELETE FROM detalle_oferta WHERE oferta_id = ?;`,
};
