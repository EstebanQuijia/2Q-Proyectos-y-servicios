function cargarNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin = usuario && usuario.rol === 'admin';

  // Eliminamos cualquier navbar previa para evitar duplicados
  const navbarPrevia = document.querySelector('.navbar');
  if (navbarPrevia) navbarPrevia.remove();

  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center" href="inicio.html">
          <img src="media/equipos/logo.png" alt="2Q" height="45" class="me-2">
          <span class="fw-bold">2Q Proyectos y Servicios</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="inicio.html" id="nav-inicio">Inicio</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="inventario.html" id="nav-inventario">Inventario</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="recepcion.html" id="nav-recepcion">Recepción</a>
            </li>
            <li class="nav-item"> 
              <a class="nav-link" href="clientes.html" id="nav-clientes">Clientes</a>
            </li>

            ${esAdmin ? `
              <li class="nav-item">
                <a class="nav-link" href="gestion-equipos.html" id="nav-gestion">Gestionar Equipos</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="administracion.html" id="nav-admin">Administración</a>
              </li>
            ` : ''}
            <li class="nav-item">
              <a class="nav-link" href="combos.html" id="nav-combos">Nuevo Alquiler</a>
            </li>
            <li class="nav-item">
              <button class="btn btn-danger ms-3" onclick="cerrarSesion()">Cerrar Sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;

// Insertar navbar al inicio del body
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  // Marcar la página activa
  const pagina = window.location.pathname.split('/').pop();
  
  // Usamos el operador ?. para evitar errores si el elemento no existe en la vista del encargado
  if (pagina.includes('inicio')) {
    document.getElementById('nav-inicio')?.classList.add('active');
  } else if (pagina.includes('inventario')) {
    document.getElementById('nav-inventario')?.classList.add('active');
  } else if (pagina.includes('recepcion')) {
    document.getElementById('nav-recepcion')?.classList.add('active');
  } else if (pagina.includes('clientes')) {
    document.getElementById('nav-clientes')?.classList.add('active');
  } else if (pagina.includes('administracion')) {
    document.getElementById('nav-admin')?.classList.add('active');
  } else if (pagina.includes('gestion')) {
    document.getElementById('nav-gestion')?.classList.add('active');
  } else if (pagina.includes('combos')) {
    document.getElementById('nav-combos')?.classList.add('active');
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('carritoAlquiler');
  localStorage.removeItem('configAlquiler');
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', cargarNavbar);