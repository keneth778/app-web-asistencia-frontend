// grados.js
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
 * Renderiza la lista de estudiantes con controles de asistencia
 */
function cargarAlumnos(estudiantes, idGrado, idProfesor) {
  const listaEstudiantes = document.getElementById('listaEstudiantes');
  
  if (estudiantes.length === 0) {
    listaEstudiantes.innerHTML = '<p>No hay estudiantes en este grado.</p>';
    return;
  }

  // Genera el HTML para la lista de estudiantes
  listaEstudiantes.innerHTML = `
    <h3>Estudiantes</h3>
    <ul class="lista-estudiantes">
      ${estudiantes.map(estudiante => `
        <li data-id="${estudiante.id_estudiante}">
          <span>${estudiante.nombre}</span>
          <div class="controles-asistencia">
            <button class="btn-presente" onclick="marcarPresente(${estudiante.id_estudiante})">Presente</button>
            <button class="btn-ausente" onclick="marcarAusente(${estudiante.id_estudiante})">Ausente</button>
            <span class="estado-marcado" id="estado-${estudiante.id_estudiante}"></span>
          </div>
        </li>
      `).join('')}
    </ul>
    <div class="botones-guardar-container">
      <button class="btn-guardar" onclick="guardarAsistencias(${idGrado}, ${idProfesor})">Guardar Asistencias</button>
    </div>
  `;
}

/**
 * Marca un estudiante como presente (solo visualmente)
 */
window.marcarPresente = function(idEstudiante) {
  const estadoElement = document.getElementById(`estado-${idEstudiante}`);
  estadoElement.textContent = '✓';
  estadoElement.className = 'estado-marcado estado-presente';
  
  // Guarda el cambio pendiente
  cambiosPendientes = cambiosPendientes.filter(c => c.idEstudiante !== idEstudiante);
  cambiosPendientes.push({ idEstudiante, presente: true });
};

/**
 * Marca un estudiante como ausente (solo visualmente)
 */
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
export function DOM(idProfesor) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="grados-container">
      <h2>Selecciona un Grado</h2>
      <select id="selectGrado">
        <option value="">-- Selecciona un grado --</option>
      </select>
      <div id="listaEstudiantes"></div>
    </div>
  `;

  // Cargar grados y configurar eventos
  cargarGrados(idProfesor);
}

/**
 * Carga los grados del profesor
 */
async function cargarGrados(idProfesor) {
  try {
    const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
    if (!response.ok) throw new Error('Error al obtener grados');
    
    const grados = await response.json();
    renderGrados(grados, idProfesor);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('listaEstudiantes').innerHTML = '<p>Error al cargar los grados.</p>';
  }
}

/**
 * Renderiza los grados en el select
 */
function renderGrados(grados, idProfesor) {
  const selectGrado = document.getElementById('selectGrado');
  
  if (grados.length === 0) {
    selectGrado.innerHTML = '<option value="">No hay grados asignados</option>';
    return;
  }

  // Limpia y agrega opciones
  selectGrado.innerHTML = '<option value="">-- Selecciona un grado --</option>';
  grados.forEach(grado => {
    const option = document.createElement('option');
    option.value = grado.id_grado;
    option.textContent = grado.nombre;
    selectGrado.appendChild(option);
  });

  // Configura el evento de cambio
  selectGrado.addEventListener('change', async (e) => {
    const idGrado = e.target.value;
    if (!idGrado) return;
    
    // Reinicia los cambios pendientes al cambiar de grado
    cambiosPendientes = [];
    
    const estudiantes = await consultarAlumnosBackend(idGrado);
    cargarAlumnos(estudiantes, idGrado, idProfesor);
  });
}