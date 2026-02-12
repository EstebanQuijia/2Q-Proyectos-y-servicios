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
                card.className = "card cliente-card shadow-sm"; 
                card.innerHTML = `
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0 fw-bold text-dark">${nombreCli}</h5>
                            <small class="text-muted">${listaEquipos.length} equipos en este kit</small>
                        </div>
                        <button class="btn btn-success btn-sm px-4 fw-bold btn-corto" onclick="recibirTodo([${idsParaEnviar}])">
                             RECIBIR KIT
                        </button>
                    </div>
                    <div class="card-body p-0">
                        ${listaEquipos.map(e => `
                            <div class="equipo-row">
                                <div class="d-flex align-items-center" style="gap: 50px;">
                                    <div style="min-width: 200px;">
                                        <span class="text-muted d-block small">Equipo</span>
                                        <span class="fw-medium">${e.equipo_nombre}</span>
                                    </div>
                                    <div>
                                        <span class="text-muted d-block small">Serie</span>
                                        <span class="badge bg-light text-dark border" style="font-family: monospace;">${e.numero_serie}</span>
                                    </div>
                                </div>
                                <button class="btn btn-report-neutral w-auto" onclick="reportarDano(${e.alquiler_id}, '${e.numero_serie}')">
                                    <i class="bi bi-pencil-square me-1"></i> Nota
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(card);
            });
        });
    } catch (e) { console.error(e); }
}

async function recibirTodo(alquileresIds) {
    if (!confirm(`¿Confirmar recepción de los equipos en buen estado?`)) return;
    try {
        const res = await fetch('/api/alquileres/recibir-grupo', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ alquileresIds: alquileresIds })
        });
        if (res.ok) { await cargarAlquileresActivos(); }
    } catch (e) { alert("Error de conexión."); }
}

async function reportarDano(id, serie) {
    const nota = prompt(`Detalle del estado del equipo (Serie: ${serie}):`);
    if (!nota) return;
    try {
        const res = await fetch(`/api/alquileres/${id}/dano`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ observacionesDano: nota })
        });
        if (res.ok) { await cargarAlquileresActivos(); }
    } catch (e) { console.error(e); }
}