const db = require("../database");

const getAllPedidos = async () => {
  try {
    const query = `SELECT 
        p.id,
        p.estado, 
        p.nro_pedido,
        p.fecha_pedido
    FROM 
        pedido p
    LEFT JOIN 
        detalle_pedido d ON p.id = d.pedido_id
    GROUP BY 
        p.id, 
        p.estado, 
        p.nro_pedido, 
        p.fecha_pedido
    ORDER BY 
        p.id DESC;`;
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    throw new Error("Error al obtener los pedidos: " + error.message);
  }
};
const getDetallePedidoById = async (id) => {
  try {
    const query = `SELECT 
    dp.id AS detalle_pedido_id,
    dp.pedido_id,
    dp.articulo_id,
    a.nombre AS nombre_articulo,
    a.mediciones,
    l.nombre AS nombre_linea,
    dp.cantidad
FROM detalle_pedido dp
INNER JOIN articulo a ON dp.articulo_id = a.id
LEFT JOIN linea l ON a.linea_id = l.id
LEFT JOIN sublinea s ON a.subLinea_id = s.id
WHERE dp.id = ?;
`;
    const [rows] = await db.query(query, [id]);
    return rows;
  } catch (error) {
    throw new Error("Error al obtener el detalle: " + error.message);
  }
};
const getPedidoById = async (pedidoId) => {
  try {
    const query = `
            SELECT 
                p.id,
                p.estado, 
                p.nro_pedido,
                p.fecha_pedido,
                d.id AS detalle_id,
                d.articulo_id,
                d.cantidad,
            FROM 
                pedido p
            LEFT JOIN 
                detalle_pedido d ON p.id = d.pedido_id
            WHERE 
                p.id = ?;
        `;
    const [result] = await db.query(query, [pedidoId]);
    return result;
  } catch (error) {
    throw new Error("Error al obtener el pedido: " + error.message);
  }
};
const addPedido = async (estado, connection = null) => {
  try {
    const conn = connection || db;
    const query = "INSERT INTO pedido (estado) VALUES (?)";
    const [result] = await conn.query(query, [estado]);
    return result.insertId;
  } catch (error) {
    throw new Error("Error al agregar el pedido: " + error.message);
  }
};

const addDetallePedido = async (
  pedidoId,
  articulo_id,
  cantidad,
  connection = null
) => {
  try {
    const conn = connection || db;
    const query = `
            INSERT INTO detalle_pedido (pedido_id, articulo_id, cantidad)
            VALUES (?, ?, ?)`;
    await conn.query(query, [pedidoId, articulo_id, cantidad]);
  } catch (error) {
    throw new Error("Error al agregar detalle de pedido: " + error.message);
  }
};
const addDetallePedidoBatch = async (rows, connection = null) => {
  if (!rows || rows.length === 0) {
    return;
  }
  try {
    const conn = connection || db;
    const query = `
            INSERT INTO detalle_pedido (pedido_id, articulo_id, cantidad)
            VALUES ?`;
    await conn.query(query, [rows]);
  } catch (error) {
    throw new Error("Error al agregar detalle de pedido: " + error.message);
  }
};

const updateCantidadDetalle = async (detalleId, nuevaCantidad) => {
  try {
    const query = `
            UPDATE detalle_pedido 
            SET cantidad = ? 
            WHERE id = ?;
        `;
    await db.query(query, [nuevaCantidad, detalleId]);
  } catch (error) {
    throw new Error("Error al actualizar la cantidad: " + error.message);
  }
};

const dropPedido = async (id) => {
  try {
    const query = "UPDATE pedido SET estado = 0 WHERE id = ?";
    await db.query(query, [id]);
  } catch (error) {
    throw new Error("Error al eliminar el pedido: " + error.message);
  }
};
const upPedido = async (id) => {
  try {
    const query = "UPDATE pedido SET estado = 1 WHERE id = ?";
    await db.query(query, [id]);
  } catch (error) {
    throw new Error("Error al actualizar el pedido: " + error.message);
  }
};
const getDetallesPedido = async (id) => {
  try {
    const query = `SELECT 
    dp.id AS detalle_pedido_id,
    dp.pedido_id,
    dp.articulo_id,
    a.nombre AS nombre_articulo,
    a.codigo_producto AS cod_producto,
    a.mediciones,
    l.nombre AS nombre_linea,
    dp.cantidad
FROM detalle_pedido dp
INNER JOIN articulo a ON dp.articulo_id = a.id
LEFT JOIN linea l ON a.linea_id = l.id
LEFT JOIN sublinea s ON a.subLinea_id = s.id
WHERE dp.pedido_id = ?;
`;
    const [rows] = await db.query(query, [id]);
    return rows;
  } catch (error) {
    throw new Error(
      "Error al obtener los detalles del pedido: " + error.message
    );
  }
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  addPedido,
  addDetallePedido,
  addDetallePedidoBatch,
  updateCantidadDetalle,
  dropPedido,
  upPedido,
  getDetallesPedido,
  getDetallePedidoById,
};
