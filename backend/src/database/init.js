const db = require('./db');
const bcrypt = require('bcryptjs');

// Crear tabla de usuarios
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

  // Tabla equipos
  db.run(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      marca TEXT,
      modelo TEXT,
      numero_serie TEXT UNIQUE,
      estado TEXT DEFAULT 'disponible',
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
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
  `, ['Administrador', 'admin@quibuild.com', contraseñaHash, 'admin'], (err) => {
    if (err) {
      console.error('Error al insertar usuario de prueba:', err.message);
    } else {
      console.log('✅ Usuario de prueba creado');
      console.log('   Correo: admin@quibuild.com');
      console.log('   Contraseña: 1234');
    }
  });
});

// Cerrar conexión después de crear todo
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    } else {
      console.log('Base de datos inicializada correctamente');
    }
  });
}, 1000);