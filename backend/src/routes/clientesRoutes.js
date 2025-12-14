const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas CRUD de Clientes
router.post('/clientes', clienteController.crearCliente);
router.get('/clientes', clienteController.obtenerClientes);
router.put('/clientes/:id', clienteController.actualizarCliente);
router.delete('/clientes/:id', clienteController.eliminarCliente);

module.exports = router;