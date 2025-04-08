// Importa las funciones de asistencia desde el módulo correspondiente
import { asistenciaAlumnos, AusenciaAlumnos } from '../funcionesAsistencia/asistencia.js';

/**
 * Función para obtener la lista de estudiantes de un grado desde el backend
 * @param {number} idGrado - ID del grado a consultar
 * @returns {Promise<Array>} Promesa que resuelve con el array de estudiantes
 */
async function consultarAlumnosBackend(idGrado) {
  try {
    // Realiza petición GET al endpoint de estudiantes con el ID del grado
    const response = await fetch(`http://localhost:3000/estudiantes/${idGrado}`);
    
    // Si la respuesta no es exitosa, lanza error
    if (!response.ok) {
      throw new Error('Error al obtener estudiantes');
    }
    
    // Convierte la respuesta a JSON y retorna los estudiantes
    const estudiantes = await response.json();
    return estudiantes;
  } catch (error) {
    // Captura y registra errores, retorna array vacío como fallback
    console.error('Error en consultarAlumnosBackend:', error);
    return [];
  }
}

/**
 * Renderiza la lista de estudiantes en la interfaz
 * @param {Array} estudiantes - Lista de estudiantes a mostrar
 * @param {number} idGrado - ID del grado actual
 * @param {number} idProfesor - ID del profesor logueado
 */
function cargarAlumnos(estudiantes, idGrado, idProfesor) {
  // Obtiene referencia al contenedor de estudiantes
  const listaEstudiantes = document.getElementById('listaEstudiantes');
  
  // Si no hay estudiantes, muestra mensaje
  if (estudiantes.length === 0) {
    listaEstudiantes.innerHTML = '<p>No hay estudiantes en este grado.</p>';
    return;
  }

  // Genera el HTML para la lista de estudiantes con botones de asistencia
  listaEstudiantes.innerHTML = `
    <h3>Estudiantes</h3>
    <ul>
      ${estudiantes.map((estudiante) => `
        <li>
          <span>${estudiante.nombre}</span>
          <!-- Botones para marcar asistencia/ausencia con llamadas globales -->
          <button onclick="marcarAsistencia(${estudiante.id_estudiante}, ${idGrado}, ${idProfesor}, true)">Presente</button>
          <button onclick="marcarAsistencia(${estudiante.id_estudiante}, ${idGrado}, ${idProfesor}, false)">Ausente</button>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * Función principal para renderizar la lista de alumnos
 * @param {number} idGrado - ID del grado a renderizar
 * @param {number} idProfesor - ID del profesor logueado
 */
async function renderAlumnos(idGrado, idProfesor) {
  // Obtiene estudiantes y los carga en la interfaz
  const estudiantes = await consultarAlumnosBackend(idGrado);
  cargarAlumnos(estudiantes, idGrado, idProfesor);
}

/**
 * Configura el event listener para el cambio de selección de grado
 * @param {number} idProfesor - ID del profesor logueado
 */
function manejarSeleccionGrado(idProfesor) {
  // Obtiene referencia al select de grados
  const selectGrado = document.getElementById('selectGrado');
  
  // Agrega listener para cambio de selección
  selectGrado.addEventListener('change', async (e) => {
    const idGrado = e.target.value;
    
    // Si no se seleccionó un grado válido, no hace nada
    if (!idGrado) return;
    
    // Renderiza los alumnos del grado seleccionado
    await renderAlumnos(idGrado, idProfesor);
  });
}

/**
 * Obtiene la lista de grados asignados a un profesor desde el backend
 * @param {number} idProfesor - ID del profesor
 * @returns {Promise<Array>} Promesa que resuelve con el array de grados
 */
async function cargarGrados(idProfesor) {
  try {
    // Realiza petición GET al endpoint de grados con el ID del profesor
    const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
    
    // Si la respuesta no es exitosa, lanza error
    if (!response.ok) {
      throw new Error('Error al obtener grados');
    }
    
    // Convierte la respuesta a JSON y retorna los grados
    const grados = await response.json();
    return grados;
  } catch (error) {
    // Captura y registra errores, retorna array vacío como fallback
    console.error('Error en cargarGrados:', error);
    return [];
  }
}

/**
 * Renderiza los grados en el select de la interfaz
 * @param {Array} grados - Lista de grados a mostrar
 * @param {number} idProfesor - ID del profesor logueado
 */
function renderGrados(grados, idProfesor) {
  // Obtiene referencia al select de grados
  const selectGrado = document.getElementById('selectGrado');
  
  // Si no hay grados, muestra opción vacía
  if (grados.length === 0) {
    selectGrado.innerHTML = '<option value="">No hay grados asignados</option>';
    return;
  }

  // Limpia y agrega la opción por defecto
  selectGrado.innerHTML = '<option value="">-- Selecciona un grado --</option>';
  
  // Agrega cada grado como una opción al select
  grados.forEach((grado) => {
    const option = document.createElement('option');
    option.value = grado.id_grado; // Valor es el ID del grado
    option.textContent = grado.nombre; // Texto visible es el nombre
    selectGrado.appendChild(option);
  });

  // Configura el manejo de selección de grados
  manejarSeleccionGrado(idProfesor);
}

/**
 * Función principal del componente que se exporta
 * @param {number} idProfesor - ID del profesor logueado
 */
export function DOM(idProfesor) {
  // Obtiene referencia al root y renderiza la estructura base
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="grados-container">
      <h2>Selecciona un Grado</h2>
      <!-- Select para elegir grado -->
      <select id="selectGrado">
        <option value="">-- Selecciona un grado --</option>
      </select>
      <!-- Contenedor para la lista de estudiantes -->
      <div id="listaEstudiantes"></div>
    </div>
  `;

  // Carga los grados y maneja posibles errores
  cargarGrados(idProfesor)
    .then((grados) => {
      renderGrados(grados, idProfesor);
    })
    .catch((error) => {
      console.error('Error al cargar grados:', error);
    });
}

/**
 * Función global para marcar asistencia (disponible en window)
 * @param {number} idEstudiante - ID del estudiante
 * @param {number} idGrado - ID del grado
 * @param {number} idProfesor - ID del profesor
 * @param {boolean} presente - Estado de asistencia (true = presente)
 */
window.marcarAsistencia = async (idEstudiante, idGrado, idProfesor, presente) => {
  try {
    // Realiza petición POST al endpoint de asistencia
    const response = await fetch('http://localhost:3000/asistencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Envía todos los datos necesarios para el registro
      body: JSON.stringify({
        id_estudiante: idEstudiante,
        id_profesor: idProfesor,
        id_grado: idGrado,
        presente: presente,
      }),
    });

    // Procesa la respuesta
    const data = await response.json();
    
    // Muestra feedback al usuario según el resultado
    if (response.ok) {
      alert(`Asistencia marcada: ${presente ? 'Presente' : 'Ausente'}`);
    } else {
      alert('Error al marcar la asistencia');
    }
  } catch (error) {
    // Captura y maneja errores de conexión
    console.error('Error marcando asistencia:', error);
    alert('Error en el servidor');
  }
};