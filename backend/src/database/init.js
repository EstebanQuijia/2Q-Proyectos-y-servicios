const db = require('./db');
const bcrypt = require('bcryptjs');

// Crear tablas
db.serialize(() => {
  // Tabla usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      contraseña TEXT NOT NULL,
      rol TEXT DEFAULT 'admin',
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla usuarios:', err.message);
    } else {
      console.log('✅ Tabla usuarios creada correctamente');
    }
  });

  // Tabla tipos_equipos (NUEVA)
  db.run(`
    CREATE TABLE IF NOT EXISTS tipos_equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      marca TEXT,
      modelo TEXT,
      descripcion TEXT,
      foto TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla tipos_equipos:', err.message);
    } else {
      console.log('✅ Tabla tipos_equipos creada correctamente');
    }
  });

  // Tabla equipos (MODIFICADA)
  db.run(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_equipo_id INTEGER NOT NULL,
      numero_serie TEXT UNIQUE NOT NULL,
      estado TEXT DEFAULT 'disponible',
      observaciones TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tipo_equipo_id) REFERENCES tipos_equipos(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla equipos:', err.message);
    } else {
      console.log('✅ Tabla equipos creada correctamente');
    }
  });

  // Tabla clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT UNIQUE NOT NULL,
      telefono TEXT,
      correo TEXT,
      direccion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla clientes:', err.message);
    } else {
      console.log('✅ Tabla clientes creada correctamente');
    }
  });

  // Tabla alquileres
  db.run(`
    CREATE TABLE IF NOT EXISTS alquileres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      equipo_id INTEGER NOT NULL,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estado TEXT DEFAULT 'activo',
      observaciones TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (equipo_id) REFERENCES equipos(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla alquileres:', err.message);
    } else {
      console.log('✅ Tabla alquileres creada correctamente');
    }
  });

  // Insertar usuario de prueba
  const contraseñaHash = bcrypt.hashSync('1234', 10);
  
  db.run(`
    INSERT OR IGNORE INTO usuarios (nombre, correo, contraseña, rol)
    VALUES (?, ?, ?, ?)
  `, ['Administrador', 'admin@2q.com', contraseñaHash, 'admin'], (err) => {
    if (err) {
      console.error('Error al insertar usuario de prueba:', err.message);
    } else {
      console.log('✅ Usuario de prueba creado');
      console.log('   Correo: admin@2q.com');
      console.log('   Contraseña: 1234');
    }
  });

  // Insertar datos de ejemplo
  db.run(`
    INSERT OR IGNORE INTO tipos_equipos (id, nombre, tipo, marca, modelo, descripcion, foto)
    VALUES 
      (1, 'GPS Trimble R10', 'GPS', 'Trimble', 'R10', 'GPS de alta precisión con tecnología GNSS', 'gps_trimble.jpg'),
      (2, 'Estación Total Leica TS16', 'Estación Total', 'Leica', 'TS16', 'Estación total robótica de última generación', 'estacion_leica.jpg')
  `, (err) => {
    if (err) {
      console.log('   Tipos de equipos ya existían');
    } else {
      console.log('✅ Tipos de equipos de ejemplo creados');
    }
  });

  db.run(`
    INSERT OR IGNORE INTO equipos (tipo_equipo_id, numero_serie, estado)
    VALUES 
      (1, 'GPS-001', 'disponible'),
      (1, 'GPS-002', 'disponible'),
      (1, 'GPS-003', 'alquilado'),
      (2, 'EST-001', 'disponible')
  `, (err) => {
    if (err) {
      console.log('   Equipos ya existían');
    } else {
      console.log('✅ Equipos de ejemplo creados');
    }
  });
});

// Cerrar conexión
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    } else {
      console.log('\n🎉 Base de datos inicializada correctamente\n');
    }
  });
}, 1500);