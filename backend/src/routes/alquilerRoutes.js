const express = require('express');
const router = express.Router();
const alquilerController = require('../controllers/alquilerController');

// Registro de nuevos alquileres
router.post('/alquileres', alquilerController.registrarAlquiler);

// Obtener equipos pendientes de devolución
router.get('/alquileres/activos', alquilerController.obtenerAlquileresActivos);

// Recepción masiva (Kit completo)
router.post('/alquileres/recibir-grupo', alquilerController.finalizarGrupoAlquiler);

// RECEPCIÓN CON DAÑO (Individual) - CORREGIDA
// Cambiamos PATCH por POST para que coincida con el frontend y la URL para que sea más clara
router.post('/alquileres/recibir-dano/:alquilerId', alquilerController.recibirConDano);

module.exports = router;