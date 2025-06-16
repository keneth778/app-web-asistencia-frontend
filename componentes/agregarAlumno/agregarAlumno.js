// componentes/agregarAlumno/agregarAlumno.js

/**
 * Renderiza el formulario para agregar un nuevo alumno
 * @param {number} idGrado - ID del grado al que se agregará el alumno
 * @param {function} onAlumnoAgregado - Callback que se ejecuta cuando se agrega un alumno exitosamente
 * @returns {string} HTML del formulario
 */
export function renderAgregarAlumno(idGrado, onAlumnoAgregado) {
  return `
    <div class="agregar-alumno-container">
      <button class="toggle-form-btn" onclick="toggleFormularioAgregar()">
        ➕ Agregar Nuevo Alumno
      </button>
      <div class="agregar-alumno-form hidden" id="formulario-agregar">
        <div class="form-row">
          <input 
            type="text" 
            id="nombre-completo-alumno" 
            placeholder="Nombre completo del alumno" 
            required
          >
          <button 
            class="btn-agregar-alumno" 
            onclick="agregarNuevoAlumno(${idGrado})"
          >
            Agregar
          </button>
        </div>
        <div id="mensaje-agregar"></div>
      </div>
    </div>
  `;
}

/**
 * Alterna la visibilidad del formulario para agregar alumno
 */
window.toggleFormularioAgregar = function() {
  const formulario = document.getElementById('formulario-agregar');
  const boton = document.querySelector('.toggle-form-btn');
  
  if (formulario.classList.contains('hidden')) {
    formulario.classList.remove('hidden');
    boton.textContent = '➖ Cancelar';
    // Enfocar el input
    document.getElementById('nombre-completo-alumno').focus();
  } else {
    formulario.classList.add('hidden');
    boton.textContent = '➕ Agregar Nuevo Alumno';
    // Limpiar campo
    limpiarFormulario();
  }
};

/**
 * Limpia el campo del formulario y mensajes
 */
function limpiarFormulario() {
  document.getElementById('nombre-completo-alumno').value = '';
  document.getElementById('mensaje-agregar').innerHTML = '';
}

/**
 * Valida los datos del formulario
 * @param {string} nombreCompleto - Nombre completo del alumno
 * @returns {Object} Objeto con isValid y mensaje de error si existe
 */
function validarDatos(nombreCompleto) {
  if (!nombreCompleto) {
    return {
      isValid: false,
      mensaje: 'El nombre completo es obligatorio'
    };
  }
  
  const nombreTrimmed = nombreCompleto.trim();
  
  if (nombreTrimmed.length < 3) {
    return {
      isValid: false,
      mensaje: 'El nombre completo debe tener al menos 3 caracteres'
    };
  }
  
  // Validar que contenga al menos un espacio (nombre y apellido)
  if (!nombreTrimmed.includes(' ')) {
    return {
      isValid: false,
      mensaje: 'Por favor ingresa nombre y apellido separados por espacio'
    };
  }
  
  // Validar que solo contengan letras y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!regex.test(nombreTrimmed)) {
    return {
      isValid: false,
      mensaje: 'El nombre solo puede contener letras y espacios'
    };
  }
  
  // Validar que no tenga espacios múltiples seguidos
  if (/\s{2,}/.test(nombreTrimmed)) {
    return {
      isValid: false,
      mensaje: 'No se permiten espacios múltiples seguidos'
    };
  }
  
  return { isValid: true };
}

/**
 * Muestra un mensaje en el contenedor de mensajes
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje ('success' o 'error')
 */
function mostrarMensaje(mensaje, tipo) {
  const contenedor = document.getElementById('mensaje-agregar');
  const clase = tipo === 'success' ? 'success-message' : 'error-message';
  contenedor.innerHTML = `<div class="${clase}">${mensaje}</div>`;
  
  // Limpiar mensaje después de 5 segundos
  setTimeout(() => {
    contenedor.innerHTML = '';
  }, 5000);
}

/**
 * Agrega un nuevo alumno al grado especificado
 * @param {number} idGrado - ID del grado
 */
window.agregarNuevoAlumno = async function(idGrado) {
  const nombreCompleto = document.getElementById('nombre-completo-alumno').value.trim();
  const btnAgregar = document.querySelector('.btn-agregar-alumno');
  
  // Validar datos
  const validacion = validarDatos(nombreCompleto);
  if (!validacion.isValid) {
    mostrarMensaje(validacion.mensaje, 'error');
    return;
  }
  
  // Limpiar espacios múltiples y formatear el nombre
  const nombreFormateado = nombreCompleto.replace(/\s+/g, ' ').trim();
  
  try {
    // Deshabilitar botón mientras se procesa
    btnAgregar.disabled = true;
    btnAgregar.textContent = 'Agregando...';
    
    // Enviar solicitud al servidor
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/agregar-estudiante', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: nombreFormateado,
        id_grado: idGrado
      })
    });
    
    // Verificar respuesta
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al agregar el alumno');
    }
    
    // Mostrar mensaje de éxito
    mostrarMensaje(`✅ ${nombreFormateado} agregado correctamente`, 'success');
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Ocultar formulario
    document.getElementById('formulario-agregar').classList.add('hidden');
    document.querySelector('.toggle-form-btn').textContent = '➕ Agregar Nuevo Alumno';
    
    // Notificar al componente padre que se agregó un alumno
    if (window.onAlumnoAgregado) {
      window.onAlumnoAgregado(idGrado);
    }
    
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje(`❌ ${error.message}`, 'error');
  } finally {
    // Rehabilitar botón
    btnAgregar.disabled = false;
    btnAgregar.textContent = 'Agregar';
  }
};

/**
 * Configura los event listeners para el formulario
 * @param {number} idGrado - ID del grado
 */
export function configurarEventListeners(idGrado) {
  // Event listener para Enter en el input
  const input = document.getElementById('nombre-completo-alumno');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        agregarNuevoAlumno(idGrado);
      }
    });
  }
  
  // Event listener para Escape para cerrar el formulario
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const formulario = document.getElementById('formulario-agregar');
      if (formulario && !formulario.classList.contains('hidden')) {
        toggleFormularioAgregar();
      }
    }
  });
}