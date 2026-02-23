// // Verificar sesión
// if (!localStorage.getItem('token')) {
//   window.location.href = '/';
// }

// // ==================== TIPOS DE EQUIPOS ====================

// async function cargarTipos() {
//   try {
//     const res = await fetch('/api/tipos-equipos/todos'); 
//     const tipos = await res.json();

//     const tbody = document.getElementById('listaTipos');
//     tbody.innerHTML = '';

//     if (tipos.length === 0) {
//       tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tipos registrados</td></tr>';
//       return;
//     }

//     tipos.forEach(tipo => {
//       const activo = tipo.activo === 1 || tipo.activo === null;
//       const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
//       const badgeText = activo ? 'Activo' : 'Inactivo';

//       const row = document.createElement('tr');
//       if (!activo) row.style.opacity = '0.6';

//       row.innerHTML = `
//         <td>${tipo.id}</td>
//         <td>${tipo.nombre}</td>
//         <td>${tipo.tipo}</td>
//         <td>${tipo.marca || 'N/A'}</td>
//         <td><span class="${badgeClass}">${badgeText}</span></td>
//         <td>
//           ${activo ? 
//             `<button class="btn btn-sm btn-danger" onclick="eliminarTipo(${tipo.id}, '${tipo.nombre}')">Eliminar</button>` :
//             `<button class="btn btn-sm btn-success" onclick="restaurarTipo(${tipo.id})">Restaurar</button>`
//           }
//         </td>
//       `;

//       tbody.appendChild(row);
//     });

//     actualizarFiltroTipos(tipos.filter(t => t.activo === 1 || t.activo === null));

//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// function actualizarFiltroTipos(tipos) {
//   const select = document.getElementById('filtroTipo');
//   if (!select) return;
//   select.innerHTML = '<option value="">Todos los tipos</option>';
  
//   tipos.forEach(tipo => {
//     const option = document.createElement('option');
//     option.value = tipo.id;
//     option.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
//     option.textContent = tipo.nombre;
//     select.appendChild(option);
//   });
// }

// // ACTUALIZADO: Mensaje de borrado lógico con SweetAlert2
// async function eliminarTipo(id, nombre) {
//   Swal.fire({
//     title: `¿Desactivar "${nombre}"?`,
//     text: "Esto ocultará el tipo del inventario y desactivará TODAS las unidades asociadas.",
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#dc3545',
//     cancelButtonColor: '#6c757d',
//     confirmButtonText: 'Sí, desactivar',
//     cancelButtonText: 'Cancelar',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         const res = await fetch(`/api/tipos-equipos/${id}`, { method: 'DELETE' });
//         const data = await res.json();

//         if (res.ok) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Desactivado',
//             text: data.mensaje,
//             confirmButtonColor: '#0056b3'
//           });
//           cargarTipos();
//           cargarUnidades();
//         } else {
//           Swal.fire('Error', data.mensaje || 'Error al desactivar', 'error');
//         }
//       } catch (error) {
//         Swal.fire('Error', 'Error de conexión', 'error');
//       }
//     }
//   });
// }

// async function restaurarTipo(id) {
//   try {
//     const res = await fetch(`/api/tipos-equipos/${id}/restaurar`, { method: 'PATCH' });
//     const data = await res.json();

//     if (res.ok) {
//       Swal.fire({
//         icon: 'success',
//         title: 'Restaurado',
//         text: data.mensaje,
//         confirmButtonColor: '#0056b3'
//       });
//       cargarTipos();
//       cargarUnidades();
//     } else {
//       Swal.fire('Error', data.mensaje || 'Error al restaurar', 'error');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // ==================== UNIDADES INDIVIDUALES ====================

// async function cargarUnidades() {
//   const filtro = document.getElementById('filtroTipo');
//   const tipoId = filtro ? filtro.value : '';
  
//   try {
//     let url = '/api/equipos/todos';
//     if (tipoId) url += `?tipo=${tipoId}`;

//     const res = await fetch(url);
//     const unidades = await res.json();

//     const tbody = document.getElementById('listaUnidades');
//     if (!tbody) return;
//     tbody.innerHTML = '';

//     if (unidades.length === 0) {
//       tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay unidades registradas</td></tr>';
//       return;
//     }

//     unidades.forEach(unidad => {
//       const activo = unidad.activo === 1 || unidad.activo === null;
//       const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
//       const badgeText = activo ? 'Activo' : 'Inactivo';

//       const row = document.createElement('tr');
//       if (!activo) row.style.opacity = '0.6';

//       row.innerHTML = `
//         <td>${unidad.id}</td>
//         <td>${unidad.tipo_nombre || 'N/A'}</td>
//         <td>${unidad.numero_serie}</td>
//         <td>${unidad.variante || '-'}</td>
//         <td>${unidad.estado}</td>
//         <td><span class="${badgeClass}">${badgeText}</span></td>
//         <td>
//           ${activo ? 
//             `<button class="btn btn-sm btn-danger" onclick="eliminarUnidad(${unidad.id}, '${unidad.numero_serie}')">Eliminar</button>` :
//             `<button class="btn btn-sm btn-success" onclick="restaurarUnidad(${unidad.id})">Restaurar</button>`
//           }
//         </td>
//       `;

//       tbody.appendChild(row);
//     });

//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // ACTUALIZADO: Eliminar unidad individual
// async function eliminarUnidad(id, numeroSerie) {
//   Swal.fire({
//     title: '¿Desactivar unidad?',
//     text: `La unidad "${numeroSerie}" ya no aparecerá en el inventario.`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#dc3545',
//     cancelButtonColor: '#6c757d',
//     confirmButtonText: 'Sí, eliminar',
//     cancelButtonText: 'Cancelar',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
//         const data = await res.json();

//         if (res.ok) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Eliminado',
//             text: data.mensaje,
//             confirmButtonColor: '#0056b3'
//           });
//           cargarUnidades();
//         } else {
//           Swal.fire('Error', data.mensaje || 'Error al desactivar', 'error');
//         }
//       } catch (error) {
//         Swal.fire('Error', 'Error de conexión', 'error');
//       }
//     }
//   });
// }

// async function restaurarUnidad(id) {
//   try {
//     const res = await fetch(`/api/equipos/${id}/restaurar`, { method: 'PATCH' });
//     const data = await res.json();

//     if (res.ok) {
//       Swal.fire({
//         icon: 'success',
//         title: 'Habilitada',
//         text: data.mensaje,
//         confirmButtonColor: '#0056b3'
//       });
//       cargarTipos();
//       cargarUnidades();
//     } else {
//       Swal.fire('Error', data.mensaje || 'Error al restaurar', 'error');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// // Cargar al iniciar
// document.addEventListener('DOMContentLoaded', () => {
//   cargarTipos();
//   cargarUnidades();
// });

// Verificar sesión
if (!localStorage.getItem('token')) {
  window.location.href = '/';
}

// ==================== TIPOS DE EQUIPOS ====================

async function cargarTipos() {
  try {
    const res = await fetch('/api/tipos-equipos/todos'); 
    const tipos = await res.json();

    const tbody = document.getElementById('listaTipos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (tipos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tipos registrados</td></tr>';
      return;
    }

    tipos.forEach(tipo => {
      // CORRECCIÓN PARA POSTGRESQL: Comparamos con true explícito
      const activo = tipo.activo === true || tipo.activo === 1 || tipo.activo === null;
      const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
      const badgeText = activo ? 'Activo' : 'Inactivo';

      const row = document.createElement('tr');
      if (!activo) row.style.opacity = '0.6';

      row.innerHTML = `
        <td>${tipo.id}</td>
        <td>${tipo.nombre}</td>
        <td>${tipo.tipo}</td>
        <td>${tipo.marca || 'N/A'}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>
          ${activo ? 
            `<button class="btn btn-sm btn-danger" onclick="eliminarTipo(${tipo.id}, '${tipo.nombre}')">Eliminar</button>` :
            `<button class="btn btn-sm btn-success" onclick="restaurarTipo(${tipo.id})">Restaurar</button>`
          }
        </td>
      `;

      tbody.appendChild(row);
    });

    // Actualizar filtro solo con los activos
    actualizarFiltroTipos(tipos.filter(t => t.activo === true || t.activo === 1 || t.activo === null));

  } catch (error) {
    console.error('Error:', error);
  }
}

function actualizarFiltroTipos(tipos) {
  const select = document.getElementById('filtroTipo');
  if (!select) return;
  select.innerHTML = '<option value="">Todos los tipos</option>';
  
  tipos.forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo.id;
    option.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    option.textContent = tipo.nombre;
    select.appendChild(option);
  });
}

async function eliminarTipo(id, nombre) {
  Swal.fire({
    title: `¿Desactivar "${nombre}"?`,
    text: "Esto ocultará el tipo del inventario y desactivará TODAS las unidades asociadas.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/tipos-equipos/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
          Swal.fire('Desactivado', data.mensaje, 'success');
          await cargarTipos();
          await cargarUnidades();
        } else {
          Swal.fire('Error', data.mensaje || 'Error al desactivar', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  });
}

async function restaurarTipo(id) {
  try {
    // IMPORTANTE: Asegúrate de que tu ruta en el backend sea PATCH o POST según tu router
    const res = await fetch(`/api/tipos-equipos/${id}/restaurar`, { method: 'PATCH' });
    const data = await res.json();

    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Restaurado',
        text: data.mensaje,
        timer: 1500,
        showConfirmButton: false
      });
      // Refrescamos ambas tablas para quitar la opacidad
      await cargarTipos();
      await cargarUnidades();
    } else {
      Swal.fire('Error', data.mensaje || 'Error al restaurar', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

// ==================== UNIDADES INDIVIDUALES ====================

async function cargarUnidades() {
  const filtro = document.getElementById('filtroTipo');
  const tipoId = filtro ? filtro.value : '';
  
  try {
    let url = '/api/equipos/todos';
    if (tipoId) url += `?tipo=${tipoId}`;

    const res = await fetch(url);
    const unidades = await res.json();

    const tbody = document.getElementById('listaUnidades');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (unidades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay unidades registradas</td></tr>';
      return;
    }

    unidades.forEach(unidad => {
      // CORRECCIÓN PARA POSTGRESQL: Comparamos con true
      const activo = unidad.activo === true || unidad.activo === 1 || unidad.activo === null;
      const badgeClass = activo ? 'badge-activo' : 'badge-inactivo';
      const badgeText = activo ? 'Activo' : 'Inactivo';

      const row = document.createElement('tr');
      if (!activo) row.style.opacity = '0.6';

      row.innerHTML = `
        <td>${unidad.id}</td>
        <td>${unidad.tipo_nombre || 'N/A'}</td>
        <td>${unidad.numero_serie}</td>
        <td>${unidad.variante || '-'}</td>
        <td>${unidad.estado}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>
          ${activo ? 
            `<button class="btn btn-sm btn-danger" onclick="eliminarUnidad(${unidad.id}, '${unidad.numero_serie}')">Eliminar</button>` :
            `<button class="btn btn-sm btn-success" onclick="restaurarUnidad(${unidad.id})">Restaurar</button>`
          }
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

async function eliminarUnidad(id, numeroSerie) {
  Swal.fire({
    title: '¿Desactivar unidad?',
    text: `La unidad "${numeroSerie}" ya no aparecerá en el inventario.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, desactivar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
          Swal.fire('Eliminado', data.mensaje, 'success');
          await cargarUnidades();
        } else {
          Swal.fire('Error', data.mensaje || 'Error al desactivar', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  });
}

async function restaurarUnidad(id) {
  try {
    const res = await fetch(`/api/equipos/${id}/restaurar`, { method: 'PATCH' });
    const data = await res.json();

    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Habilitada',
        text: data.mensaje,
        timer: 1500,
        showConfirmButton: false
      });
      await cargarTipos();
      await cargarUnidades();
    } else {
      Swal.fire('Error', data.mensaje || 'Error al restaurar', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'Error de conexión', 'error');
  }
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarTipos();
  cargarUnidades();
});