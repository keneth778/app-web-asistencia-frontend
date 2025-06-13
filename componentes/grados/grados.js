// grados.js - Actualizado con funcionalidad de eliminar alumno
import { renderAgregarAlumno, configurarEventListeners } from '../agregarAlumno/agregarAlumno.js';
import { renderBotonEliminar, configurarEliminarAlumno } from '../eliminarAlumno/eliminarAlumno.js';
import { initUniforme } from '../uniforme/uniforme.js';

let cambiosPendientes = []; // Almacena los cambios antes de guardar

/**
 * Función para obtener estudiantes de un grado
 */
async function consultarAlumnosBackend(idGrado) {
  try {
    const response = await fetch(`http://localhost:3000/estudiantes/${idGrado}`);
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
  
  // Mostrar agregar alumno tanto para profesores como coordinadores
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

  if (estudiantes.length === 0) {
    htmlContent += '<p>No hay estudiantes en este grado.</p>';
  } else {
    htmlContent += `
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
      const response = await fetch('http://localhost:3000/asistencia', {
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
window.marcarPresente = function(idEstudiante) {
  const estadoElement = document.getElementById(`estado-${idEstudiante}`);
  estadoElement.textContent = '✅'; // Emoji de check verde
  estadoElement.style.color = ''; // Color por defecto
  
  // Guarda el cambio pendiente
  cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
  cambiosPendientes.push({ idEstudiante, presente: true });
};

/**
 * Marca un estudiante como ausente (solo visualmente)
 */
window.marcarAusente = function(idEstudiante) {
  const estadoElement = document.getElementById(`estado-${idEstudiante}`);
  estadoElement.textContent = '❌'; // Emoji de X roja
  estadoElement.style.color = ''; // Color por defecto
  
  // Guarda el cambio pendiente
  cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
  cambiosPendientes.push({ idEstudiante, presente: false });
};

/**
 * Envía todos los cambios pendientes al servidor
 */
window.guardarAsistencias = async function(idGrado, idProfesor) {
  if (cambiosPendientes.length === 0) {
    alert('No hay cambios para guardar');
    return;
  }

  try {
    // Deshabilita el botón mientras se guarda
    const btnGuardar = document.querySelector('.btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    // Envía cada cambio al servidor
    for (const cambio of cambiosPendientes) {
      const response = await fetch('http://localhost:3000/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: cambio.idEstudiante,
          id_profesor: idProfesor,
          id_grado: idGrado,
          presente: cambio.presente
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar asistencia');
      }
    }

    // Limpia los cambios pendientes después de guardar
    cambiosPendientes = [];
    alert('Asistencias guardadas correctamente');
    
    // Actualiza la lista (opcional)
    const estudiantes = await consultarAlumnosBackend(idGrado);
    cargarAlumnos(estudiantes, idGrado, idProfesor);
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
 * Función principal del componente
 */
export function DOM(idProfesor, esCoordinador = false) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="grados-container">
      <h2>${esCoordinador ? 'Tomar Asistencia (Modo Coordinador)' : 'Selecciona un Grado'}</h2>
      <select id="selectGrado">
        <option value="">-- Selecciona un grado --</option>
      </select>
      <div id="listaEstudiantes"></div>
    </div>
  `;

  // Inicializar el componente de uniforme
  initUniforme();
  
  // Cargar grados y configurar eventos
  cargarGrados(idProfesor, esCoordinador);
}

/**
 * Carga los grados del profesor
 */
async function cargarGrados(idProfesor, esCoordinador = false) {
  try {
    const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
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

