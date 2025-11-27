const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equiposController');

// Rutas
router.post('/tipos-equipos', equiposController.upload.single('foto'), equiposController.crearTipoEquipo);
router.get('/tipos-equipos', equiposController.obtenerTipos);
router.post('/equipos', equiposController.crearEquipo);

module.exports = router;