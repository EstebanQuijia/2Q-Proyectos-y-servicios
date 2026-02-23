// const db = require('../database/db');

// // OBTENER ACTIVOS PARA LA AGENDA
// exports.obtenerAlquileresActivos = (req, res) => {
//     const query = `
//         SELECT a.id as alquiler_id, c.nombre as cliente_nombre, e.id as equipo_id, e.numero_serie, te.nombre as equipo_nombre, a.fecha_fin
//         FROM alquileres a
//         JOIN clientes c ON a.cliente_id = c.id
//         JOIN equipos e ON a.equipo_id = e.id
//         JOIN tipos_equipos te ON e.tipo_equipo_id = te.id
//         WHERE a.estado = 'activo'
//         ORDER BY a.fecha_fin ASC`;
//     db.all(query, [], (err, rows) => {
//         if (err) return res.status(500).send();
//         res.json(rows);
//     });
// };

// // RECIBIR TODO EL KIT (MASIVO)
// exports.finalizarGrupoAlquiler = (req, res) => {
//     const { alquileresIds } = req.body;

//     if (!alquileresIds || alquileresIds.length === 0) {
//         return res.status(400).json({ mensaje: "No se enviaron IDs válidos" });
//     }

//     db.serialize(() => {
//         const placeholders = alquileresIds.map(() => '?').join(',');
//         const querySelect = `SELECT equipo_id FROM alquileres WHERE id IN (${placeholders})`;

//         db.all(querySelect, alquileresIds, (err, rows) => {
//             if (err) return res.status(500).json({ mensaje: "Error al identificar equipos", detalle: err.message });
            
//             const eqIds = rows.map(r => r.equipo_id);

//             db.run('BEGIN TRANSACTION');

//             const qAlquileres = `UPDATE alquileres SET estado = 'finalizado' WHERE id IN (${placeholders})`;
//             const qEquipos = `UPDATE equipos SET estado = 'disponible' WHERE id IN (${eqIds.join(',')})`;

//             db.run(qAlquileres, alquileresIds, (err1) => {
//                 if (err1) { db.run('ROLLBACK'); return res.status(500).json({ mensaje: "Error al cerrar alquileres" }); }
                
//                 db.run(qEquipos, (err2) => {
//                     if (err2) { db.run('ROLLBACK'); return res.status(500).json({ mensaje: "Error al liberar stock" }); }
                    
//                     db.run('COMMIT', (err3) => {
//                         if (err3) return res.status(500).json({ mensaje: "Error al confirmar cambios" });
//                         res.json({ mensaje: "Kit recibido: equipos ahora disponibles en inventario." });
//                     });
//                 });
//             });
//         });
//     });
// };

// // REPORTAR DAÑO (INDIVIDUAL) - CORREGIDO PARA ASEGURAR PASO A MANTENIMIENTO
// exports.recibirConDano = (req, res) => {
//     const { alquilerId } = req.params;
//     const { observacionesDano } = req.body;
    
//     db.get('SELECT equipo_id FROM alquileres WHERE id = ?', [alquilerId], (err, row) => {
//         if (err || !row) return res.status(404).json({ mensaje: "Alquiler no encontrado" });
        
//         const equipoId = row.equipo_id;

//         db.serialize(() => {
//             db.run('BEGIN TRANSACTION');

//             // 1. Finalizar alquiler con nota de daño
//             const qAlq = "UPDATE alquileres SET estado = 'finalizado', observaciones = ? WHERE id = ?";
//             db.run(qAlq, [`DAÑO: ${observacionesDano}`, alquilerId], (err1) => {
//                 if (err1) {
//                     db.run('ROLLBACK');
//                     return res.status(500).json({ mensaje: "Error al actualizar registro de alquiler" });
//                 }

//                 // 2. Mover equipo a estado de mantenimiento
//                 const qEq = "UPDATE equipos SET estado = 'mantenimiento' WHERE id = ?";
//                 db.run(qEq, [equipoId], (err2) => {
//                     if (err2) {
//                         db.run('ROLLBACK');
//                         return res.status(500).json({ mensaje: "Error al cambiar estado del equipo" });
//                     }

//                     // 3. Confirmar transacción
//                     db.run('COMMIT', (err3) => {
//                         if (err3) return res.status(500).json({ mensaje: "Error al confirmar mantenimiento" });
//                         res.json({ mensaje: 'Equipo enviado a mantenimiento correctamente.' });
//                     });
//                 });
//             });
//         });
//     });
// };

// // REGISTRAR ALQUILER (SALIDA)
// exports.registrarAlquiler = (req, res) => {
//     const { clienteId, equiposIds, fechaInicio, fechaFin, observaciones } = req.body;

//     if (!equiposIds || !Array.isArray(equiposIds) || equiposIds.length === 0) {
//         return res.status(400).json({ mensaje: 'No se recibieron IDs de equipos válidos.' });
//     }

//     db.serialize(() => {
//         db.get('SELECT * FROM clientes WHERE id = ?', [clienteId], (err, cliente) => {
//             if (err || !cliente) return res.status(500).json({ mensaje: 'Error al obtener cliente.' });

//             const placeholders = equiposIds.map(() => '?').join(',');
//             const queryEquipos = `
//                 SELECT e.numero_serie, te.nombre, te.marca, te.modelo 
//                 FROM equipos e 
//                 JOIN tipos_equipos te ON e.tipo_equipo_id = te.id 
//                 WHERE e.id IN (${placeholders})`;

//             db.all(queryEquipos, equiposIds, (err, listaEquipos) => {
//                 if (err) return res.status(500).json({ mensaje: 'Error al obtener lista de equipos.' });

//                 db.run('BEGIN TRANSACTION');
//                 try {
//                     const stmtAlq = db.prepare(`INSERT INTO alquileres (cliente_id, equipo_id, fecha_inicio, fecha_fin, estado, observaciones) VALUES (?, ?, ?, ?, 'activo', ?)`);
//                     const stmtEqui = db.prepare(`UPDATE equipos SET estado = 'alquilado' WHERE id = ?`);
                    
//                     equiposIds.forEach(id => {
//                         stmtAlq.run(clienteId, id, fechaInicio, fechaFin, observaciones);
//                         stmtEqui.run(id);
//                     });
                    
//                     stmtAlq.finalize(); 
//                     stmtEqui.finalize();

//                     db.run('COMMIT', (errCommit) => {
//                         if (errCommit) { 
//                             db.run('ROLLBACK'); 
//                             return res.status(500).json({ mensaje: 'Error al confirmar transacción.' }); 
//                         }
                        
//                         res.json({ 
//                             mensaje: 'Alquiler registrado correctamente.',
//                             actaData: {
//                                 cliente: {
//                                     nombre: cliente.nombre,
//                                     cedula: cliente.cedula,
//                                     direccion: cliente.direccion || 'Quito - Pichincha - Ecuador',
//                                     telefono: cliente.telefono || 'S/N'
//                                 },
//                                 equipos: listaEquipos,
//                                 fecha: fechaInicio,
//                                 hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                             }
//                         });
//                     });
//                 } catch (e) { 
//                     db.run('ROLLBACK'); 
//                     res.status(500).json({ mensaje: 'Error interno en la transacción.' }); 
//                 }
//             });
//         });
//     });
// };
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
    
    // En Postgres usamos db.all que definimos en tu db.js
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error al obtener activos:", err);
            return res.status(500).send();
        }
        res.json(rows);
    });
};

// RECIBIR TODO EL KIT (MASIVO)
exports.finalizarGrupoAlquiler = async (req, res) => {
    const { alquileresIds } = req.body;

    if (!alquileresIds || alquileresIds.length === 0) {
        return res.status(400).json({ mensaje: "No se enviaron IDs válidos" });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Generamos placeholders $1, $2, etc.
        const placeholders = alquileresIds.map((_, i) => `$${i + 1}`).join(',');
        
        // 1. Obtener IDs de equipos antes de cerrar alquileres
        const querySelect = `SELECT equipo_id FROM alquileres WHERE id IN (${placeholders})`;
        const resEquipos = await client.query(querySelect, alquileresIds);
        const eqIds = resEquipos.rows.map(r => r.equipo_id);

        if (eqIds.length > 0) {
            // 2. Finalizar alquileres
            const qAlquileres = `UPDATE alquileres SET estado = 'finalizado' WHERE id IN (${placeholders})`;
            await client.query(qAlquileres, alquileresIds);

            // 3. Liberar equipos (disponibles)
            const eqPlaceholders = eqIds.map((_, i) => `$${i + 1}`).join(',');
            const qEquipos = `UPDATE equipos SET estado = 'disponible' WHERE id IN (${eqPlaceholders})`;
            await client.query(qEquipos, eqIds);
        }

        await client.query('COMMIT');
        res.json({ mensaje: "Kit recibido: equipos ahora disponibles en inventario." });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error en finalizarGrupoAlquiler:", e);
        res.status(500).json({ mensaje: "Error al procesar la recepción masiva" });
    } finally {
        client.release();
    }
};

// REPORTAR DAÑO (INDIVIDUAL)
exports.recibirConDano = async (req, res) => {
    const { alquilerId } = req.params;
    const { observacionesDano } = req.body;
    
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Buscar equipo
        const resAlq = await client.query('SELECT equipo_id FROM alquileres WHERE id = $1', [alquilerId]);
        
        if (resAlq.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ mensaje: "Alquiler no encontrado" });
        }
        
        const equipoId = resAlq.rows[0].equipo_id;

        // 2. Finalizar alquiler con nota
        await client.query(
            "UPDATE alquileres SET estado = 'finalizado', observaciones = $1 WHERE id = $2", 
            [`DAÑO: ${observacionesDano}`, alquilerId]
        );

        // 3. Mover a mantenimiento
        await client.query("UPDATE equipos SET estado = 'mantenimiento' WHERE id = $1", [equipoId]);

        await client.query('COMMIT');
        res.json({ mensaje: 'Equipo enviado a mantenimiento correctamente.' });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error en recibirConDano:", e);
        res.status(500).json({ mensaje: "Error al procesar el daño" });
    } finally {
        client.release();
    }
};

// REGISTRAR ALQUILER (SALIDA)
exports.registrarAlquiler = async (req, res) => {
    const { clienteId, equiposIds, fechaInicio, fechaFin, observaciones } = req.body;

    if (!equiposIds || !Array.isArray(equiposIds) || equiposIds.length === 0) {
        return res.status(400).json({ mensaje: 'No se recibieron IDs de equipos válidos.' });
    }

    const client = await db.pool.connect();

    try {
        // 1. Obtener datos del cliente
        const resCliente = await client.query('SELECT * FROM clientes WHERE id = $1', [clienteId]);
        if (resCliente.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Cliente no existe.' });
        }
        const cliente = resCliente.rows[0];

        // 2. Obtener datos de los equipos para el acta
        const placeholders = equiposIds.map((_, i) => `$${i + 1}`).join(',');
        const queryEquipos = `
            SELECT e.numero_serie, te.nombre, te.marca, te.modelo 
            FROM equipos e 
            JOIN tipos_equipos te ON e.tipo_equipo_id = te.id 
            WHERE e.id IN (${placeholders})`;
        
        const resLista = await client.query(queryEquipos, equiposIds);
        const listaEquipos = resLista.rows;

        // 3. Iniciar Transacción de Registro
        await client.query('BEGIN');

        for (const id of equiposIds) {
            // Insertar en alquileres
            await client.query(
                `INSERT INTO alquileres (cliente_id, equipo_id, fecha_inicio, fecha_fin, estado, observaciones) 
                 VALUES ($1, $2, $3, $4, 'activo', $5)`,
                [clienteId, id, fechaInicio, fechaFin, observaciones]
            );
            // Actualizar estado del equipo
            await client.query(`UPDATE equipos SET estado = 'alquilado' WHERE id = $1`, [id]);
        }

        await client.query('COMMIT');

        // 4. Respuesta con data para el acta
        res.json({ 
            mensaje: 'Alquiler registrado correctamente.',
            actaData: {
                cliente: {
                    nombre: cliente.nombre,
                    cedula: cliente.cedula,
                    direccion: cliente.direccion || 'Quito - Pichincha - Ecuador',
                    telefono: cliente.telefono || 'S/N'
                },
                equipos: listaEquipos,
                fecha: fechaInicio,
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error en registrarAlquiler:", e);
        res.status(500).json({ mensaje: 'Error interno al registrar alquiler.' });
    } finally {
        client.release();
    }
};