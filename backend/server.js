const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/database/db'); // IMPORTANTE: Importamos la conexión
const authRoutes = require('./src/routes/authRoutes');
const inventarioRoutes = require('./src/routes/inventarioRoutes');
const equiposRoutes = require('./src/routes/equiposRoutes');
const clientesRoutes = require('./src/routes/clientesRoutes');
const alquilerRoutes = require('./src/routes/alquilerRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', equiposRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', clientesRoutes);
app.use('/api', alquilerRoutes);

// Iniciar servidor
const PORT = 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
    console.log(`🔐 API disponible en: http://localhost:${PORT}/api`);

    // Verificación real de conexión a PostgreSQL
    try {
        await db.query('SELECT NOW()');
        console.log(`📊 Base de datos: PostgreSQL (Conectada con éxito)`);
    } catch (err) {
        console.error('❌ Error: No se pudo conectar a PostgreSQL. Revisa db.js o si el servicio está activo.');
        console.error('Detalle:', err.message);
    }
});