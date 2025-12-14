// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}

// Cargar inventario
async function cargarInventario() {
  try {
    const res = await fetch('/api/inventario');
    const data = await res.json();

    const grid = document.getElementById('inventarioGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
      grid.innerHTML = '<p>No hay equipos registrados en el inventario.</p>';
      return;
    }

    data.forEach(tipo => {
      const card = document.createElement('div');
      card.className = 'equipo-card';

      let stockClass = 'disponible';
      if (tipo.disponibles === 0) {
        stockClass = 'agotado';
      } else if (tipo.disponibles <= 2) {
        stockClass = 'pocos';
      }

      card.innerHTML = `
        <div class="equipo-foto">
          ${tipo.foto ? `<img src="media/equipos/${tipo.foto}" alt="${tipo.nombre}">` : '📷 Sin foto'}
        </div>
        <div class="equipo-info">
          <h3>${tipo.nombre}</h3>
          <p><strong>Tipo:</strong> ${tipo.tipo}</p>
          <p><strong>Marca:</strong> ${tipo.marca || 'N/A'}</p>
          <p>${tipo.descripcion || 'Sin descripción'}</p>
          <span class="stock ${stockClass}">
            ${tipo.disponibles} de ${tipo.total} disponibles
          </span>
          <br>
          <button class="btn btn-small" onclick="verUnidades(${tipo.id})">Ver Unidades</button>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar inventario:', error);
    alert('Error al cargar el inventario');
  }
}

// Ver unidades específicas
function verUnidades(tipoId) {
  window.location.href = `detalle-equipos.html?id=${tipoId}`;
}

// Cargar al iniciar
cargarInventario();