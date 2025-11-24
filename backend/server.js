const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const inventarioRoutes = require('./src/routes/inventarioRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', inventarioRoutes);



// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: SQLite`);
  console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
  console.log(`🔐 API disponible en: http://localhost:${PORT}/api`);
});