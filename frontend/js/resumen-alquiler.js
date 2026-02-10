// Verificar sesión
if (!localStorage.getItem('token')) window.location.href = '/';

const config = JSON.parse(localStorage.getItem('configAlquiler'));

document.addEventListener('DOMContentLoaded', () => {
    if (!config) {
        alert("No hay una configuración de alquiler activa.");
        window.location.href = 'combos.html';
        return;
    }
    // Seteamos la fecha de inicio que viene del plan
    if(document.getElementById('fechaInicio')) {
        document.getElementById('fechaInicio').value = config.fechaInicio;
    }
    renderizarEquipos();
    buscarClientes(); 
});

// RENDERIZAR EQUIPOS CON FORMATO DE ACTA (Basado en Excel de 2Q)
async function renderizarEquipos() {
    const container = document.getElementById('listaEquiposResumen');
    if (!container) return;
    container.innerHTML = '';

    const s = config.seleccionados;

    const categorias = {
        receptores: "RECEPTOR GNSS MARCA 2Q DE DOBLE FRECUENCIA",
        colectores: "COLECTOR CON SURPAD 4.2 (Incluye 1 power bank y 1 cable usb tipo C)",
        bastones: "BASTON DE 4.5M",
        tripodes: "SOPORTE DE COLECTOR"
    };

    // 1. Renderizar Equipos Base del Plan
    Object.keys(categorias).forEach(cat => {
        if (s[cat] && s[cat].length > 0) {
            s[cat].forEach(id => {
                const item = document.createElement('div');
                item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-primary';
                item.innerHTML = `
                    <span><strong>1</strong> ${categorias[cat]} (ID #${id})</span>
                    <span class="text-muted small">Incluido</span>
                `;
                container.appendChild(item);
            });
        }
    });

    // 2. Renderizar Extras
    if (s.extras && s.extras.length > 0) {
        s.extras.forEach(extra => {
            const item = document.createElement('div');
            item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-info';
            const nombreFormateado = extra.tipoNombre.toUpperCase();

            item.innerHTML = `
                <span>
                    <span class="badge bg-info text-dark me-2">EXTRA</span>
                    <strong>1</strong> ${nombreFormateado} (Serie: ${extra.numeroSerie})
                </span>
            `;
            container.appendChild(item);
        });
    }

    if (container.innerHTML === '') {
        container.innerHTML = '<p class="text-center text-muted">No hay equipos seleccionados.</p>';
    }
}

// BUSCAR CLIENTES EN LA API
async function buscarClientes() {
    const busquedaInput = document.getElementById('buscarCliente');
    const busqueda = busquedaInput ? busquedaInput.value : '';
    
    try {
        const res = await fetch(`/api/clientes?busqueda=${busqueda}`);
        const clientes = await res.json();
        const select = document.getElementById('selectCliente');
        if (!select) return;
        
        select.innerHTML = '';

        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.nombre} (${c.cedula})`;
            // Evento para seleccionar
            option.addEventListener('click', () => seleccionarCliente(c));
            select.appendChild(option);
        });
    } catch (e) { console.error("Error buscando clientes", e); }
}

function seleccionarCliente(c) {
    document.getElementById('infoClienteSeleccionado').style.display = 'block';
    document.getElementById('nombreCli').textContent = c.nombre;
    document.getElementById('cedulaCli').textContent = c.cedula;
    config.clienteId = c.id;
    config.clienteNombre = c.nombre; // Guardamos para el acta
}

// PROCESAR TODO EL ALQUILER (CONEXIÓN REAL AL BACKEND)
async function procesarAlquiler() {
    if (!config.clienteId) return alert("Por favor, selecciona un cliente.");

    const fechaFin = document.getElementById('fechaFin').value;
    if (!fechaFin) return alert("Selecciona la fecha de finalización.");

    // Recolectamos todos los IDs de equipos seleccionados
    const s = config.seleccionados;
    const equiposIds = [
        ...(s.receptores || []),
        ...(s.colectores || []),
        ...(s.bastones || []),
        ...(s.tripodes || []),
        ...(s.otros || []),
        ...(s.extras || []).map(e => e.id)
    ];

    const datosAlquiler = {
        clienteId: config.clienteId,
        equiposIds: equiposIds,
        fechaInicio: config.fechaInicio,
        fechaFin: fechaFin,
        observaciones: `Plan: ${config.nombrePlan}`
    };

    try {
        const res = await fetch('/api/alquileres', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datosAlquiler)
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ " + data.mensaje);
            // Limpiar selección y volver
            localStorage.removeItem('configAlquiler');
            window.location.href = 'inicio.html';
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error al procesar alquiler:", error);
        alert("Error de conexión con el servidor.");
    }
}