import { renderLogin } from './componentes/login/login.js';
import { renderRegistro } from './componentes/registro/registro.js';

function DOM() {
  const root = document.getElementById('root');
  let idProfesorActual = null;
  let idGradoActual = null;

  function navigate(page, data = {}) {
    if (page === 'login') {
      renderLogin();
    } else if (page === 'registro') {
      renderRegistro();
    } else if (page === 'grados') {
      idProfesorActual = data.idProfesor;
      renderGrados(data.idProfesor);
    }
  }

  async function renderGrados(idProfesor) {
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
      const response = await fetch(`http://localhost:3000/grados/${idProfesor}`);
      if (!response.ok) throw new Error('Error al obtener grados');
      
      const grados = await response.json();

      if (grados.length === 0) {
        listaEstudiantes.innerHTML = `
          <p>No hay grados asignados.</p>
          <button id="btnAsignarGrados">Asignar Grados y Alumnos Iniciales</button>
        `;
        
        document.getElementById('btnAsignarGrados').addEventListener('click', async () => {
          try {
            const response = await fetch('http://localhost:3000/asignar-grados-iniciales', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_profesor: idProfesor })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al asignar');
            
            alert(`Se crearon ${data.grados_creados || 3} grados con ${data.alumnos_creados || 9} alumnos totales`);
            renderGrados(idProfesor);
          } catch (error) {
            console.error('Error:', error);
            alert(error.message);
          }
        });
        return;
      }

      grados.forEach((grado) => {
        const option = document.createElement('option');
        option.value = grado.id_grado;
        option.textContent = grado.nombre;
        selectGrado.appendChild(option);
      });

      selectGrado.addEventListener('change', async (e) => {
        idGradoActual = e.target.value;
        if (!idGradoActual) return;

        const estudiantes = await consultarAlumnosBackend(idGradoActual);
        cargarAlumnos(estudiantes, idGradoActual, idProfesor);
      });
    } catch (error) {
      console.error('Error obteniendo grados:', error);
      listaEstudiantes.innerHTML = '<p>Error al cargar los grados.</p>';
    }
  }

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

      alert(`Asistencia registrada: ${presente ? 'Presente' : 'Ausente'}`);
      const estudiantes = await consultarAlumnosBackend(idGrado);
      cargarAlumnos(estudiantes, idGrado, idProfesor);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  window.addEventListener('navigate', (e) => {
    navigate(e.detail.page, e.detail.data);
  });

  window.addEventListener('loginExitoso', (e) => {
    navigate('grados', { idProfesor: e.detail.idProfesor });
  });

  window.addEventListener('DOMContentLoaded', () => {
    navigate('login');
  });
}

DOM();