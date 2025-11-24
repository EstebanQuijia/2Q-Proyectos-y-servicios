const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Ruta para obtener inventario
router.get('/inventario', inventarioController.obtenerInventario);

module.exports = router;