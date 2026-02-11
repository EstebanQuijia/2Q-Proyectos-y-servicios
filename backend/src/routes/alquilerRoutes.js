const express = require('express');
const router = express.Router();
const alquilerController = require('../controllers/alquilerController');

router.post('/alquileres', alquilerController.registrarAlquiler);

module.exports = router;