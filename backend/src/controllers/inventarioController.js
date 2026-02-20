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
      SUM(CASE WHEN e.estado = 'disponible' AND (e.activo = 1 OR e.activo IS NULL) THEN 1 ELSE 0 END) as disponibles,
      GROUP_CONCAT(e.id) as unidades_ids
    FROM tipos_equipos te
    LEFT JOIN equipos e ON te.id = e.tipo_equipo_id
    WHERE te.activo = 1 OR te.activo IS NULL
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

/**
 * NUEVA FUNCIÓN: Obtener unidades individuales por Tipo de Equipo
 * Permite que las tarjetas del inventario muestren las series (S/N) 
 * sin necesidad de navegar a otra página.
 */
exports.obtenerUnidadesPorTipo = (req, res) => {
    const { tipoId } = req.params;

    // Consultamos la tabla 'equipos' (donde están las series) usando el ID del tipo
    const query = `
        SELECT 
            id, 
            numero_serie, 
            estado, 
            observaciones 
        FROM equipos 
        WHERE tipo_equipo_id = ? AND (activo = 1 OR activo IS NULL)
        ORDER BY estado ASC, numero_serie ASC
    `;

    db.all(query, [tipoId], (err, rows) => {
        if (err) {
            console.error('Error al obtener unidades para inventario:', err);
            return res.status(500).json({ error: 'Error al obtener las unidades de la base de datos' });
        }
        
        // Enviamos la lista de series al frontend
        res.json(rows);
    });
};