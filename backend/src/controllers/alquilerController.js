const db = require('../database/db');

// OBTENER ACTIVOS PARA LA AGENDA
exports.obtenerAlquileresActivos = (req, res) => {
    const query = `
        SELECT a.id as alquiler_id, c.nombre as cliente_nombre, e.id as equipo_id, e.numero_serie, te.nombre as equipo_nombre, a.fecha_fin
        FROM alquileres a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN equipos e ON a.equipo_id = e.id
        JOIN tipos_equipos te ON e.tipo_equipo_id = te.id
        WHERE a.estado = 'activo'
        ORDER BY a.fecha_fin ASC`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).send();
        res.json(rows);
    });
};

// RECIBIR TODO EL KIT (MASIVO) - SOLUCIÓN DEFINITIVA POR IDs
exports.finalizarGrupoAlquiler = (req, res) => {
    const { alquileresIds } = req.body;

    if (!alquileresIds || alquileresIds.length === 0) {
        return res.status(400).json({ mensaje: "No se enviaron IDs válidos" });
    }

    db.serialize(() => {
        // Primero obtenemos los IDs de los equipos para liberarlos antes de cerrar el alquiler
        const placeholders = alquileresIds.map(() => '?').join(',');
        const querySelect = `SELECT equipo_id FROM alquileres WHERE id IN (${placeholders})`;

        db.all(querySelect, alquileresIds, (err, rows) => {
            if (err) return res.status(500).json({ mensaje: "Error al identificar equipos", detalle: err.message });
            
            const eqIds = rows.map(r => r.equipo_id);

            db.run('BEGIN TRANSACTION');

            const qAlquileres = `UPDATE alquileres SET estado = 'finalizado' WHERE id IN (${placeholders})`;
            const qEquipos = `UPDATE equipos SET estado = 'disponible' WHERE id IN (${eqIds.join(',')})`;

            db.run(qAlquileres, alquileresIds, (err1) => {
                if (err1) { db.run('ROLLBACK'); return res.status(500).json({ mensaje: "Error al cerrar alquileres" }); }
                
                db.run(qEquipos, (err2) => {
                    if (err2) { db.run('ROLLBACK'); return res.status(500).json({ mensaje: "Error al liberar stock" }); }
                    
                    db.run('COMMIT', (err3) => {
                        if (err3) return res.status(500).json({ mensaje: "Error al confirmar cambios" });
                        res.json({ mensaje: "Kit recibido: equipos ahora disponibles en inventario." });
                    });
                });
            });
        });
    });
};

// REPORTAR DAÑO (INDIVIDUAL)
exports.recibirConDano = (req, res) => {
    const { alquilerId } = req.params;
    const { observacionesDano } = req.body;
    
    db.get('SELECT equipo_id FROM alquileres WHERE id = ?', [alquilerId], (err, row) => {
        if (err || !row) return res.status(404).json({ mensaje: "Alquiler no encontrado" });
        
        db.run('BEGIN TRANSACTION');
        db.run("UPDATE alquileres SET estado = 'finalizado', observaciones = ? WHERE id = ?", [`DAÑO: ${observacionesDano}`, alquilerId]);
        db.run("UPDATE equipos SET estado = 'mantenimiento' WHERE id = ?", [row.equipo_id], (err) => {
            if (err) { db.run('ROLLBACK'); return res.status(500).send(); }
            db.run('COMMIT');
            res.json({ mensaje: 'Equipo enviado a mantenimiento.' });
        });
    });
};

// REGISTRAR ALQUILER (SALIDA)
exports.registrarAlquiler = (req, res) => {
    const { clienteId, equiposIds, fechaInicio, fechaFin, observaciones } = req.body;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        try {
            const stmtAlq = db.prepare(`INSERT INTO alquileres (cliente_id, equipo_id, fecha_inicio, fecha_fin, estado, observaciones) VALUES (?, ?, ?, ?, 'activo', ?)`);
            const stmtEqui = db.prepare(`UPDATE equipos SET estado = 'alquilado' WHERE id = ?`);
            equiposIds.forEach(id => {
                stmtAlq.run(clienteId, id, fechaInicio, fechaFin, observaciones);
                stmtEqui.run(id);
            });
            stmtAlq.finalize(); stmtEqui.finalize();
            db.run('COMMIT', (err) => {
                if (err) { db.run('ROLLBACK'); return res.status(500).json({ mensaje: 'Error' }); }
                res.json({ mensaje: 'Alquiler registrado.' });
            });
        } catch (e) { db.run('ROLLBACK'); res.status(500).send(); }
    });
};