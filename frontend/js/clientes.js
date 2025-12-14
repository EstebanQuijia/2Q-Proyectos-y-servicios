const API_URL = '/api/clientes';
let clienteEditando = null;

// 1. CARGAR Y BUSCAR CLIENTES


async function cargarClientes() {
    // 1. Verificar sesión
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }

    const busqueda = document.getElementById('inputBusqueda').value;
    const clientesBody = document.getElementById('clientesBody');
    clientesBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

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
            row.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.cedula}</td>
                <td>${cliente.telefono || 'N/A'}</td>
                <td>${cliente.correo || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-accion" onclick="editarCliente(${cliente.id})">Editar</button>
                    <button class="btn btn-sm btn-secondary btn-accion" onclick="eliminarCliente(${cliente.id}, '${cliente.nombre}')">Eliminar</button>
                </td>
            `;
            clientesBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        clientesBody.innerHTML = '<tr><td colspan="5" class="mensaje error">Error al cargar clientes. Verifique el servidor.</td></tr>';
    }
}


// 2. CREAR / ACTUALIZAR CLIENTE


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
    const mensajeDiv = document.getElementById('mensajeCliente');
    mensajeDiv.style.display = 'block';
    mensajeDiv.className = 'mensaje';
    mensajeDiv.textContent = 'Guardando...';

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
        
        if (res.ok) {
            mensajeDiv.className = 'mensaje exito';
            mensajeDiv.textContent = data.mensaje;
            
            // Limpiar formulario y recargar lista
            document.getElementById('formCliente').reset();
            cancelarEdicion();
            cargarClientes();
        } else {
            mensajeDiv.className = 'mensaje error';
            mensajeDiv.textContent = data.mensaje || 'Error al guardar el cliente.';
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        mensajeDiv.className = 'mensaje error';
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
    }
});


// 3. EDITAR Y ELIMINAR


async function editarCliente(id) {
    try {
        const res = await fetch(`${API_URL}?busqueda=${id}`);
        const clientes = await res.json();
        const cliente = clientes.find(c => c.id === id);

        if (!cliente) {
            alert('Cliente no encontrado para editar.');
            return;
        }

        // 1. Llenar el formulario con datos
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('cedula').value = cliente.cedula;
        document.getElementById('telefono').value = cliente.telefono || '';
        document.getElementById('correo').value = cliente.correo || '';
        document.getElementById('direccion').value = cliente.direccion || '';

        // 2. Cambiar UI a modo edición
        document.getElementById('formTitle').textContent = `Editar Cliente: ${cliente.nombre}`;
        document.getElementById('btnGuardar').textContent = 'Actualizar Cliente';
        document.getElementById('btnCancelar').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Mover arriba
        
    } catch (error) {
        console.error('Error al cargar cliente para edición:', error);
    }
}

function cancelarEdicion() {
    document.getElementById('clienteId').value = '';
    document.getElementById('formTitle').textContent = 'Nuevo Cliente';
    document.getElementById('btnGuardar').textContent = 'Guardar Cliente';
    document.getElementById('btnCancelar').style.display = 'none';
    document.getElementById('formCliente').reset();
    document.getElementById('mensajeCliente').style.display = 'none';
}

async function eliminarCliente(id, nombre) {
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente ${nombre}?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        const mensajeDiv = document.getElementById('mensajeCliente');
        mensajeDiv.style.display = 'block';

        if (res.ok) {
            mensajeDiv.className = 'mensaje exito';
            mensajeDiv.textContent = data.mensaje;
            cargarClientes(); // Recargar la lista
        } else {
            mensajeDiv.className = 'mensaje error';
            mensajeDiv.textContent = data.mensaje || 'Error al eliminar.';
        }
        
        setTimeout(() => mensajeDiv.style.display = 'none', 3000);

    } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor al intentar eliminar.');
    }
}


// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si tienes un botón de cancelar, asegúrate de que llame a esta función
    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicion); 
    cargarClientes();
});