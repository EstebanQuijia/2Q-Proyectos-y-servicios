const db = require('../database/db');

exports.registrarAlquiler = (req, res) => {
    const { clienteId, equiposIds, fechaInicio, fechaFin, observaciones } = req.body;

    if (!clienteId || !equiposIds || equiposIds.length === 0) {
        return res.status(400).json({ mensaje: 'Faltan datos para procesar el alquiler.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
            // 1. Insertar en la tabla de alquileres (uno por cada equipo para trazabilidad)
            const stmtAlquiler = db.prepare(`
                INSERT INTO alquileres (cliente_id, equipo_id, fecha_inicio, fecha_fin, estado, observaciones)
                VALUES (?, ?, ?, ?, 'activo', ?)
            `);

            // 2. Actualizar el estado del equipo individual
            const stmtEquipo = db.prepare(`UPDATE equipos SET estado = 'alquilado' WHERE id = ?`);

            equiposIds.forEach(id => {
                stmtAlquiler.run(clienteId, id, fechaInicio, fechaFin, observaciones);
                stmtEquipo.run(id);
            });

            stmtAlquiler.finalize();
            stmtEquipo.finalize();

            db.run('COMMIT', (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ mensaje: 'Error al confirmar transacción' });
                }
                
                // AQUÍ ES DONDE SE GENERA EL JSON PARA EL ACTA
                // En un paso futuro, aquí llamaríamos a la función de Power Automate
                res.json({ 
                    mensaje: 'Alquiler registrado con éxito. Stock actualizado.',
                    procesoId: Date.now() // ID temporal para el acta
                });
            });

        } catch (error) {
            db.run('ROLLBACK');
            res.status(500).json({ mensaje: 'Error interno del servidor', error });
        }
    });
};