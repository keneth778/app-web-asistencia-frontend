// Importa los componentes de las vistas
import { renderLogin } from './componentes/login/login.js';
import { renderRegistro } from './componentes/registro/registro.js';

/**
 * Función principal que configura el enrutamiento y estado de la aplicación
 */
function DOM() {
  // Obtiene el elemento raíz y define variables de estado
  const root = document.getElementById('root');
  let idProfesorActual = null; // Almacena el ID del profesor logueado
  let idGradoActual = null;    // Almacena el grado seleccionado

  /**
   * Función de navegación entre vistas
   * @param {string} page - Página a navegar ('login', 'registro' o 'grados')
   * @param {object} data - Datos adicionales para la vista
   */
  function navigate(page, data = {}) {
    if (page === 'login') {
      renderLogin(); // Renderiza componente de login
    } else if (page === 'registro') {
      renderRegistro(); // Renderiza componente de registro
    } else if (page === 'grados') {
      idProfesorActual = data.idProfesor; // Guarda el ID del profesor
      renderGrados(data.idProfesor); // Renderiza vista de grados
    }
  }

  /**
   * Renderiza la vista de grados y estudiantes
   * @param {number} idProfesor - ID del profesor actual
   */
  async function renderGrados(idProfesor) {
    // Renderiza la estructura base
    root.innerHTML = `
      <div class="grados-container">
        <h2>Selecciona un Grado</h2>
        <select id="selectGrado">
          <option value="">-- Selecciona un grado --</option>
        </select>
        <div id="listaEstudiantes"></div>
      </div>
    `;

    const selectGrado = document.getElementById('selectGrado');
    const listaEstudiantes = document.getElementById('listaEstudiantes');

    try {
      // Obtiene los grados del profesor desde el backend
      const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
      if (!response.ok) throw new Error('Error al obtener grados');
      
      const grados = await response.json();

      // Si no hay grados asignados
      if (grados.length === 0) {
        listaEstudiantes.innerHTML = `
          <p>No hay grados asignados.</p>
          <button id="btnAsignarGrados">Asignar Grados y Alumnos Iniciales</button>
        `;
        
        // Configura el botón para asignar grados iniciales
        document.getElementById('btnAsignarGrados').addEventListener('click', async () => {
          try {
            const response = await fetch('http://localhost:3000/asignar-grados-iniciales', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_profesor: idProfesor })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al asignar');
            
            // Muestra feedback y recarga la vista
            alert(`Se crearon ${data.grados_creados || 3} grados con ${data.alumnos_creados || 9} alumnos totales`);
            renderGrados(idProfesor);
          } catch (error) {
            console.error('Error:', error);
            alert(error.message);
          }
        });
        return;
      }

      // Llena el select con los grados disponibles
      grados.forEach((grado) => {
        const option = document.createElement('option');
        option.value = grado.id_grado;
        option.textContent = grado.nombre;
        selectGrado.appendChild(option);
      });

      // Configura el evento para cuando cambia la selección
      selectGrado.addEventListener('change', async (e) => {
        idGradoActual = e.target.value;
        if (!idGradoActual) return;

        // Carga los estudiantes del grado seleccionado
        const estudiantes = await consultarAlumnosBackend(idGradoActual);
        cargarAlumnos(estudiantes, idGradoActual, idProfesor);
      });
    } catch (error) {
      console.error('Error obteniendo grados:', error);
      listaEstudiantes.innerHTML = '<p>Error al cargar los grados.</p>';
    }
  }

  /**
   * Consulta los estudiantes de un grado específico
   * @param {number} idGrado - ID del grado a consultar
   * @returns {Promise<Array>} Lista de estudiantes
   */
  async function consultarAlumnosBackend(idGrado) {
    try {
      const response = await fetch(`http://localhost:3000/estudiantes/${idGrado}`);
      if (!response.ok) throw new Error('Error al obtener estudiantes');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return []; // Retorna array vacío en caso de error
    }
  }

  /**
   * Renderiza la lista de estudiantes en la interfaz
   * @param {Array} estudiantes - Lista de estudiantes
   * @param {number} idGrado - ID del grado actual
   * @param {number} idProfesor - ID del profesor
   */
  function cargarAlumnos(estudiantes, idGrado, idProfesor) {
    const listaEstudiantes = document.getElementById('listaEstudiantes');
    
    if (estudiantes.length === 0) {
      listaEstudiantes.innerHTML = '<p>No hay estudiantes en este grado.</p>';
      return;
    }

    // Genera el HTML con la lista de estudiantes y botones de asistencia
    listaEstudiantes.innerHTML = `
      <h3>Estudiantes</h3>
      <ul>
        ${estudiantes.map((estudiante) => `
          <li>
            <span>${estudiante.nombre}</span>
            <button onclick="marcarAsistencia(${estudiante.id_estudiante}, ${idGrado}, ${idProfesor}, true)">Presente</button>
            <button onclick="marcarAsistencia(${estudiante.id_estudiante}, ${idGrado}, ${idProfesor}, false)">Ausente</button>
          </li>
        `).join('')}
      </ul>
    `;
  }

  /**
   * Función global para registrar asistencia
   * @param {number} idEstudiante - ID del estudiante
   * @param {number} idGrado - ID del grado
   * @param {number} idProfesor - ID del profesor
   * @param {boolean} presente - Estado de asistencia
   */
  window.marcarAsistencia = async (idEstudiante, idGrado, idProfesor, presente) => {
    try {
      const response = await fetch('http://localhost:3000/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: idEstudiante,
          id_profesor: idProfesor,
          id_grado: idGrado,
          presente: presente
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al marcar asistencia');
      }

      // Muestra feedback y recarga la lista de estudiantes
      alert(`Asistencia registrada: ${presente ? 'Presente' : 'Ausente'}`);
      const estudiantes = await consultarAlumnosBackend(idGrado);
      cargarAlumnos(estudiantes, idGrado, idProfesor);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  // =============================================
  // CONFIGURACIÓN DE EVENT LISTENERS GLOBALES
  // =============================================

  // Escucha eventos de navegación (disparados por otros componentes)
  window.addEventListener('navigate', (e) => {
    navigate(e.detail.page, e.detail.data);
  });

  // Escucha eventos de login exitoso
  window.addEventListener('loginExitoso', (e) => {
    navigate('grados', { idProfesor: e.detail.idProfesor });
  });

  // Inicia la aplicación mostrando el login al cargar la página
  window.addEventListener('DOMContentLoaded', () => {
    navigate('login');
  });
}

// Inicializa la aplicación
DOM();