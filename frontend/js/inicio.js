// Verificar si hay sesión activa
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// Mostrar nombre del usuario
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (usuario) {
  document.getElementById('nombreUsuario').textContent = `Hola, ${usuario.nombre}`;
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  // Redirigimos a la raíz (asumiendo que es la página de login)
  window.location.href = '/'; 
}