const db = require('../database/db');

// Obtener inventario agrupado por tipos
exports.obtenerInventario = (req, res) => {
  const query = `
    SELECT 
      te.id,
      te.nombre,
      te.tipo,
      te.marca,
      te.modelo,
      te.descripcion,
      te.foto,
      COUNT(e.id) as total,
      SUM(CASE WHEN e.estado = 'disponible' THEN 1 ELSE 0 END) as disponibles
    FROM tipos_equipos te
    LEFT JOIN equipos e ON te.id = e.tipo_equipo_id
    GROUP BY te.id
    ORDER BY te.nombre
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener inventario:', err);
      return res.status(500).json({ mensaje: 'Error al obtener inventario' });
    }

    res.json(rows);
  });
};