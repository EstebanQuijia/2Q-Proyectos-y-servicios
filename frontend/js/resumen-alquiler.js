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

    // Inicializar el escucha del formulario del Modal
    const formRapido = document.getElementById('formClienteRapido');
    if (formRapido) {
        formRapido.addEventListener('submit', registrarClienteRapido);
    }
});

// 1. RENDERIZAR EQUIPOS CON FORMATO DE ACTA
async function renderizarEquipos() {
    const container = document.getElementById('listaEquiposResumen');
    if (!container) return;
    container.innerHTML = '';

    const s = config.seleccionados;

    const categoriasMapeo = {
        receptores: "RECEPTOR GNSS MARCA 2Q DE DOBLE FRECUENCIA",
        colectores: "COLECTOR CON SURPAD 4.2 (Incluye 1 power bank y 1 cable usb tipo C)",
        bastones: "BASTON DE 4.5M",
        tripodes: "SOPORTE DE COLECTOR"
    };

    // Renderizar Equipos Base del Plan
    Object.keys(categoriasMapeo).forEach(cat => {
        if (s[cat] && s[cat].length > 0) {
            s[cat].forEach(equipo => {
                const item = document.createElement('div');
                item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-primary';
                item.innerHTML = `
                    <span><strong>1</strong> ${categoriasMapeo[cat]}</span>
                    <span class="badge bg-dark">Serie: ${equipo.numeroSerie}</span>
                `;
                container.appendChild(item);
            });
        }
    });

    // Renderizar Extras
    if (s.extras && s.extras.length > 0) {
        s.extras.forEach(extra => {
            const item = document.createElement('div');
            item.className = 'item-alquiler d-flex justify-content-between align-items-center mb-2 p-2 bg-light border-start border-info';
            const nombreFormateado = extra.tipoNombre.toUpperCase();

            item.innerHTML = `
                <span>
                    <span class="badge bg-info text-dark me-2">EXTRA</span>
                    <strong>1</strong> ${nombreFormateado}
                </span>
                <span class="badge bg-dark">Serie: ${extra.numeroSerie}</span>
            `;
            container.appendChild(item);
        });
    }

    if (container.innerHTML === '') {
        container.innerHTML = '<p class="text-center text-muted">No hay equipos seleccionados.</p>';
    }
}

// 2. BUSCAR CLIENTES EN LA API
async function buscarClientes() {
    const busquedaInput = document.getElementById('buscarCliente');
    const busqueda = busquedaInput ? busquedaInput.value : '';
    
    try {
        const res = await fetch(`/api/clientes?busqueda=${encodeURIComponent(busqueda)}`);
        const clientes = await res.json();
        const select = document.getElementById('selectCliente');
        if (!select) return;
        
        select.innerHTML = '';

        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.nombre} (${c.cedula})`;
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
    config.clienteNombre = c.nombre; 
}

// 3. REGISTRO RÁPIDO DE CLIENTE (DESDE EL MODAL)
async function registrarClienteRapido(e) {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('m-nombre').value,
        cedula: document.getElementById('m-cedula').value,
        telefono: document.getElementById('m-telefono').value,
        correo: document.getElementById('m-correo').value,
        direccion: "Registrado desde flujo de alquiler"
    };

    try {
        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Cliente registrado y seleccionado correctamente.");
            
            // Cerrar el modal usando la instancia de Bootstrap
            const modalEl = document.getElementById('modalNuevoCliente');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            // Limpiar formulario del modal
            document.getElementById('formClienteRapido').reset();

            // Refrescar lista y seleccionar al nuevo cliente automáticamente
            await buscarClientes();
            seleccionarCliente({ id: data.id, nombre: datos.nombre, cedula: datos.cedula });

        } else {
            alert("❌ Error: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error en registro rápido:", error);
        alert("Error al conectar con el servidor.");
    }
}

// 4. PROCESAR TODO EL ALQUILER (CONEXIÓN REAL AL BACKEND)
async function procesarAlquiler() {
    if (!config.clienteId) return alert("Por favor, selecciona un cliente.");

    const fechaFin = document.getElementById('fechaFin').value;
    if (!fechaFin) return alert("Selecciona la fecha de finalización.");

    const s = config.seleccionados;
    const equiposIds = [
        ...(s.receptores || []).map(e => e.id),
        ...(s.colectores || []).map(e => e.id),
        ...(s.bastones || []).map(e => e.id),
        ...(s.tripodes || []).map(e => e.id),
        ...(s.otros || []).map(e => e.id),
        ...(s.extras || []).map(e => e.id)
    ];

    const datosAlquiler = {
        clienteId: config.clienteId,
        equiposIds: equiposIds,
        fechaInicio: document.getElementById('fechaInicio').value,
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