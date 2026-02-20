const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Ruta para obtener inventario general
router.get('/inventario', inventarioController.obtenerInventario);

// NUEVA RUTA: Para obtener las unidades (series) de un equipo específico
// Esta es la que soluciona el error 404 en la consola
router.get('/inventario/unidades/:tipoId', inventarioController.obtenerUnidadesPorTipo);

module.exports = router;