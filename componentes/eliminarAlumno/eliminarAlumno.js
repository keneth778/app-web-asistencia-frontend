// componentes/eliminarAlumno/eliminarAlumno.js

/**
 * Renderiza el botón de eliminar alumno
 * @param {number} idEstudiante - ID del estudiante
 * @param {string} nombreEstudiante - Nombre del estudiante
 * @returns {string} HTML del botón
 */
export function renderBotonEliminar(idEstudiante, nombreEstudiante) {
  return `
    <button 
      class="btn-eliminar" 
      onclick="confirmarEliminacion(${idEstudiante}, '${nombreEstudiante.replace(/'/g, "\\'")}')"
      title="Eliminar alumno"
    >
      🗑️
    </button>
  `;
}

/**
 * Renderiza el modal de confirmación
 * @returns {string} HTML del modal
 */
function renderModal() {
  return `
    <div class="modal-overlay" id="modal-eliminar">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-icon">⚠️</span>
          <h3 class="modal-title">Confirmar Eliminación</h3>
        </div>
        
        <div class="modal-body">
          <div class="alumno-info">
            <div class="alumno-nombre" id="modal-alumno-nombre"></div>
          </div>
          
          <p class="advertencia-texto">
            Esta acción no se puede deshacer. Para confirmar la eliminación, 
            ingresa tu contraseña de acceso:
          </p>
          
          <div class="form-group">
            <label class="form-label" for="password-confirmacion">
              Contraseña:
            </label>
            <input 
              type="password" 
              id="password-confirmacion" 
              class="form-input"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
            >
            <div id="error-password" class="error-message" style="display: none;"></div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-modal btn-cancelar" onclick="cerrarModal()">
            Cancelar
          </button>
          <button class="btn-modal btn-confirmar" id="btn-confirmar-eliminar">
            Eliminar Alumno
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Variables para manejar el estado del modal
 */
let modalState = {
  idEstudiante: null,
  nombreEstudiante: '',
  idProfesor: null
};

/**
 * Inicializa el modal de eliminación si no existe
 */
function inicializarModal() {
  if (!document.getElementById('modal-eliminar')) {
    document.body.insertAdjacentHTML('beforeend', renderModal());
    configurarEventListenersModal();
  }
}

/**
 * Configura los event listeners del modal
 */
function configurarEventListenersModal() {
  const modal = document.getElementById('modal-eliminar');
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  const inputPassword = document.getElementById('password-confirmacion');
  
  // Click fuera del modal para cerrar
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
  
  // Enter en el input de password
  inputPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      eliminarAlumno();
    }
  });
  
  // Limpiar errores cuando el usuario escribe
  inputPassword.addEventListener('input', () => {
    limpiarErrores();
  });
  
  // Botón confirmar
  btnConfirmar.addEventListener('click', eliminarAlumno);
  
  // Escape para cerrar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      cerrarModal();
    }
  });
}

/**
 * Abre el modal de confirmación
 * @param {number} idEstudiante - ID del estudiante a eliminar
 * @param {string} nombreEstudiante - Nombre del estudiante
 */
window.confirmarEliminacion = function(idEstudiante, nombreEstudiante) {
  inicializarModal();
  
  // Guardar datos en el estado
  modalState.idEstudiante = idEstudiante;
  modalState.nombreEstudiante = nombreEstudiante;
  modalState.idProfesor = window.idProfesorActual || obtenerIdProfesorActual();
  
  // Actualizar contenido del modal
  document.getElementById('modal-alumno-nombre').textContent = nombreEstudiante;
  
  // Limpiar campos
  document.getElementById('password-confirmacion').value = '';
  limpiarErrores();
  
  // Mostrar modal
  const modal = document.getElementById('modal-eliminar');
  modal.style.display = 'flex';
  
  // Animación de entrada
  setTimeout(() => {
    modal.classList.add('show');
    document.getElementById('password-confirmacion').focus();
  }, 10);
};

/**
 * Cierra el modal de confirmación
 */
window.cerrarModal = function() {
  const modal = document.getElementById('modal-eliminar');
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = 'none';
    limpiarEstado();
  }, 300);
};

/**
 * Limpia el estado del modal
 */
function limpiarEstado() {
  modalState.idEstudiante = null;
  modalState.nombreEstudiante = '';
  modalState.idProfesor = null;
}

/**
 * Limpia los mensajes de error
 */
function limpiarErrores() {
  const errorDiv = document.getElementById('error-password');
  const inputPassword = document.getElementById('password-confirmacion');
  
  errorDiv.style.display = 'none';
  inputPassword.classList.remove('error');
}

/**
 * Muestra un error en el modal
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
  const errorDiv = document.getElementById('error-password');
  const inputPassword = document.getElementById('password-confirmacion');
  
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';
  inputPassword.classList.add('error');
}

/**
 * Obtiene el ID del profesor actual (puedes adaptarlo según tu implementación)
 */
function obtenerIdProfesorActual() {
  // Implementa según cómo manejas el estado del usuario
  // Por ejemplo, desde localStorage, sessionStorage, o una variable global
  return window.currentProfesorId || null;
}

/**
 * Ejecuta la eliminación del alumno con verificación de contraseña
 */
window.eliminarAlumno = async function() {
  const password = document.getElementById('password-confirmacion').value.trim();
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  
  // Validar contraseña
  if (!password) {
    mostrarError('La contraseña es obligatoria');
    return;
  }

  try {
    // Deshabilitar botón y mostrar loading
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="loading-spinner"></span> Eliminando...';
    
    // Enviar solicitud al servidor con el ID en la URL
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/eliminar-estudiante/${modalState.idEstudiante}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id_profesor: modalState.idProfesor,
        password: password
      })
    });

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || 'Respuesta no válida del servidor');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status} al eliminar el alumno`);
    }

    // Mostrar mensaje de éxito
    mostrarMensajeExito(`✅ ${modalState.nombreEstudiante} eliminado correctamente`);
    
    // Cerrar modal
    cerrarModal();
    
    // Notificar al componente padre para actualizar la lista
    if (window.onAlumnoEliminado) {
      window.onAlumnoEliminado(modalState.idEstudiante);
    }
    
  } catch (error) {
    console.error('Error al eliminar alumno:', error);
    
    // Mensajes de error específicos
    let errorMessage = error.message;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.message.includes('404')) {
      errorMessage = 'El estudiante no existe o ya fue eliminado';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      errorMessage = 'Contraseña incorrecta o no tienes permisos';
    }
    
    mostrarError(errorMessage);
  } finally {
    // Rehabilitar botón
    const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Eliminar Alumno';
    }
  }
};

/**
 * Muestra un mensaje de éxito temporal
 * @param {string} mensaje - Mensaje a mostrar
 */
/**
 * Muestra un mensaje de éxito temporal
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarMensajeExito(mensaje) {
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-exito-temporal';
  mensajeDiv.textContent = mensaje;
  
  document.body.appendChild(mensajeDiv);
  
  // Forzar reflow para que la animación funcione
  void mensajeDiv.offsetWidth;
  
  // Animación de entrada
  mensajeDiv.classList.add('mostrar');
  
  // Remover después de 4 segundos
  setTimeout(() => {
    mensajeDiv.classList.remove('mostrar');
    
    // Esperar a que termine la animación antes de remover
    setTimeout(() => {
      if (mensajeDiv.parentNode) {
        document.body.removeChild(mensajeDiv);
      }
    }, 300); // Debe coincidir con el tiempo de transición en CSS
  }, 4000);
}
/**
 * Configuración inicial del componente
 * @param {number} idProfesor - ID del profesor actual
 */
export function configurarEliminarAlumno(idProfesor) {
  window.idProfesorActual = idProfesor;
  inicializarModal();
}