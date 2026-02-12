const express = require('express');
const router = express.Router();
const alquilerController = require('../controllers/alquilerController');

router.post('/alquileres', alquilerController.registrarAlquiler);
router.get('/alquileres/activos', alquilerController.obtenerAlquileresActivos);
router.post('/alquileres/recibir-grupo', alquilerController.finalizarGrupoAlquiler);
router.patch('/alquileres/:alquilerId/dano', alquilerController.recibirConDano);

module.exports = router;