const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = 'mi_clave_secreta_quibuild_2024';

// Controlador de login
exports.login = (req, res) => {
  const { correo, contraseña } = req.body;

  // Validar que vengan los datos
  if (!correo || !contraseña) {
    return res.status(400).json({ 
      mensaje: 'Por favor ingresa correo y contraseña' 
    });
  }

  // Buscar usuario en la base de datos
  db.get(
    'SELECT * FROM usuarios WHERE correo = ?', 
    [correo], 
    (err, usuario) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ 
          mensaje: 'Error en el servidor' 
        });
      }

      // Verificar si el usuario existe
      if (!usuario) {
        return res.status(401).json({ 
          mensaje: 'Credenciales incorrectas' 
        });
      }

      // Comparar contraseñas
      const contraseñaValida = bcrypt.compareSync(contraseña, usuario.contraseña);

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