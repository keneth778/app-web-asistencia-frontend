// grados.js - Actualizado con funcionalidad de eliminar alumno
import { renderAgregarAlumno, configurarEventListeners } from '../agregarAlumno/agregarAlumno.js';
import { renderBotonEliminar, configurarEliminarAlumno } from '../eliminarAlumno/eliminarAlumno.js';
import { initUniforme } from '../uniforme/uniforme.js';
import { initGraficas } from '../graficas/graficas.js';
import { mostrarModalAsistenciaTomada } from '../asistenciaTomada/asistenciaTomada.js';
let cambiosPendientes = []; // Almacena los cambios antes de guardar

/**
 * Función para obtener estudiantes de un grado
 */
async function consultarAlumnosBackend(idGrado) {
  try {
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/estudiantes/${idGrado}`);
    if (!response.ok) throw new Error('Error al obtener estudiantes');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Marca todos los estudiantes como presentes
 */
window.marcarTodosPresentes = function(idGrado) {
  const estudiantes = document.querySelectorAll('.lista-estudiantes li');
  
  estudiantes.forEach(estudiante => {
    const idEstudiante = estudiante.dataset.id;
    const estadoElement = document.getElementById(`estado-${idEstudiante}`);
    
    estadoElement.textContent = '✅';
    
    // Actualizar cambios pendientes
    cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== parseInt(idEstudiante));
    cambiosPendientes.push({ 
      idEstudiante: parseInt(idEstudiante), 
      presente: true 
    });
  });
  
  mostrarMensajeTemporal('Todos los estudiantes marcados como presentes');
};

/**
 * Marca todos los estudiantes como ausentes
 */
window.marcarTodosAusentes = function(idGrado) {
  const estudiantes = document.querySelectorAll('.lista-estudiantes li');
  
  estudiantes.forEach(estudiante => {
    const idEstudiante = estudiante.dataset.id;
    const estadoElement = document.getElementById(`estado-${idEstudiante}`);
    
    estadoElement.textContent = '❌';
    
    // Actualizar cambios pendientes
    cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== parseInt(idEstudiante));
    cambiosPendientes.push({ 
      idEstudiante: parseInt(idEstudiante), 
      presente: false 
    });
  });
  
  mostrarMensajeTemporal('Todos los estudiantes marcados como ausentes');
};

/**
 * Muestra un mensaje temporal
 */
function mostrarMensajeTemporal(mensaje) {
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-temporal';
  mensajeDiv.textContent = mensaje;
  
  document.body.appendChild(mensajeDiv);
  
  setTimeout(() => {
    mensajeDiv.classList.add('mostrar');
  }, 100);
  
  setTimeout(() => {
    mensajeDiv.classList.remove('mostrar');
    setTimeout(() => {
      if (mensajeDiv.parentNode) {
        document.body.removeChild(mensajeDiv);
      }
    }, 300);
  }, 3000);
}
/**
 * Renderiza la lista de estudiantes con controles de asistencia y eliminación
 */
// En grados.js, modifica la función cargarAlumnos
// En grados.js, modifica la función cargarAlumnos para agregar el botón de uniforme
function cargarAlumnos(estudiantes, idGrado, idProfesor, esCoordinador) {
  const listaEstudiantes = document.getElementById('listaEstudiantes');
  
  let htmlContent = `<h3>Estudiantes del Grado</h3>`;
  htmlContent += renderAgregarAlumno(idGrado);

  if (estudiantes.length > 0) {
    htmlContent += `
      <div class="botones-guardar-container">
        <div class="botones-marcar-todos">
          <button class="btn-marcar-todos btn-presente" 
            onclick="marcarTodosPresentes(${idGrado})">
            Marcar Todos Presentes
          </button>
          <button class="btn-marcar-todos btn-ausente" 
            onclick="marcarTodosAusentes(${idGrado})">
            Marcar Todos Ausentes
          </button>
        </div>
      </div>
    `;
  }

  if (estudiantes.length > 0) {
    htmlContent += `
      <div class="grados-header">
        <h3>Estudiantes del Grado</h3>
        <button class="btn-graficas-grado" 
          onclick="abrirGraficasGradoModal(${idGrado}, 'Grado ${idGrado}')"
          title="Ver estadísticas del grado">
          📊 Estadísticas del Grado
        </button>
      </div>
      <ul class="lista-estudiantes">
        ${estudiantes.map(estudiante => `
          <li data-id="${estudiante.id_estudiante}">
            <div class="estudiante-info">
              <span class="nombre-estudiante">${estudiante.nombre}</span>
              <button class="btn-uniforme" 
                onclick="abrirUniformeModal(${estudiante.id_estudiante}, '${estudiante.nombre.replace(/'/g, "\\'")}')"
                title="Registrar uniforme">
                👕
              </button>
              <button class="btn-graficas" 
                onclick="abrirGraficasModal(${estudiante.id_estudiante}, '${estudiante.nombre.replace(/'/g, "\\'")}')"
                title="Ver estadísticas">
                📊
              </button>
              ${renderBotonEliminar(estudiante.id_estudiante, estudiante.nombre)}
            </div>
            
            <div class="controles-asistencia">
              <button class="btn-presente" 
                onclick="marcarPresente(${estudiante.id_estudiante})">
                Presente
              </button>
              <button class="btn-ausente" 
                onclick="marcarAusente(${estudiante.id_estudiante})">
                Ausente
              </button>
              <span class="estado-marcado" 
                id="estado-${estudiante.id_estudiante}"></span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  if (estudiantes.length > 0) {
    htmlContent += `
      <div class="botones-guardar-container">
        <button class="btn-estadisticas-generales" 
          onclick="abrirEstadisticasGenerales(${idProfesor})">
          📊 Ver Estadísticas Generales
        </button>
        <button class="btn-guardar" 
          onclick="guardarAsistencias(${idGrado}, ${idProfesor}, ${esCoordinador})">
          Guardar Asistencias
        </button>
      </div>
    `;
  }

  listaEstudiantes.innerHTML = htmlContent;
  configurarEventListeners(idGrado);
  configurarEliminarAlumno(idProfesor);
}
  
// Modificar guardarAsistencias para aceptar esCoordinador
window.guardarAsistencias = async function(idGrado, idProfesor, esCoordinador) {
  if (cambiosPendientes.length === 0) {
    alert('No hay cambios para guardar');
    return;
  }

  try {
    const btnGuardar = document.querySelector('.btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    for (const cambio of cambiosPendientes) {
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: cambio.idEstudiante,
          id_profesor: esCoordinador ? idProfesor : window.idProfesorActual,
          id_grado: idGrado,
          presente: cambio.presente
        })
      });

      if (!response.ok) throw new Error('Error al guardar asistencia');
    }

    cambiosPendientes = [];
    alert('Asistencias guardadas correctamente');
    const estudiantes = await consultarAlumnosBackend(idGrado);
    cargarAlumnos(estudiantes, idGrado, idProfesor, esCoordinador);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar las asistencias: ' + error.message);
  } finally {
    const btnGuardar = document.querySelector('.btn-guardar');
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Asistencias';
    }
  }
};
/**
 * Marca un estudiante como presente (solo visualmente)
 */
window.marcarPresente = async function(idEstudiante) {
  try {
    // 1. Verificar el horario
    const horarioResponse = await fetch('https://app-web-asistencia-backend.onrender.com/verificar-horario-asistencia');
    const horario = await horarioResponse.json();
    
    if (!horario.permitido) {
      mostrarModalFueraDeHorario(idEstudiante);
      return;
    }

    // 2. Verificar si ya tiene asistencia hoy
    const asistenciaResponse = await fetch(`https://app-web-asistencia-backend.onrender.com/asistencia-hoy-alumno/${idEstudiante}`);
    const data = await asistenciaResponse.json();
    
    if (data.tiene_asistencia) {
      mostrarModalAsistenciaTomada(data.asistencia);
      return;
    }

    // 3. Marcar como presente localmente
    const estadoElement = document.getElementById(`estado-${idEstudiante}`);
    estadoElement.textContent = '✅';
    
    // Actualizar cambios pendientes
    cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
    cambiosPendientes.push({ 
      idEstudiante, 
      presente: true,
      llegoTarde: false
    });
    
    mostrarMensajeTemporal('Estudiante marcado como presente');
    
  } catch (error) {
    console.error('Error marcando presente:', error);
    mostrarMensajeTemporal('❌ Error al marcar como presente');
  }
};

// Modal para cuando está fuera de horario
function mostrarModalFueraDeHorario(idEstudiante) {
  const modalHTML = `
    <div class="modal-fuera-horario" id="modal-fuera-horario">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Fuera del horario de asistencia</h3>
          <button class="close-modal" onclick="cerrarModalFueraHorario()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Solo puedes marcar como ausente o tarde fuera del horario establecido.</p>
          <div class="opciones-fuera-horario">
            <button class="btn-tarde" onclick="marcarTardeFueraHorario(${idEstudiante})">
              Llegó Tarde
            </button>
            <button class="btn-ausente" onclick="marcarAusente(${idEstudiante})">
              Ausente
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!document.getElementById('modal-fuera-horario')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  const modal = document.getElementById('modal-fuera-horario');
  modal.style.display = 'flex';
}

window.marcarTardeFueraHorario = function(idEstudiante) {
  const estadoElement = document.getElementById(`estado-${idEstudiante}`);
  estadoElement.textContent = '⏰';
  
  cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
  cambiosPendientes.push({ 
    idEstudiante, 
    presente: true,
    llegoTarde: true
  });
  
  cerrarModalFueraHorario();
  mostrarMensajeTemporal('Estudiante marcado como llegó tarde');
};

window.cerrarModalFueraHorario = function() {
  const modal = document.getElementById('modal-fuera-horario');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.marcarAusente = async function(idEstudiante) {
  // Verificar si ya tiene asistencia hoy
  const response = await fetch(`https://app-web-asistencia-backend.onrender.com/asistencia-hoy-alumno/${idEstudiante}`);
  const data = await response.json();
  
  if (data.tiene_asistencia) {
    mostrarModalAsistenciaTomada(data.asistencia);
    return;
  }

  const estadoElement = document.getElementById(`estado-${idEstudiante}`);
  estadoElement.textContent = '❌';
  
  cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
  cambiosPendientes.push({ idEstudiante, presente: false });
};

/**
 * Envía todos los cambios pendientes al servidor
 */
window.guardarAsistencias = async function(idGrado, idProfesor, esCoordinador) {
  if (cambiosPendientes.length === 0) {
    alert('No hay cambios para guardar');
    return;
  }

  try {
    const btnGuardar = document.querySelector('.btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    for (const cambio of cambiosPendientes) {
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: cambio.idEstudiante,
          id_profesor: esCoordinador ? idProfesor : window.idProfesorActual,
          id_grado: idGrado,
          presente: cambio.presente,
          llego_tarde: cambio.llegoTarde || false // Asegurarse de enviar este campo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar asistencia');
      }
    }

    cambiosPendientes = [];
    mostrarMensajeTemporal('Asistencias guardadas correctamente');
    const estudiantes = await consultarAlumnosBackend(idGrado);
    cargarAlumnos(estudiantes, idGrado, idProfesor, esCoordinador);
  } catch (error) {
    console.error('Error:', error);
    mostrarMensajeTemporal(`Error: ${error.message}`);
  } finally {
    const btnGuardar = document.querySelector('.btn-guardar');
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Asistencias';
    }
  }
};

/**
 * Función principal del componente
 */
export function DOM(idProfesor, esCoordinador = false, esAdmin = false) {
  const root = document.getElementById('root');
  
  // Determinar el texto del título según el tipo de usuario
  let titulo = 'Selecciona un Grado';
  if (esAdmin) {
    titulo = 'Tomar Asistencia (Modo Administrador)';
  } else if (esCoordinador) {
    titulo = 'Tomar Asistencia (Modo Coordinador)';
  }

  root.innerHTML = `
    <div class="grados-container">
      <h2>${titulo}</h2>
      <select id="selectGrado">
        <option value="">-- Selecciona un grado --</option>
      </select>
      <div id="listaEstudiantes"></div>
    </div>
  `;

  // Inicializar el componente de uniforme
  initUniforme();
  
  // Cargar grados y configurar eventos
  cargarGrados(idProfesor, esCoordinador, esAdmin);
}


/**
 * Carga los grados del profesor
 */
async function cargarGrados(idProfesor, esCoordinador = false) {
  try {
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/grados/${idProfesor}`);
    if (!response.ok) throw new Error('Error al obtener grados');
    const grados = await response.json();
    renderGrados(grados, idProfesor, esCoordinador);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('listaEstudiantes').innerHTML = '<p>Error al cargar los grados.</p>';
  }
}
/**
 * Renderiza los grados en el select
 */
function renderGrados(grados, idProfesor, esCoordinador) {
  const selectGrado = document.getElementById('selectGrado');
  if (grados.length === 0) {
    selectGrado.innerHTML = '<option value="">No hay grados asignados</option>';
    return;
  }

  selectGrado.innerHTML = '<option value="">-- Selecciona un grado --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado.id_grado;
    option.textContent = grado.nombre;
    selectGrado.appendChild(option);
  });

  selectGrado.addEventListener('change', async (e) => {
    const idGrado = e.target.value;
    if (!idGrado) return;
    cambiosPendientes = [];
    const estudiantes = await consultarAlumnosBackend(idGrado);
    cargarAlumnos(estudiantes, idGrado, idProfesor, esCoordinador);
  });
}

