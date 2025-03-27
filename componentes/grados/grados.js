// componentes/grados/grados.js
import { asistenciaAlumnos, AusenciaAlumnos } from '../funcionesAsistencia/asistencia.js';

// Función para consultar los alumnos desde el backend
async function consultarAlumnosBackend(idGrado) {
  try {
    const response = await fetch(`http://localhost:3000/estudiantes/${idGrado}`);
    if (!response.ok) {
      throw new Error('Error al obtener estudiantes');
    }
    const estudiantes = await response.json();
    return estudiantes;
  } catch (error) {
    console.error('Error en consultarAlumnosBackend:', error);
    return [];
  }
}

// Función para cargar los alumnos en la interfaz
function cargarAlumnos(estudiantes, idGrado, idProfesor) {
  const listaEstudiantes = document.getElementById('listaEstudiantes');
  if (estudiantes.length === 0) {
    listaEstudiantes.innerHTML = '<p>No hay estudiantes en este grado.</p>';
    return;
  }

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

// Función para renderizar la lista de alumnos
async function renderAlumnos(idGrado, idProfesor) {
  const estudiantes = await consultarAlumnosBackend(idGrado);
  cargarAlumnos(estudiantes, idGrado, idProfesor);
}

// Función para manejar la selección de grados
function manejarSeleccionGrado(idProfesor) {
  const selectGrado = document.getElementById('selectGrado');
  selectGrado.addEventListener('change', async (e) => {
    const idGrado = e.target.value;
    if (!idGrado) return;
    await renderAlumnos(idGrado, idProfesor);
  });
}

// Función para cargar los grados desde el backend
async function cargarGrados(idProfesor) {
  try {
    const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
    if (!response.ok) {
      throw new Error('Error al obtener grados');
    }
    const grados = await response.json();
    return grados;
  } catch (error) {
    console.error('Error en cargarGrados:', error);
    return [];
  }
}

// Función para renderizar los grados en la interfaz
function renderGrados(grados, idProfesor) {
  const selectGrado = document.getElementById('selectGrado');
  if (grados.length === 0) {
    selectGrado.innerHTML = '<option value="">No hay grados asignados</option>';
    return;
  }

  selectGrado.innerHTML = '<option value="">-- Selecciona un grado --</option>';
  grados.forEach((grado) => {
    const option = document.createElement('option');
    option.value = grado.id_grado;
    option.textContent = grado.nombre;
    selectGrado.appendChild(option);
  });

  manejarSeleccionGrado(idProfesor);
}

// Función principal que se exporta
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

  // Cargar y renderizar los grados
  cargarGrados(idProfesor)
    .then((grados) => {
      renderGrados(grados, idProfesor);
    })
    .catch((error) => {
      console.error('Error al cargar grados:', error);
    });
}

// Función para marcar asistencia (global)
window.marcarAsistencia = async (idEstudiante, idGrado, idProfesor, presente) => {
  try {
    const response = await fetch('http://localhost:3000/asistencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_estudiante: idEstudiante,
        id_profesor: idProfesor,
        id_grado: idGrado,
        presente: presente,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(`Asistencia marcada: ${presente ? 'Presente' : 'Ausente'}`);
    } else {
      alert('Error al marcar la asistencia');
    }
  } catch (error) {
    console.error('Error marcando asistencia:', error);
    alert('Error en el servidor');
  }
};