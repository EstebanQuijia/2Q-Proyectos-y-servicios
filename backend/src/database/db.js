// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Ruta de la base de datos
// const dbPath = path.join(__dirname, 'inventario.db');

// // Crear conexión
// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error('Error al conectar con la base de datos:', err.message);
//   } else {
//     console.log('Conectado a la base de datos SQLite');
//   }
// });

// module.exports = db;

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',      
  host: 'localhost',
  database: 'topografia_db',
  password: '12345', // Asegúrate que sea tu clave real
  port: 5432,
});

pool.on('connect', () => {
  console.log('Conectado exitosamente a PostgreSQL');
});

module.exports = {
  // Exportamos el pool para que .connect() funcione en el controlador
  pool: pool, 
  query: (text, params, callback) => pool.query(text, params, callback),
  all: (text, params, callback) => pool.query(text, params, (err, res) => callback(err, res ? res.rows : [])),
  get: (text, params, callback) => pool.query(text, params, (err, res) => callback(err, res ? res.rows[0] : null)),
  run: (text, params, callback) => pool.query(text, params, callback),
  serialize: (callback) => callback()
};