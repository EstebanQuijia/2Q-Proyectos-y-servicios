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

// 2. RENDERIZAR BARRA DE PROGRESO SUPERIOR (LÓGICA FLEXIBLE)
function renderizarBarraProgreso() {
  configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));
  if (!configAlquiler) return;

  const barraExistente = document.getElementById('barra-progreso-alquiler');
  if (barraExistente) barraExistente.remove();

  const barra = document.createElement('div');
  barra.id = 'barra-progreso-alquiler';
  barra.className = 'sticky-top bg-dark text-white p-2 shadow-sm';
  barra.style.top = '0';
  barra.style.zIndex = '1050';
  barra.style.fontSize = '0.85rem';

  const { minimos, seleccionados } = configAlquiler;
  const rec = seleccionados.receptores || [];
  const col = seleccionados.colectores || [];
  const bas = seleccionados.bastones || [];
  const ext = seleccionados.extras || [];

  // Verificamos cumplimiento de mínimos
  const listoReceptores = rec.length >= minimos.receptores;
  const listoColectores = col.length >= minimos.colectores;
  const listoBastones = bas.length >= minimos.bastones;
  
  // Variable para el popup de advertencia
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
      <div>
        <button class="btn btn-outline-light btn-sm me-2" style="font-size: 0.75rem" onclick="cancelarSeleccion()">CANCELAR</button>
        <button class="btn btn-success fw-bold btn-sm" 
                style="font-size: 0.75rem"
                onclick="confirmarYPasar(${todoCompleto})">
          FINALIZAR SELECCIÓN
        </button>
      </div>
    </div>
  `;
  document.body.prepend(barra);
}

/**
 * LÓGICA DE VALIDACIÓN ANTES DE PASAR AL RESUMEN
 * Si el kit está incompleto, lanza el mensaje de advertencia.
 */
function confirmarYPasar(estaCompleto) {
    if (estaCompleto) {
        irAResumen();
    } else {
        // Mensaje de advertencia consistente con el estilo de administracion.js
        const mensaje = "⚠️ EL KIT DE ALQUILER ESTÁ INCOMPLETO.\n\n¿Estás seguro de que deseas continuar hacia el resumen de todas formas?";
        if (confirm(mensaje)) {
            irAResumen();
        }
    }
}

// 3. CARGAR INVENTARIO CON DESCUENTO Y COLORES
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
            ...(s.tripodes || []), // Incluir trípodes en el descuento visual
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

      // --- ASIGNACIÓN DE COLORES DINÁMICOS ---
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

      card.innerHTML = `
        <div class="equipo-foto">
          ${tipo.foto ? `<img src="media/equipos/${tipo.foto}" alt="${tipo.nombre}">` : '<span>Sin foto</span>'}
        </div>
        <div class="equipo-info">
          <h3>${tipo.nombre}</h3>
          <p><strong>Tipo:</strong> ${tipo.tipo}</p>
          <p class="text-muted small mb-2">${tipo.descripcion || 'Sin descripción'}</p>
          
          <span class="stock" style="background-color: ${colorFondo} !important; color: ${colorTexto} !important; padding: 4px 12px; border-radius: 15px; font-weight: bold; display: inline-block; font-size: 0.85rem;">
            ${disponiblesVisual} de ${tipo.total || 0} disponibles
          </span>
          
          <br>
          <button class="btn btn-primary btn-small w-100 mt-3" onclick="verUnidades(${tipo.id})">Ver Unidades</button>
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

function cancelarSeleccion() {
  if (confirm('¿Deseas cancelar la selección y volver a los planes?')) {
    localStorage.removeItem('configAlquiler');
    window.location.href = 'combos.html';
  }
}

function irAResumen() {
  window.location.href = 'resumen-alquiler.html';
}

document.addEventListener('DOMContentLoaded', cargarInventario);