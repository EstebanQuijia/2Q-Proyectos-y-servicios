// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/';
}

// Cambiar entre tabs
function cambiarTab(tab) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll('.tab').forEach(button => {
    button.classList.remove('active');
  });

  // Mostrar tab seleccionado
  if (tab === 'tipo') {
    document.getElementById('tab-tipo').classList.add('active');
    document.querySelectorAll('.tab')[0].classList.add('active');
  } else {
    document.getElementById('tab-unidad').classList.add('active');
    document.querySelectorAll('.tab')[1].classList.add('active');
    cargarTiposEquipos();
  }
}

// Previsualizar imagen
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

// Formulario: Agregar Tipo de Equipo
document.getElementById('formTipoEquipo').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('nombre', document.getElementById('nombre').value);
  formData.append('tipo', document.getElementById('tipo').value);
  formData.append('marca', document.getElementById('marca').value);
  formData.append('modelo', document.getElementById('modelo').value);
  formData.append('descripcion', document.getElementById('descripcion').value);
  
  const fotoInput = document.getElementById('foto');
  if (fotoInput.files[0]) {
    formData.append('foto', fotoInput.files[0]);
  }

  try {
    const res = await fetch('/api/tipos-equipos', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    const mensaje = document.getElementById('mensajeTipo');
    if (res.ok) {
      mensaje.className = 'mensaje exito';
      mensaje.textContent = '✅ Tipo de equipo guardado correctamente';
      document.getElementById('formTipoEquipo').reset();
      document.getElementById('preview').innerHTML = '<span>Vista previa</span>';
    } else {
      mensaje.className = 'mensaje error';
      mensaje.textContent = data.mensaje || 'Error al guardar';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('mensajeTipo').className = 'mensaje error';
    document.getElementById('mensajeTipo').textContent = 'Error de conexión';
  }
});

// Cargar tipos de equipos para el select
async function cargarTiposEquipos() {
  try {
    const res = await fetch('/api/tipos-equipos');
    const tipos = await res.json();

    const select = document.getElementById('tipoEquipo');
    select.innerHTML = '<option value="">Selecciona un tipo...</option>';

    tipos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.id;
      option.textContent = `${tipo.nombre} (${tipo.tipo})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar tipos:', error);
  }
}

// Formulario: Agregar Unidad Individual
document.getElementById('formUnidadEquipo').addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    tipo_equipo_id: document.getElementById('tipoEquipo').value,
    numero_serie: document.getElementById('numeroSerie').value,
    variante: document.getElementById('variante').value || null,
    estado: document.getElementById('estado').value,
    observaciones: document.getElementById('observaciones').value
  };

  const mensaje = document.getElementById('mensajeUnidad');
  mensaje.textContent = 'Guardando...';
  mensaje.className = 'mensaje';

  try {
    const res = await fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const data = await res.json();

    if (res.ok) {
      mensaje.className = 'mensaje exito';
      mensaje.textContent = '✅ Unidad guardada correctamente';
      document.getElementById('formUnidadEquipo').reset();
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        mensaje.textContent = '';
        mensaje.className = '';
      }, 3000);
    } else {
      mensaje.className = 'mensaje error';
      mensaje.textContent = data.mensaje || 'Error al guardar';
    }
  } catch (error) {
    console.error('Error:', error);
    mensaje.className = 'mensaje error';
    mensaje.textContent = 'Error de conexión con el servidor';
  }
});