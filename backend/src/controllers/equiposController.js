const db = require('../database/db');
const multer = require('multer');
const path = require('path');

// Configurar multer para guardar fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../frontend/media/equipos'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage: storage });

// --- MÉTODOS DE CREACIÓN Y OBTENCIÓN ---

exports.crearTipoEquipo = (req, res) => {
  const { nombre, tipo, marca, modelo, descripcion } = req.body;
  const foto = req.file ? req.file.filename : null;
  const query = `INSERT INTO tipos_equipos (nombre, tipo, marca, modelo, descripcion, foto) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [nombre, tipo, marca, modelo, descripcion, foto], function(err) {
    if (err) return res.status(500).json({ mensaje: 'Error al guardar el tipo' });
    res.json({ mensaje: 'Tipo de equipo creado exitosamente', id: this.lastID });
  });
};

exports.obtenerTipos = (req, res) => {
  db.all('SELECT * FROM tipos_equipos WHERE activo = 1 ORDER BY nombre', [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener tipos' });
    res.json(rows);
  });
};

exports.crearEquipo = (req, res) => {
  const { tipo_equipo_id, numero_serie, variante, estado, observaciones } = req.body;
  const query = `INSERT INTO equipos (tipo_equipo_id, numero_serie, variante, estado, observaciones) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [tipo_equipo_id, numero_serie, variante, estado, observaciones], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(400).json({ mensaje: 'Ese número de serie ya existe' });
      return res.status(500).json({ mensaje: 'Error al guardar el equipo' });
    }
    res.json({ mensaje: 'Equipo creado exitosamente', id: this.lastID });
  });
};

exports.obtenerTipoPorId = (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tipos_equipos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener tipo' });
    if (!row) return res.status(404).json({ mensaje: 'Tipo no encontrado' });
    res.json(row);
  });
};

exports.obtenerEquiposPorTipo = (req, res) => {
  const { tipoId } = req.params;
  db.all('SELECT * FROM equipos WHERE tipo_equipo_id = ? ORDER BY numero_serie', [tipoId], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener equipos' });
    res.json(rows);
  });
};

exports.obtenerTodosTipos = (req, res) => {
  db.all('SELECT * FROM tipos_equipos ORDER BY activo DESC, nombre', [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener tipos' });
    res.json(rows);
  });
};

exports.obtenerTodosEquipos = (req, res) => {
  const { tipo } = req.query;
  let query = `SELECT e.*, te.nombre as tipo_nombre FROM equipos e LEFT JOIN tipos_equipos te ON e.tipo_equipo_id = te.id`;
  let params = [];
  if (tipo) { query += ' WHERE e.tipo_equipo_id = ?'; params.push(tipo); }
  query += ' ORDER BY e.activo DESC, e.numero_serie';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener equipos' });
    res.json(rows);
  });
};

// --- MÉTODOS DE BORRADO LÓGICO Y RESTAURACIÓN ---

exports.eliminarTipo = (req, res) => {
  const { id } = req.params;
  db.get('SELECT COUNT(*) as alquilados FROM equipos WHERE tipo_equipo_id = ? AND estado = "alquilado"', [id], (err, row) => {
    if (err) return res.status(500).json({ mensaje: 'Error al verificar alquileres' });
    if (row.alquilados > 0) {
      return res.status(400).json({ mensaje: `No se puede desactivar: hay ${row.alquilados} unidad(es) alquilada(s).` });
    }
    db.serialize(() => {
      db.run('UPDATE tipos_equipos SET activo = 0 WHERE id = ?', [id]);
      db.run('UPDATE equipos SET activo = 0 WHERE tipo_equipo_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ mensaje: 'Error al desactivar unidades' });
        res.json({ mensaje: 'Tipo y sus unidades desactivados correctamente' });
      });
    });
  });
};

exports.restaurarTipo = (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run('UPDATE tipos_equipos SET activo = 1 WHERE id = ?', [id]);
    db.run('UPDATE equipos SET activo = 1 WHERE tipo_equipo_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ mensaje: 'Error al restaurar unidades' });
      res.json({ mensaje: 'Tipo y todas sus unidades restaurados correctamente' });
    });
  });
};

exports.eliminarEquipo = (req, res) => {
  const { id } = req.params;
  db.get('SELECT estado FROM equipos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ mensaje: 'Error al verificar equipo' });
    if (row && row.estado === 'alquilado') {
      return res.status(400).json({ mensaje: 'No se puede desactivar un equipo que está alquilado.' });
    }
    db.run('UPDATE equipos SET activo = 0 WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ mensaje: 'Error al desactivar equipo' });
      res.json({ mensaje: 'Equipo desactivado correctamente' });
    });
  });
};

// RESTAURAR EQUIPO: Con lógica para activar automáticamente al padre (Tipo)
exports.restaurarEquipo = (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    // 1. Primero activamos la unidad individual
    db.run('UPDATE equipos SET activo = 1 WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ mensaje: 'Error al restaurar equipo' });
      
      // 2. Automáticamente activamos el tipo de equipo (el padre) al que pertenece
      db.run(`
        UPDATE tipos_equipos 
        SET activo = 1 
        WHERE id = (SELECT tipo_equipo_id FROM equipos WHERE id = ?)
      `, [id], (err) => {
        if (err) {
          console.error("Error al activar grupo padre automáticamente:", err);
          return res.status(500).json({ mensaje: 'Equipo restaurado, pero no se pudo activar el grupo padre.' });
        }
        res.json({ mensaje: 'Equipo restaurado y grupo activado correctamente' });
      });
    });
  });
};
// Cambiar estado de mantenimiento a disponible
exports.completarMantenimiento = (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE equipos SET estado = 'disponible' WHERE id = ?";
    
    db.run(sql, [id], function(err) {
        if (err) return res.status(500).json({ mensaje: "Error al actualizar el equipo" });
        res.json({ mensaje: "Equipo reparado y disponible para alquiler." });
    });
};