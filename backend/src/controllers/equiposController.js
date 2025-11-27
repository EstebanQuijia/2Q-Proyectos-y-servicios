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

// Crear tipo de equipo
exports.crearTipoEquipo = (req, res) => {
  const { nombre, tipo, marca, modelo, descripcion } = req.body;
  const foto = req.file ? req.file.filename : null;

  const query = `
    INSERT INTO tipos_equipos (nombre, tipo, marca, modelo, descripcion, foto)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [nombre, tipo, marca, modelo, descripcion, foto], function(err) {
    if (err) {
      console.error('Error al crear tipo:', err);
      return res.status(500).json({ mensaje: 'Error al guardar el tipo de equipo' });
    }

    res.json({ 
      mensaje: 'Tipo de equipo creado exitosamente',
      id: this.lastID
    });
  });
};

// Obtener todos los tipos de equipos
exports.obtenerTipos = (req, res) => {
  db.all('SELECT * FROM tipos_equipos ORDER BY nombre', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ mensaje: 'Error al obtener tipos' });
    }
    res.json(rows);
  });
};

// Crear equipo individual
exports.crearEquipo = (req, res) => {
  const { tipo_equipo_id, numero_serie, variante, estado, observaciones } = req.body;

  const query = `
    INSERT INTO equipos (tipo_equipo_id, numero_serie, variante, estado, observaciones)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [tipo_equipo_id, numero_serie, variante, estado, observaciones], function(err) {
    if (err) {
      console.error('Error al crear equipo:', err);
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ mensaje: 'Ese número de serie ya existe' });
      }
      return res.status(500).json({ mensaje: 'Error al guardar el equipo' });
    }

    res.json({ 
      mensaje: 'Equipo creado exitosamente',
      id: this.lastID
    });
  });
};