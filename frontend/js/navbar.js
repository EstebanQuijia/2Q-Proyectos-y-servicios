// Cargar navbar en todas las páginas
function cargarNavbar() {
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
              <a class="nav-link" href="gestion-equipos.html" id="nav-gestion">Gestionar Equipos</a>
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
  if (pagina.includes('inicio')) {
    document.getElementById('nav-inicio').classList.add('active');
  } else if (pagina.includes('inventario')) {
    document.getElementById('nav-inventario').classList.add('active');
  } else if (pagina.includes('gestion')) {
    document.getElementById('nav-gestion').classList.add('active');
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}

// Cargar navbar cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarNavbar);