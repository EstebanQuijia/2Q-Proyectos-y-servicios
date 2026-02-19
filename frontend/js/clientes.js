const API_URL = '/api/clientes';
let clienteEditando = null;

// 1. CARGAR Y BUSCAR CLIENTES (CON ESTILOS HARDCODEADOS)
async function cargarClientes() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    const esAdmin = usuarioData && usuarioData.rol === 'admin';

    const busquedaInput = document.getElementById('inputBusqueda');
    const busqueda = busquedaInput ? busquedaInput.value : '';
    const clientesBody = document.getElementById('clientesBody');
    
    if (clientesBody) {
        clientesBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
    }

    try {
        const res = await fetch(`${API_URL}?busqueda=${encodeURIComponent(busqueda)}`);
        const clientes = await res.json();

        clientesBody.innerHTML = '';

        if (clientes.length === 0) {
            clientesBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron clientes.</td></tr>';
            return;
        }

        clientes.forEach(cliente => {
            const row = document.createElement('tr');

            // BOTONES CON MARGEN DE 20PX Y COLORES DEFINIDOS
            let botonesAccion = `
                <button class="btn btn-sm fw-bold" 
                        style="background-color: #0056b3; color: white; border: none; padding: 6px 18px; border-radius: 8px; margin-right: 20px; font-family: 'Segoe UI', sans-serif; transition: 0.3s; cursor: pointer;" 
                        onclick="editarCliente(${cliente.id})"
                        onmouseover="this.style.background='#004494'"
                        onmouseout="this.style.background='#0056b3'">
                    Editar
                </button>
            `;

            if (esAdmin) {
                botonesAccion += `
                    <button class="btn btn-sm fw-bold" 
                            style="background-color: white; color: #dc3545; border: 2px solid #dc3545; padding: 5px 18px; border-radius: 8px; font-family: 'Segoe UI', sans-serif; transition: 0.3s; cursor: pointer;" 
                            onclick="eliminarCliente(${cliente.id}, '${cliente.nombre}')"
                            onmouseover="this.style.background='#dc3545'; this.style.color='white'"
                            onmouseout="this.style.background='white'; this.style.color='#dc3545'">
                        Eliminar
                    </button>
                `;
            }

            row.innerHTML = `
                <td style="vertical-align: middle;">${cliente.nombre}</td>
                <td style="vertical-align: middle;">${cliente.cedula}</td>
                <td style="vertical-align: middle;">${cliente.telefono || 'N/A'}</td>
                <td style="vertical-align: middle;">${cliente.correo || 'N/A'}</td>
                <td style="text-align: center; min-width: 250px; vertical-align: middle;">${botonesAccion}</td>
            `;
            clientesBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        if (clientesBody) {
            clientesBody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Error al cargar clientes.</td></tr>';
        }
    }
}


// 2. CREAR / ACTUALIZAR CLIENTE (CON BLINDAJE DE CÉDULA)
document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('clienteId').value;
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;
    const direccion = document.getElementById('direccion').value;

    const datos = { nombre, cedula, telefono, correo, direccion };
    const token = localStorage.getItem('token');

    Swal.fire({
        title: 'Guardando cliente...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    let url = API_URL;
    let method = 'POST';

    if (id) {
        url = `${API_URL}/${id}`;
        method = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.status === 409) {
            Swal.fire({
                icon: 'error',
                title: 'Identificación Duplicada',
                text: 'Ya existe un cliente registrado con esta identificación.',
                confirmButtonColor: '#dc3545',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            });
        } else if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Operación Exitosa!',
                text: data.mensaje || 'Cliente guardado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });

            document.getElementById('formCliente').reset();
            cancelarEdicion();
            cargarClientes();
        } else {
            Swal.fire('Error', data.mensaje || 'Error al guardar.', 'error');
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        Swal.fire('Error de Conexión', 'No se pudo contactar con el servidor.', 'error');
    }
});


// 3. EDITAR Y ELIMINAR
async function editarCliente(id) {
    try {
        const res = await fetch(`${API_URL}?busqueda=${id}`);
        const clientes = await res.json();
        const cliente = clientes.find(c => c.id === id);

        if (!cliente) {
            Swal.fire('Error', 'Cliente no encontrado.', 'error');
            return;
        }

        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('cedula').value = cliente.cedula;
        document.getElementById('telefono').value = cliente.telefono || '';
        document.getElementById('correo').value = cliente.correo || '';
        document.getElementById('direccion').value = cliente.direccion || '';

        document.getElementById('formTitle').textContent = `Editar Cliente: ${cliente.nombre}`;
        document.getElementById('btnGuardar').textContent = 'Actualizar Cliente';
        document.getElementById('btnCancelar').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error al cargar cliente:', error);
    }
}

function cancelarEdicion() {
    document.getElementById('clienteId').value = '';
    document.getElementById('formTitle').textContent = 'Nuevo Cliente';
    document.getElementById('btnGuardar').textContent = 'Guardar Cliente';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('formCliente').reset();
}

async function eliminarCliente(id, nombre) {
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    if (usuarioData.rol !== 'admin') {
        Swal.fire('Acceso Denegado', 'No tienes permisos de administrador.', 'error');
        return;
    }

    Swal.fire({
        title: `¿Eliminar a ${nombre}?`,
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire('¡Eliminado!', data.mensaje, 'success');
                    cargarClientes();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar al cliente.', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión al eliminar.', 'error');
            }
        }
    });
}

// NUEVA FUNCIÓN PARA EL BOTÓN LIMPIAR
function limpiarBusqueda() {
    document.getElementById('inputBusqueda').value = '';
    cargarClientes();
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const btnCan = document.getElementById('btnCancelar');
    if (btnCan) btnCan.addEventListener('click', cancelarEdicion);
    cargarClientes();
});