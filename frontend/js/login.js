// ==========================================================
// Archivo: js/login.js
// Propósito: Maneja la autenticación y la visualización de mensajes de estado.
// ==========================================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contraseña = document.getElementById('contraseña').value;
  const mensajeError = document.getElementById('mensajeError');

  // 1. Limpiar mensaje anterior y hacerlo visible si estaba oculto
  mensajeError.innerHTML = '';
  mensajeError.className = '';
    mensajeError.style.display = 'block'; 

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña })
    });

    const data = await res.json();

    if (data.token) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // Mostrar mensaje de éxito
      mensajeError.className = 'mensaje exito';
      mensajeError.textContent = '¡Login exitoso! Redirigiendo...';
      
      // Redireccionar después de 1 segundo
      setTimeout(() => {
        window.location.href = 'inicio.html';
      }, 1000);
    } else {
      // Mostrar error
      mensajeError.className = 'mensaje error';
      mensajeError.textContent = data.mensaje || 'Error al iniciar sesión';
    }
  } catch (error) {
    mensajeError.className = 'mensaje error';
    mensajeError.textContent = 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
  }
});