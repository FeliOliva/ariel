module.exports = {
  getAllOfertas: `
      SELECT 
    o.id,
    o.nombre,
    o.estado,
    o.fecha,
    SUM(d.cantidad * d.precioOferta) AS total_oferta,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'articulo_id', d.articulo_id,
            'articulo_nombre', a.nombre,
            'cantidad', d.cantidad,
            'detalle_precioOferta', d.precioOferta,
            'subtotal', d.cantidad * d.precioOferta
        )
    ) AS detalles_oferta
FROM 
    oferta o
LEFT JOIN 
    detalle_oferta d ON o.id = d.oferta_id
LEFT JOIN 
    articulo a ON d.articulo_id = a.id
GROUP BY 
    o.id, o.nombre, o.estado;

`,
  addOferta: `INSERT INTO oferta (nombre) VALUES (?);`,
  addDetalleOferta: `INSERT INTO detalle_oferta (oferta_id, articulo_id, cantidad, precioOferta) VALUES (?, ?, ?, ?);`,
  dropOferta: `UPDATE oferta SET estado = 0 WHERE id = ?;`,
  upOferta: `UPDATE oferta SET estado = 1 WHERE id = ?;`,
  updateOferta: `UPDATE oferta SET nombre = ? WHERE id = ?;`,
  deleteDetallesOferta: `DELETE FROM detalle_oferta WHERE oferta_id = ?;`,
  getOfertaById: `SELECT 
    o.id,
    o.nombre,
    o.estado,
    o.fecha,
    SUM(d.cantidad * d.precioOferta) AS total_oferta,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'articulo_id', d.articulo_id,
            'articulo_nombre', a.nombre,
            'cantidad', d.cantidad,
            'detalle_precioOferta', d.precioOferta,
            'subtotal', d.cantidad * d.precioOferta
        )
    ) AS detalles_oferta
FROM 
    oferta o
LEFT JOIN 
    detalle_oferta d ON o.id = d.oferta_id
LEFT JOIN 
    articulo a ON d.articulo_id = a.id
WHERE 
    o.id = ? -- Reemplaza con el ID de la oferta específica
GROUP BY 
    o.id, o.nombre, o.estado;
`,
};
