const db = require("../database");

const getMasVendidos = async (filtro, id) => {
  const columna = {
    linea: "a.linea_id",
    sublinea: "a.subLinea_id",
    proveedor: "a.proveedor_id",
  }[filtro];

  if (!columna) throw new Error("Filtro inválido");

  const query = `
    SELECT 
      a.nombre,
      SUM(dv.cantidad) AS total_vendido,
      SUM(dv.sub_total) AS total_facturado
    FROM detalle_venta dv
    JOIN articulo a ON dv.articulo_id = a.id
    WHERE ${columna} = ?
    GROUP BY a.id
    ORDER BY total_vendido DESC
    LIMIT 10
  `;
  const [rows] = await db.query(query, [id]);
  return rows;
};

const getMasRentables = async () => {
  const query = `
    SELECT 
      a.nombre,
      SUM((dv.precio_monotributista - dv.costo) * dv.cantidad) AS ganancia_total
    FROM detalle_venta dv
    JOIN articulo a ON dv.articulo_id = a.id
    GROUP BY a.id
    ORDER BY ganancia_total DESC
    LIMIT 10
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getComparativaVentas = async (filtro) => {
  const joins = {
    linea: "JOIN linea l ON a.linea_id = l.id",
    sublinea: "JOIN sublinea l ON a.subLinea_id = l.id",
    proveedor: "JOIN proveedor l ON a.proveedor_id = l.id",
  }[filtro];

  const columna = {
    linea: "l.nombre",
    sublinea: "l.nombre",
    proveedor: "l.nombre",
  }[filtro];

  if (!joins || !columna) throw new Error("Filtro inválido");

  const query = `
    SELECT 
      ${columna} AS categoria,
      SUM(dv.sub_total) AS total
    FROM detalle_venta dv
    JOIN articulo a ON dv.articulo_id = a.id
    ${joins}
    GROUP BY l.id
    ORDER BY total DESC
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getArticulosSinVentas = async () => {
  const query = `
    SELECT 
      a.id, a.nombre
    FROM articulo a
    LEFT JOIN detalle_venta dv ON a.id = dv.articulo_id
    WHERE dv.id IS NULL
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getEvolucionVentas = async () => {
  const query = `
    SELECT 
      DATE(dv.fecha) AS fecha,
      SUM(dv.sub_total) AS total_dia
    FROM detalle_venta dv
    GROUP BY fecha
    ORDER BY fecha ASC
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getMasUnidadesVendidas = async () => {
  const query = `
    SELECT 
      a.nombre,
      SUM(dv.cantidad) AS unidades_vendidas
    FROM detalle_venta dv
    JOIN articulo a ON dv.articulo_id = a.id
    GROUP BY a.id
    ORDER BY unidades_vendidas DESC
    LIMIT 10
  `;
  const [rows] = await db.query(query);
  return rows;
};

const getPrecioPromedioVenta = async () => {
  const query = `
    SELECT 
      a.nombre,
      AVG(dv.precio_monotributista) AS precio_promedio_venta
    FROM detalle_venta dv
    JOIN articulo a ON dv.articulo_id = a.id
    GROUP BY a.id
  `;
  const [rows] = await db.query(query);
  return rows;
};

module.exports = {
  getMasVendidos,
  getMasRentables,
  getComparativaVentas,
  getArticulosSinVentas,
  getEvolucionVentas,
  getMasUnidadesVendidas,
  getPrecioPromedioVenta,
};
