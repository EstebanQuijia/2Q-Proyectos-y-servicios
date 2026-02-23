// const db = require('../database/db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Clave secreta para JWT (en producción debe estar en variables de entorno)
// const JWT_SECRET = 'mi_clave_secreta_2q_2024';

// // Controlador de login
// exports.login = (req, res) => {
//   const { correo, contraseña } = req.body;

//   // Validar que vengan los datos
//   if (!correo || !contraseña) {
//     return res.status(400).json({ 
//       mensaje: 'Por favor ingresa correo y contraseña' 
//     });
//   }

//   // Buscar usuario en la base de datos
//   db.get(
//     'SELECT * FROM usuarios WHERE correo = ?', 
//     [correo], 
//     (err, usuario) => {
//       if (err) {
//         console.error('Error en la base de datos:', err);
//         return res.status(500).json({ 
//           mensaje: 'Error en el servidor' 
//         });
//       }

//       // Verificar si el usuario existe
//       if (!usuario) {
//         return res.status(401).json({ 
//           mensaje: 'Credenciales incorrectas' 
//         });
//       }

//       // Comparar contraseñas
//       const contraseñaValida = bcrypt.compareSync(contraseña, usuario.contraseña);

//       if (!contraseñaValida) {
//         return res.status(401).json({ 
//           mensaje: 'Credenciales incorrectas' 
//         });
//       }

//       // Generar token JWT
//       const token = jwt.sign(
//         { 
//           id: usuario.id, 
//           correo: usuario.correo,
//           rol: usuario.rol 
//         }, 
//         JWT_SECRET,
//         { expiresIn: '24h' }
//       );

//       // Respuesta exitosa
//       res.json({
//         mensaje: 'Login exitoso',
//         token,
//         usuario: {
//           id: usuario.id,
//           nombre: usuario.nombre,
//           correo: usuario.correo,
//           rol: usuario.rol
//         }
//       });
//     }
//   );
// };

// // Controlador para verificar token
// exports.verificarToken = (req, res) => {
//   const token = req.headers['authorization'];

//   if (!token) {
//     return res.status(401).json({ mensaje: 'Token no proporcionado' });
//   }

//   try {
//     const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
//     res.json({ valido: true, usuario: decoded });
//   } catch (error) {
//     res.status(401).json({ valido: false, mensaje: 'Token inválido' });
//   }
// };

const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT
const JWT_SECRET = 'mi_clave_secreta_2q_2024';

// Controlador de login
exports.login = (req, res) => {
    const { correo, contraseña } = req.body;

    // DEPURACIÓN: Ver qué llega del frontend
    console.log("--- INTENTO DE LOGIN (MODO EMERGENCIA) ---");
    console.log("LOGIN -> Correo recibido:", `|${correo}|`);

    // Validar que vengan los datos
    if (!correo || !contraseña) {
        return res.status(400).json({ 
            mensaje: 'Por favor ingresa correo y contraseña' 
        });
    }

    // Buscar usuario en PostgreSQL
    db.get(
        'SELECT * FROM usuarios WHERE correo = $1', 
        [correo.trim()], 
        (err, usuario) => {
            if (err) {
                console.error('❌ Error en la base de datos:', err.message);
                return res.status(500).json({ 
                    mensaje: 'Error en el servidor' 
                });
            }

            // ¿Encontró al usuario?
            if (!usuario) {
                console.log("❌ RESULTADO: El correo NO existe en la base de datos.");
                return res.status(401).json({ 
                    mensaje: 'Credenciales incorrectas' 
                });
            }

            console.log("✅ RESULTADO: Usuario encontrado:", usuario.correo);

            // CAMBIO DE EMERGENCIA: 
            // Si la clave es '1234', permitimos el paso directamente.
            // Si no es '1234', intenta validar por el método normal de hash.
            let contraseñaValida = false;
            if (contraseña === '1234') {
                contraseñaValida = true;
                console.log("⚠️ ACCESO POR CLAVE MAESTRA (1234)");
            } else {
                contraseñaValida = bcrypt.compareSync(contraseña, usuario.contraseña);
                console.log("¿La clave coincide con el Hash en BD?:", contraseñaValida ? "SÍ" : "NO");
            }

            if (!contraseñaValida) {
                return res.status(401).json({ 
                    mensaje: 'Credenciales incorrectas' 
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    correo: usuario.correo,
                    rol: usuario.rol 
                }, 
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log("🚀 Login exitoso para:", usuario.nombre);

            // Respuesta exitosa
            res.json({
                mensaje: 'Login exitoso',
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        }
    );
};

// Controlador para verificar token
exports.verificarToken = (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        res.json({ valido: true, usuario: decoded });
    } catch (error) {
        res.status(401).json({ valido: false, mensaje: 'Token inválido' });
    }
};