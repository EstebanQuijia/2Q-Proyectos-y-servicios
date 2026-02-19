// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// 1. OBTENER CONFIGURACIÓN DE COMBO
let configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('configAlquiler');
  window.location.href = '/';
}

// 2. RENDERIZAR BARRA DE PROGRESO SUPERIOR
function renderizarBarraProgreso() {
  configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));
  if (!configAlquiler) return;

  const barraExistente = document.getElementById('barra-progreso-alquiler');
  if (barraExistente) barraExistente.remove();

  const barra = document.createElement('div');
  barra.id = 'barra-progreso-alquiler';
  barra.className = 'sticky-top text-white p-2 shadow-sm';
  barra.style.top = '0';
  barra.style.zIndex = '1050';
  barra.style.fontSize = '0.85rem';
  barra.style.background = '#1a252f'; 
  barra.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  const { minimos, seleccionados } = configAlquiler;
  const rec = seleccionados.receptores || [];
  const col = seleccionados.colectores || [];
  const bas = seleccionados.bastones || [];
  const ext = seleccionados.extras || [];

  const listoReceptores = rec.length >= minimos.receptores;
  const listoColectores = col.length >= minimos.colectores;
  const listoBastones = bas.length >= minimos.bastones;
  const todoCompleto = listoReceptores && listoColectores && listoBastones;

  barra.innerHTML = `
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div>
        <span class="text-warning fw-bold me-3">${configAlquiler.nombrePlan.toUpperCase()}</span>
        <span class="me-3">Receptores: <strong class="${listoReceptores ? 'text-success' : 'text-danger'}">${rec.length}/${minimos.receptores}</strong></span>
        <span class="me-3">Colectores: <strong class="${listoColectores ? 'text-success' : 'text-danger'}">${col.length}/${minimos.colectores}</strong></span>
        <span class="me-3">Bastones: <strong class="${listoBastones ? 'text-success' : 'text-danger'}">${bas.length}/${minimos.bastones}</strong></span>
        ${ext.length > 0 ? `<span class="badge bg-info text-dark ms-2"> +${ext.length} EXTRA(S)</span>` : ''}
      </div>
      
      <div class="d-flex" style="gap: 15px;">
        <button class="btn btn-sm fw-bold" 
                style="background: white; color: #dc3545; border: 2px solid #dc3545; padding: 5px 15px; font-size: 0.75rem; font-family: inherit; transition: 0.3s;" 
                onclick="cancelarSeleccion()"
                onmouseover="this.style.background='#dc3545'; this.style.color='white'"
                onmouseout="this.style.background='white'; this.style.color='#dc3545'">
          CANCELAR
        </button>

        <button class="btn btn-sm fw-bold text-white" 
                style="background: #0056b3; border: none; padding: 5px 20px; font-size: 0.75rem; font-family: inherit; transition: 0.3s;"
                onclick="confirmarYPasar(${todoCompleto})"
                onmouseover="this.style.background='#198754'; this.style.transform='scale(1.05)'"
                onmouseout="this.style.background='#0056b3'; this.style.transform='scale(1)'">
          FINALIZAR SELECCIÓN
        </button>
      </div>
    </div>
  `;
  document.body.prepend(barra);
}

// VALIDACIÓN DE KIT INCOMPLETO CON SWEETALERT2
function confirmarYPasar(estaCompleto) {
    if (estaCompleto) {
        irAResumen();
    } else {
        Swal.fire({
            title: '¿Kit Incompleto?',
            text: "Aún te faltan equipos para cumplir con el plan. ¿Deseas continuar hacia el resumen de todas formas?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0056b3',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'No, seguir eligiendo'
        }).then((result) => {
            if (result.isConfirmed) {
                irAResumen();
            }
        });
    }
}

// CARGAR INVENTARIO CON DESCUENTO Y COLORES
async function cargarInventario() {
  try {
    renderizarBarraProgreso();
    const res = await fetch('/api/inventario');
    const data = await res.json();
    const grid = document.getElementById('inventarioGrid');
    if (!grid) return;
    grid.innerHTML = '';

    let idsSeleccionados = [];
    if (configAlquiler && configAlquiler.seleccionados) {
        const s = configAlquiler.seleccionados;
        idsSeleccionados = [
            ...(s.receptores || []),
            ...(s.colectores || []),
            ...(s.bastones || []),
            ...(s.tripodes || []), 
            ...(s.otros || []),
            ...(s.extras || []).map(e => e.id)
        ];
    }

    data.forEach(tipo => {
      let unidadesEnUso = 0;
      if (tipo.unidades_ids && idsSeleccionados.length > 0) {
          const idsDeEstaTarjeta = tipo.unidades_ids.toString().split(',').map(Number);
          unidadesEnUso = idsDeEstaTarjeta.filter(id => idsSeleccionados.includes(id)).length;
      }
      
      const disponiblesVisual = (tipo.disponibles || 0) - unidadesEnUso;
      let colorFondo = "#d4edda"; 
      let colorTexto = "#155724";

      if (disponiblesVisual <= 0) {
        colorFondo = "#f8d7da"; 
        colorTexto = "#721c24";
      } else if (disponiblesVisual >= 1 && disponiblesVisual <= 2) {
        colorFondo = "#fff3cd"; 
        colorTexto = "#856404";
      }

      const card = document.createElement('div');
      card.className = 'equipo-card';
      card.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      card.innerHTML = `
        <div class="equipo-foto">
          ${tipo.foto ? `<img src="media/equipos/${tipo.foto}" alt="${tipo.nombre}">` : '<span>Sin foto</span>'}
        </div>
        <div class="equipo-info">
          <h3 style="font-size: 1.2rem; font-weight: 700;">${tipo.nombre}</h3>
          <p><strong>Tipo:</strong> ${tipo.tipo}</p>
          <p class="text-muted small mb-2">${tipo.descripcion || 'Sin descripción'}</p>
          <span class="stock" style="background-color: ${colorFondo} !important; color: ${colorTexto} !important; padding: 4px 12px; border-radius: 15px; font-weight: bold; display: inline-block; font-size: 0.85rem;">
            ${disponiblesVisual} de ${tipo.total || 0} disponibles
          </span>
          <br>
          <button class="btn btn-primary btn-small w-100 mt-3" style="font-family: inherit; background-color: #0056b3; border: none;" onclick="verUnidades(${tipo.id})">Ver Unidades</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar inventario:', error);
  }
}

function verUnidades(tipoId) {
  window.location.href = `detalle-equipos.html?id=${tipoId}`;
}

// CANCELAR CON SWEETALERT2
function cancelarSeleccion() {
    Swal.fire({
        title: '¿Cancelar Selección?',
        text: "Se perderán los equipos elegidos y volverás a la página de planes.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Mantener selección'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('configAlquiler');
            window.location.href = 'combos.html';
        }
    });
}

function irAResumen() {
  window.location.href = 'resumen-alquiler.html';
}

document.addEventListener('DOMContentLoaded', cargarInventario);