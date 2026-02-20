// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

let configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('configAlquiler');
  window.location.href = '/';
}

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

  const { minimos, seleccionados } = configAlquiler;
  const rec = seleccionados.receptores || [];
  const col = seleccionados.colectores || [];
  const bas = seleccionados.bastones || [];
  
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
      </div>
      <div class="d-flex" style="gap: 15px;">
        <button class="btn btn-sm fw-bold" 
                style="background: white; color: #dc3545; border: 2px solid #dc3545; padding: 5px 15px;" 
                onclick="cancelarSeleccion()">
                CANCELAR
        </button>
        <button class="btn btn-sm btn-primary fw-bold" onclick="confirmarYPasar(${todoCompleto})">FINALIZAR</button>
      </div>
    </div>
  `;
  document.body.prepend(barra);
}

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
            ...(s.receptores || []).map(e => e.id),
            ...(s.colectores || []).map(e => e.id),
            ...(s.bastones || []).map(e => e.id),
            ...(s.extras || []).map(e => e.id)
        ];
    }

    for (const tipo of data) {
      const idsDeEstaTarjeta = tipo.unidades_ids ? tipo.unidades_ids.toString().split(',').map(Number) : [];
      const unidadesEnUso = idsDeEstaTarjeta.filter(id => idsSeleccionados.includes(id)).length;
      const disponiblesVisual = (tipo.disponibles || 0) - unidadesEnUso;
      
      let estiloStock = 'background: #d4edda; color: #155724;'; 
      if (disponiblesVisual <= 0) {
        estiloStock = 'background: #f8d7da; color: #721c24;'; 
      } else if (disponiblesVisual <= 2) {
        estiloStock = 'background: #fff3cd; color: #856404;'; 
      }

      let unidadesHTML = '';
      try {
          const resU = await fetch(`/api/inventario/unidades/${tipo.id}`);
          if (resU.ok) {
              const unidades = await resU.json();
              unidades.forEach(u => {
                  const yaElegido = idsSeleccionados.includes(u.id);
                  const estaDisponible = u.estado === 'disponible' && !yaElegido;
                  
                  // CORRECCIÓN: Eliminado el texto "S/N:" para una vista más limpia
                  unidadesHTML += `
                    <div class="unidad-tag" style="border-left: 4px solid ${u.estado === 'disponible' ? '#28a745' : '#dc3545'}">
                        <span class="fw-bold" style="font-size: 0.85rem;">${u.numero_serie}</span>
                        ${configAlquiler && estaDisponible ? 
                            `<button class="btn btn-success btn-sm py-0 ms-2" onclick="seleccionarEquipo(${u.id}, '${tipo.tipo}', '${u.numero_serie}')">AGREGAR</button>` : 
                            (yaElegido ? '<span class="badge bg-primary ms-2">EN LISTA</span>' : `<span class="text-muted small ms-2">${u.estado.toUpperCase()}</span>`)
                        }
                    </div>
                  `;
              });
          }
      } catch (e) { console.error("Error unidades", e); }

      const card = document.createElement('div');
      card.className = 'equipo-card';
      card.innerHTML = `
        <div class="equipo-foto">
          ${tipo.foto ? `<img src="media/equipos/${tipo.foto}" alt="${tipo.nombre}">` : '<span>Sin foto</span>'}
        </div>
        <div class="equipo-info">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 2px;">${tipo.nombre}</h3>
          <p class="text-muted small mb-1">${tipo.tipo}</p>
          <div>
            <span class="stock" style="${estiloStock} padding: 4px 10px; border-radius: 15px; font-weight: bold; font-size: 0.8rem; display: inline-block;">
                ${disponiblesVisual} de ${tipo.total} disponibles
            </span>
          </div>
          <div class="unidades-container" style="margin-top:10px;">
            ${unidadesHTML || '<p class="text-muted small">Cargando unidades...</p>'}
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  } catch (error) { console.error('Error', error); }
}

function seleccionarEquipo(id, categoria, serie) {
    let config = JSON.parse(localStorage.getItem('configAlquiler'));
    if (!config) return;

    const catNorm = categoria.toLowerCase();
    const equipoData = { id: id, serie: serie };
    
    if (catNorm.includes('receptor')) config.seleccionados.receptores.push(equipoData);
    else if (catNorm.includes('colector')) config.seleccionados.colectores.push(equipoData);
    else if (catNorm.includes('bastón') || catNorm.includes('baston')) config.seleccionados.bastones.push(equipoData);
    else config.seleccionados.extras.push({ id: id, nombre: `${categoria} - ${serie}`, serie: serie });

    localStorage.setItem('configAlquiler', JSON.stringify(config));
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${serie} agregado`, showConfirmButton: false, timer: 1000 });
    cargarInventario(); 
}

function confirmarYPasar(estaCompleto) {
    if (estaCompleto) window.location.href = 'resumen-alquiler.html';
    else Swal.fire({ title: '¿Kit Incompleto?', text: "Faltan equipos. ¿Continuar?", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, continuar' }).then((r) => { if (r.isConfirmed) window.location.href = 'resumen-alquiler.html'; });
}

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

document.addEventListener('DOMContentLoaded', cargarInventario);