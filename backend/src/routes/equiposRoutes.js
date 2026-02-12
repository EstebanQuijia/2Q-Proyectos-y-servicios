const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

// Log para verificar que el controlador cargó todas las funciones
console.log("Funciones cargadas en equiposController:", Object.keys(equiposController));

// --- RUTAS DE ADMINISTRACIÓN ---
router.get('/equipos/todos', equiposController.obtenerTodosEquipos);
router.delete('/equipos/:id', equiposController.eliminarEquipo);
router.patch('/equipos/:id/restaurar', equiposController.restaurarEquipo);

// --- RUTAS DE TIPOS ---
router.get('/tipos-equipos/todos', equiposController.obtenerTodosTipos);
router.delete('/tipos-equipos/:id', equiposController.eliminarTipo);
router.patch('/tipos-equipos/:id/restaurar', equiposController.restaurarTipo);

// --- OPERACIONES BÁSICAS ---
router.post('/tipos-equipos', equiposController.upload.single('foto'), equiposController.crearTipoEquipo);
router.get('/tipos-equipos', equiposController.obtenerTipos);
router.post('/equipos', equiposController.crearEquipo);
router.get('/tipos-equipos/:id', equiposController.obtenerTipoPorId);
router.get('/equipos/tipo/:tipoId', equiposController.obtenerEquiposPorTipo);

// --- RUTA DE MANTENIMIENTO (CORREGIDA PARA QUITAR EL 404) ---
// Como en server.js usas app.use('/api', equiposRoutes), 
// esta ruta será: /api/equipos/:id/reparar
router.patch('/equipos/:id/reparar', equiposController.completarMantenimiento);

module.exports = router;