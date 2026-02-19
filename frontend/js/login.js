// ==========================================================
// Archivo: js/login.js
// Propósito: Maneja la autenticación con alertas modernas de SweetAlert2.
// ==========================================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contraseña = document.getElementById('contraseña').value;

  // Mostramos una alerta de "Cargando" sutil
  Swal.fire({
    title: 'Autenticando...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // Alerta de éxito unificada con tu marca
      Swal.fire({
        icon: 'success',
        title: '¡Acceso Concedido!',
        text: 'Bienvenido al sistema de 2Q Proyectos y Servicios.',
        showConfirmButton: false,
        timer: 1500,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      });
      
      // Redireccionar
      setTimeout(() => {
        window.location.href = 'inicio.html';
      }, 1500);

    } else {
      // Error de credenciales (Usuario o contraseña incorrectos)
      Swal.fire({
        icon: 'error',
        title: 'Fallo en el Ingreso',
        text: data.mensaje || 'Credenciales incorrectas. Por favor, verifica tus datos.',
        confirmButtonColor: '#0056b3', // Tu azul industrial
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      });
    }
  } catch (error) {
    // Error crítico de servidor o conexión
    Swal.fire({
      icon: 'warning',
      title: 'Error de Conexión',
      text: 'No se pudo contactar con el servidor. Verifica que el backend esté activo.',
      confirmButtonColor: '#dc3545', // Rojo técnico
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    });
  }
});