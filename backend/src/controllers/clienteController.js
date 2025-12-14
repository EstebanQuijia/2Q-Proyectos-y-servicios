const db = require('../database/db');

// Crear Cliente
exports.crearCliente = (req, res) => {
    const { nombre, cedula, telefono, correo, direccion } = req.body;

    const query = `
        INSERT INTO clientes (nombre, cedula, telefono, correo, direccion)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [nombre, cedula, telefono, correo, direccion], function(err) {
        if (err) {
            console.error('Error al crear cliente:', err);
            if (err.message.includes('UNIQUE constraint failed: clientes.cedula')) {
                return res.status(400).json({ mensaje: 'Ya existe un cliente con esa cédula.' });
            }
            return res.status(500).json({ mensaje: 'Error al guardar el cliente.' });
        }
        res.status(201).json({ mensaje: 'Cliente creado exitosamente', id: this.lastID });
    });
};

// Obtener todos los clientes (con búsqueda)
exports.obtenerClientes = (req, res) => {
    const { busqueda } = req.query; // Query param para buscar por nombre o cédula
    let query = 'SELECT * FROM clientes';
    let params = [];

    if (busqueda) {
        // Buscar si el nombre o la cédula contienen la cadena de búsqueda
        query += ' WHERE nombre LIKE ? OR cedula LIKE ?';
        params = [`%${busqueda}%`, `%${busqueda}%`];
    }
    query += ' ORDER BY nombre';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ mensaje: 'Error al obtener el listado de clientes' });
        }
        res.json(rows);
    });
};

// Actualizar Cliente
exports.actualizarCliente = (req, res) => {
    const { id } = req.params;
    const { nombre, cedula, telefono, correo, direccion } = req.body;

    const query = `
        UPDATE clientes 
        SET nombre = ?, cedula = ?, telefono = ?, correo = ?, direccion = ?
        WHERE id = ?
    `;

    db.run(query, [nombre, cedula, telefono, correo, direccion, id], function(err) {
        if (err) {
            console.error('Error al actualizar cliente:', err);
            if (err.message.includes('UNIQUE')) {
                 return res.status(400).json({ mensaje: 'Ya existe un cliente con esa cédula.' });
            }
            return res.status(500).json({ mensaje: 'Error al actualizar el cliente' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente actualizado exitosamente' });
    });
};

// Eliminar Cliente
exports.eliminarCliente = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ mensaje: 'Error al eliminar el cliente' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente eliminado exitosamente' });
    });
};