export function renderModificarAsistenciaModal(asistenciaData) {
  const estadoActual = asistenciaData.presente ? 
    (asistenciaData.llego_tarde ? 'PRESENTE (TARDE)' : 'PRESENTE') : 
    'AUSENTE';

  return `
    <div class="modal-modificar-asistencia" id="modal-modificar-asistencia">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Modificar Asistencia</h3>
          <button class="close-modal" onclick="cerrarModalModificarAsistencia()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Estado actual: <strong>${estadoActual}</strong></p>
          <p>Registrado el: ${asistenciaData.fecha}</p>
          
          <div class="opciones-asistencia">
            <button class="btn-opcion ${asistenciaData.presente && !asistenciaData.llego_tarde ? 'active' : ''}" 
              onclick="seleccionarOpcion('presente')">
              ✅ Presente
            </button>
            <button class="btn-opcion ${asistenciaData.llego_tarde ? 'active' : ''}" 
              onclick="seleccionarOpcion('tarde')">
              ⏰ Llegó tarde
            </button>
            <button class="btn-opcion ${!asistenciaData.presente ? 'active' : ''}" 
              onclick="seleccionarOpcion('ausente')">
              ❌ Ausente
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" onclick="cerrarModalModificarAsistencia()">Cancelar</button>
          <button class="btn-guardar" onclick="guardarCambiosAsistencia(${asistenciaData.id_asistencia})">Guardar Cambios</button>
        </div>
      </div>
    </div>
  `;
}

let opcionSeleccionada = null;

window.seleccionarOpcion = function(opcion) {
  opcionSeleccionada = opcion;
  document.querySelectorAll('.btn-opcion').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
};

window.guardarCambiosAsistencia = async function(idAsistencia) {
  if (!opcionSeleccionada) {
    alert('Por favor selecciona una opción');
    return;
  }

  const nuevoEstado = {
    presente: opcionSeleccionada !== 'ausente',
    llego_tarde: opcionSeleccionada === 'tarde'
  };

  try {
    const btnGuardar = document.querySelector('#modal-modificar-asistencia .btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/asistencia/${idAsistencia}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoEstado)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Error al actualizar');

    // Cerrar ambos modales
    cerrarModalModificarAsistencia();
    cerrarModalAsistenciaTomada();

    // Mostrar notificación de éxito sin recargar
    mostrarNotificacion('Asistencia actualizada correctamente', 'success');
    
    // Actualizar el estado visual del alumno
    if (window.actualizarEstadoAlumno) {
      window.actualizarEstadoAlumno(idAsistencia, nuevoEstado);
    }

  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error al actualizar: ' + error.message, 'error');
  } finally {
    const btnGuardar = document.querySelector('#modal-modificar-asistencia .btn-guardar');
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Cambios';
    }
  }
};

export function mostrarModalModificarAsistencia(asistenciaData) {
  if (!document.getElementById('modal-modificar-asistencia')) {
    document.body.insertAdjacentHTML('beforeend', renderModificarAsistenciaModal(asistenciaData));
  }
  
  const modal = document.getElementById('modal-modificar-asistencia');
  modal.style.display = 'flex';
  opcionSeleccionada = null;
  
  // Establecer opción actual como seleccionada
  if (asistenciaData.presente) {
    opcionSeleccionada = asistenciaData.llego_tarde ? 'tarde' : 'presente';
  } else {
    opcionSeleccionada = 'ausente';
  }
  
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

window.cerrarModalModificarAsistencia = function() {
  const modal = document.getElementById('modal-modificar-asistencia');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};