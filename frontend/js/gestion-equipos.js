function verificarSesion() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return false;
    }
    return true;
}

// Cambiar entre tabs
function cambiarTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(button => {
        button.classList.remove('active');
    });

    if (tab === 'tipo') {
        document.getElementById('tab-tipo').classList.add('active');
        document.querySelectorAll('.tab')[0].classList.add('active');
    } else if (tab === 'unidad') {
        document.getElementById('tab-unidad').classList.add('active');
        document.querySelectorAll('.tab')[1].classList.add('active');
        cargarTiposEquipos();
    } else if (tab === 'mantenimiento') {
        document.getElementById('tab-mantenimiento').classList.add('active');
        document.querySelectorAll('.tab')[2].classList.add('active');
        cargarEquiposMantenimiento();
    }
}

function previsualizarImagen(event) {
    const preview = document.getElementById('preview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
              preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!verificarSesion()) return;

    const formTipo = document.getElementById('formTipoEquipo');
    if (formTipo) {
        formTipo.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombre').value);
            formData.append('tipo', document.getElementById('tipo').value);
            formData.append('marca', document.getElementById('marca').value);
            formData.append('modelo', document.getElementById('modelo').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            
            const fotoInput = document.getElementById('foto');
            if (fotoInput.files[0]) formData.append('foto', fotoInput.files[0]);

            try {
                const res = await fetch('/api/tipos-equipos', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: formData
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Tipo guardado',
                        text: 'El nuevo modelo de equipo ha sido registrado exitosamente.',
                        confirmButtonColor: '#0056b3'
                    });
                    formTipo.reset();
                    document.getElementById('preview').innerHTML = '<span>Vista previa</span>';
                }
            } catch (error) { 
                Swal.fire('Error', 'No se pudo guardar el tipo de equipo.', 'error');
            }
        });
    }

    const formUnidad = document.getElementById('formUnidadEquipo');
    if (formUnidad) {
        formUnidad.addEventListener('submit', async (e) => {
            e.preventDefault();
            const datos = {
                tipo_equipo_id: document.getElementById('tipoEquipo').value,
                numero_serie: document.getElementById('numeroSerie').value,
                variante: document.getElementById('variante').value || null, 
                estado: document.getElementById('estado').value,
                observaciones: document.getElementById('observaciones').value
            };

            try {
                const res = await fetch('/api/equipos', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(datos)
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Unidad guardada',
                        text: 'La serie ha sido agregada al inventario correctamente.',
                        confirmButtonColor: '#0056b3'
                    });
                    formUnidad.reset();
                }
            } catch (error) { 
                Swal.fire('Error', 'No se pudo registrar la unidad.', 'error');
            }
        });
    }
});

async function cargarTiposEquipos() {
    try {
        const res = await fetch('/api/tipos-equipos');
        const tipos = await res.json();
        const select = document.getElementById('tipoEquipo');
        if (!select) return;
        select.innerHTML = '<option value="">Selecciona un tipo...</option>';
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            option.textContent = `${tipo.nombre} (${tipo.tipo})`;
            select.appendChild(option);
        });
    } catch (error) { console.error(error); }
}

async function cargarEquiposMantenimiento() {
    try {
        const res = await fetch('/api/equipos/todos');
        const equipos = await res.json();
        const container = document.getElementById('listaMantenimiento');
        if (!container) return;
        container.innerHTML = '';
        const danados = equipos.filter(e => e.estado === 'mantenimiento');
        if (danados.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No hay equipos en taller.</p>';
            return;
        }
        danados.forEach(e => {
            const card = document.createElement('div');
            card.className = "col-12 mb-2";
            card.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            card.innerHTML = `
                <div class="card border-0 shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center py-2 px-4">
                        <div class="d-flex align-items-center" style="gap: 40px;">
                            <div style="min-width: 150px;">
                                <small class="text-muted d-block" style="font-size: 0.7rem;">Equipo</small>
                                <strong>${e.tipo_nombre || 'Equipo'}</strong>
                            </div>
                            <div>
                                <small class="text-muted d-block" style="font-size: 0.7rem;">Serie</small>
                                <span class="badge bg-secondary">${e.numero_serie}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm px-3 fw-bold" style="width: auto; background-color: #0056b3; font-family: inherit;" onclick="repararEquipo(${e.id})">
                             REPARADO
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

async function repararEquipo(id) {
    Swal.fire({
        title: '¿Equipo reparado?',
        text: "¿Confirmas que el equipo está listo para volver al inventario?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0056b3',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Sí, habilitar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/equipos/${id}/reparar`, {
                    method: 'PATCH',
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Listo!',
                        text: 'Equipo habilitado nuevamente.',
                        confirmButtonColor: '#0056b3'
                    });
                    cargarEquiposMantenimiento();
                } else {
                    Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
                }
            } catch (e) { 
                Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
            }
        }
    });
}