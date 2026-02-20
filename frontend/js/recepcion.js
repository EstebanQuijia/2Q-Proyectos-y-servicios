// Verificar sesión
if (!localStorage.getItem('token')) window.location.href = '/';

document.addEventListener('DOMContentLoaded', cargarAlquileresActivos);

async function cargarAlquileresActivos() {
    try {
        const res = await fetch('/api/alquileres/activos');
        const alquileres = await res.json();
        const container = document.getElementById('contenedorRecepcion');
        if (!container) return;
        container.innerHTML = '';

        if (alquileres.length === 0) {
            container.innerHTML = `<div class="text-center p-5 text-muted">No hay equipos para recibir hoy.</div>`;
            return;
        }

        const agenda = alquileres.reduce((acc, alq) => {
            if (!acc[alq.fecha_fin]) acc[alq.fecha_fin] = {};
            if (!acc[alq.fecha_fin][alq.cliente_nombre]) acc[alq.fecha_fin][alq.cliente_nombre] = [];
            acc[alq.fecha_fin][alq.cliente_nombre].push(alq);
            return acc;
        }, {});

        Object.keys(agenda).sort().forEach(fecha => {
            const fechaDiv = document.createElement('div');
            fechaDiv.className = "fecha-header";
            fechaDiv.innerHTML = `<i class="bi bi-calendar3 me-2"></i> ${fecha}`;
            container.appendChild(fechaDiv);

            const clientes = agenda[fecha];
            Object.keys(clientes).forEach(nombreCli => {
                const listaEquipos = clientes[nombreCli];
                const idsParaEnviar = listaEquipos.map(e => e.alquiler_id);

                const card = document.createElement('div');
                card.className = "card cliente-card shadow-sm mb-4"; 
                card.innerHTML = `
                    <div class="card-header-custom d-flex justify-content-between align-items-center bg-white p-3 border-bottom">
                        <div>
                            <h5 class="mb-0 fw-bold text-dark" style="font-size: 1.1rem;">${nombreCli}</h5>
                            <small class="text-muted" style="font-size: 0.8rem;">${listaEquipos.length} equipos en total</small>
                        </div>
                        <button class="btn btn-success fw-bold shadow-sm" 
                                style="font-size: 0.85rem; padding: 8px 25px; width: auto !important; min-width: 150px; height: auto; border-radius: 8px; transition: 0.3s;" 
                                onmouseover="this.style.transform='scale(1.05)'"
                                onmouseout="this.style.transform='scale(1)'"
                                onclick="recibirTodo([${idsParaEnviar}])">
                             <i class="bi bi-check2-all me-2"></i> RECIBIR KIT
                        </button>
                    </div>
                    <div class="card-body p-0">
                        ${listaEquipos.map(e => `
                            <div class="equipo-row d-flex justify-content-between align-items-center p-2 px-3 border-bottom" style="background: #fafafa;">
                                <div class="d-flex align-items-center" style="gap: 40px;">
                                    <div style="min-width: 150px;">
                                        <span class="text-muted d-block" style="font-size: 0.65rem; text-transform: uppercase;">Equipo</span>
                                        <span class="fw-medium" style="font-size: 0.85rem;">${e.equipo_nombre}</span>
                                    </div>
                                    <div>
                                        <span class="text-muted d-block" style="font-size: 0.65rem; text-transform: uppercase;">Serie</span>
                                        <span class="badge bg-light text-dark border fw-normal" style="font-family: monospace; font-size: 0.8rem; padding: 2px 6px;">${e.numero_serie}</span>
                                    </div>
                                </div>
                                <button class="btn btn-outline-secondary fw-bold" 
                                        style="font-size: 0.65rem; padding: 2px 10px; width: auto !important; height: 24px; display: inline-flex; align-items: center; justify-content: center;" 
                                        onclick="reportarDano(${e.alquiler_id}, '${e.numero_serie}')">
                                    <i class="bi bi-pencil-square me-1"></i> NOTA
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(card);
            });
        });
    } catch (e) { console.error("Error al cargar activos:", e); }
}

// RECIBIR KIT CON SWEETALERT2
async function recibirTodo(alquileresIds) {
    const result = await Swal.fire({
        title: '¿Confirmar Recepción?',
        text: `¿Deseas recibir estos ${alquileresIds.length} equipos en buen estado?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, recibir kit',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch('/api/alquileres/recibir-grupo', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ alquileresIds: alquileresIds })
            });

            if (res.ok) {
                await Swal.fire({ icon: 'success', title: 'Kit Recibido', timer: 1500, showConfirmButton: false });
                cargarAlquileresActivos(); 
            }
        } catch (e) { Swal.fire('Error', 'No se pudo conectar.', 'error'); }
    }
}

// NOTA CON SWEETALERT2
async function reportarDano(id, serie) {
    const { value: nota } = await Swal.fire({
        title: 'Reportar Novedad o Daño',
        input: 'textarea',
        inputLabel: `S/N: ${serie}`,
        inputPlaceholder: 'Escribe aquí los detalles...',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Enviar a Mantenimiento',
        cancelButtonText: 'Cerrar'
    });

    if (nota) {
        try {
            const res = await fetch(`/api/alquileres/recibir-dano/${id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ observacionesDano: nota })
            });
            if (res.ok) {
                await Swal.fire('Registrado', 'Equipo enviado a mantenimiento.', 'success');
                cargarAlquileresActivos(); 
            }
        } catch (e) { Swal.fire('Error', 'No se pudo conectar.', 'error'); }
    }
}