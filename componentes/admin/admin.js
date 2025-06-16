// componentes/admin/admin.js
import { renderCoordinador } from '../coordinador/coordinador.js';
import { renderAgregarAlumno } from '../agregarAlumno/agregarAlumno.js';
import { renderBotonEliminar } from '../eliminarAlumno/eliminarAlumno.js';
import { DOM as gradosDOM } from '../grados/grados.js';

//admin.js
export function renderAdminDashboard() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="admin-container">
      <div class="admin-header">
        <h1 class="admin-title">Panel del Administrador</h1>
        <div class="admin-actions">
          <button class="btn-agregar-coordinador" id="btnAgregarCoordinador">
            + Agregar Coordinador
          </button>
          <button class="btn-agregar-profesor" id="btnAgregarProfesor">
            + Agregar Profesor
          </button>
        </div>
      </div>
      <!-- Sección de Horario de Asistencia -->
<div class="admin-section">
  <h2>Horario de Asistencia</h2>
  <div id="horarioContainer">
    <div class="horario-form">
      <label for="horaInicio">Hora de inicio:</label>
      <input type="time" id="horaInicio" required>
      
      <label for="horaFin">Hora de fin:</label>
      <input type="time" id="horaFin" required>
      
      <button class="btn-establecer-horario" id="btnEstablecerHorario">
        Establecer Horario
      </button>
    </div>
    <div id="horarioActual"></div>
  </div>
</div>

      <!-- Sección de Coordinadores -->
      <div class="admin-section">
        <h2>Coordinadores</h2>
        <div id="coordinadoresContainer"></div>
      </div>
      
      <!-- Sección de Profesores -->
      <div class="admin-section">
        <h2>Profesores</h2>
        <div id="profesoresContainer"></div>
      </div>
      
      <!-- Modal para agregar coordinador -->
      <div class="modal-agregar-coordinador" id="modalAgregarCoordinador">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Agregar Nuevo Coordinador</h2>
            <button class="close-modal" data-modal="coordinador">&times;</button>
          </div>
          <form id="formAgregarCoordinador">
            <div class="form-group">
              <label for="nombreCoordinador">Nombre Completo</label>
              <input type="text" id="nombreCoordinador" required>
            </div>
            <div class="form-group">
              <label for="emailCoordinador">Correo Electrónico</label>
              <input type="email" id="emailCoordinador" required>
            </div>
            <div class="form-group">
              <label for="passwordCoordinador">Contraseña</label>
              <input type="password" id="passwordCoordinador" required>
            </div>
            <button type="submit" class="btn-submit">Agregar Coordinador</button>
          </form>
        </div>
      </div>
      
      <!-- Modal para agregar profesor -->
      <div class="modal-agregar-profesor" id="modalAgregarProfesor">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Agregar Nuevo Profesor</h2>
            <button class="close-modal" data-modal="profesor">&times;</button>
          </div>
          <form id="formAgregarProfesor">
            <div class="form-group">
              <label for="nombreProfesor">Nombre Completo</label>
              <input type="text" id="nombreProfesor" required>
            </div>
            <div class="form-group">
              <label for="emailProfesor">Correo Electrónico</label>
              <input type="email" id="emailProfesor" required>
            </div>
            <div class="form-group">
              <label for="passwordProfesor">Contraseña</label>
              <input type="password" id="passwordProfesor" required>
            </div>
            <button type="submit" class="btn-submit">Agregar Profesor</button>
          </form>
        </div>
      </div>
    </div>
  `;

  cargarCoordinadores();
  cargarProfesores();
  configurarEventos();
}

async function configurarHorarioAsistencia() {
  document.getElementById('btnEstablecerHorario').addEventListener('click', async () => {
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    
    if (!horaInicio || !horaFin) {
      alert('Por favor completa ambos horarios');
      return;
    }

    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/establecer-horario-asistencia', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluir el token de autenticación
        },
        body: JSON.stringify({
          hora_inicio: horaInicio,
          hora_fin: horaFin
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al establecer horario');
      }

      alert('Horario establecido correctamente');
      cargarHorarioActual();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  });
}
async function cargarHorarioActual() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/horario-asistencia', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const horario = await response.json();
    
    const container = document.getElementById('horarioActual');
    // ... resto del código igual
  } catch (error) {
    console.error('Error cargando horario:', error);
    document.getElementById('horarioActual').innerHTML = `
      <div class="alert alert-danger">
        Error al cargar el horario: ${error.message}
      </div>
    `;
  }
}

async function cargarCoordinadores() {
  try {
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/coordinadores');
    if (!response.ok) throw new Error('Error al obtener coordinadores');
    const coordinadores = await response.json();
    renderCoordinadores(coordinadores);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('coordinadoresContainer').innerHTML = `
      <div class="error">Error al cargar los coordinadores: ${error.message}</div>
    `;
  }
}

async function cargarProfesores() {
  try {
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/profesores');
    if (!response.ok) throw new Error('Error al obtener profesores');
    const profesores = await response.json();
    renderProfesores(profesores);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('profesoresContainer').innerHTML = `
      <div class="error">Error al cargar los profesores: ${error.message}</div>
    `;
  }
}

function renderCoordinadores(coordinadores) {
  const container = document.getElementById('coordinadoresContainer');
  
  if (coordinadores.length === 0) {
    container.innerHTML = '<p>No hay coordinadores registrados.</p>';
    return;
  }

  container.innerHTML = `
    <div class="coordinadores-grid">
      ${coordinadores.map(coordinador => `
        <div class="coordinador-card" data-id="${coordinador.id_coordinador}">
          <div class="coordinador-header">
            <h3 class="coordinador-nombre">${coordinador.nombre}</h3>
            <button class="btn-eliminar-coordinador" data-id="${coordinador.id_coordinador}">
              Eliminar
            </button>
          </div>
          <p>Email: ${coordinador.email}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderProfesores(profesores) {
  const container = document.getElementById('profesoresContainer');
  
  if (profesores.length === 0) {
    container.innerHTML = '<p>No hay profesores registrados.</p>';
    return;
  }

  container.innerHTML = `
    <div class="profesores-grid">
      ${profesores.map(profesor => `
        <div class="profesor-card" data-id="${profesor.id_profesor}">
          <div class="profesor-header">
            <h3 class="profesor-nombre">${profesor.nombre}</h3>
            <div>
              <button class="btn-ver-grados" data-id="${profesor.id_profesor}">
                Ver Grados
              </button>
              <button class="btn-eliminar-profesor" data-id="${profesor.id_profesor}">
                Eliminar
              </button>
            </div>
          </div>
          <p>Email: ${profesor.email}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function configurarEventos() {
  // Agregar coordinador
  const btnAgregarCoordinador = document.getElementById('btnAgregarCoordinador');
  const modalCoordinador = document.getElementById('modalAgregarCoordinador');
  const formCoordinador = document.getElementById('formAgregarCoordinador');
  
  btnAgregarCoordinador.addEventListener('click', () => {
    modalCoordinador.style.display = 'flex';
  });
  
  formCoordinador.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreCoordinador').value.trim();
    const email = document.getElementById('emailCoordinador').value.trim();
    const password = document.getElementById('passwordCoordinador').value;
    
    try {
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/coordinadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al agregar coordinador');
      }
      
      modalCoordinador.style.display = 'none';
      formCoordinador.reset();
      cargarCoordinadores();
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  
  // Agregar profesor
  const btnAgregarProfesor = document.getElementById('btnAgregarProfesor');
  const modalProfesor = document.getElementById('modalAgregarProfesor');
  const formProfesor = document.getElementById('formAgregarProfesor');
  
  btnAgregarProfesor.addEventListener('click', () => {
    modalProfesor.style.display = 'flex';
  });
  
  formProfesor.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreProfesor').value.trim();
    const email = document.getElementById('emailProfesor').value.trim();
    const password = document.getElementById('passwordProfesor').value;
    
    try {
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al agregar profesor');
      }
      
      modalProfesor.style.display = 'none';
      formProfesor.reset();
      cargarProfesores();
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  
  // Cerrar modales
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalType = this.getAttribute('data-modal');
      const modalId = `modalAgregar${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Cerrar modales haciendo clic fuera del contenido
  document.querySelectorAll('.modal-agregar-coordinador, .modal-agregar-profesor').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });
  
  // Delegación de eventos
  document.addEventListener('click', async (e) => {
    // Eliminar coordinador
    if (e.target.classList.contains('btn-eliminar-coordinador')) {
      const idCoordinador = e.target.dataset.id;
      if (confirm('¿Estás seguro de eliminar este coordinador?')) {
        await eliminarCoordinador(idCoordinador);
      }
    }
    
    // Eliminar profesor
    if (e.target.classList.contains('btn-eliminar-profesor')) {
      const idProfesor = e.target.dataset.id;
      if (confirm('¿Estás seguro de eliminar este profesor?')) {
        await eliminarProfesor(idProfesor);
      }
    }
    
    // Ver grados de profesor
    if (e.target.classList.contains('btn-ver-grados')) {
      const idProfesor = e.target.dataset.id;
      gradosDOM(idProfesor, true); // Modo administrador
    }
  });
    configurarHorarioAsistencia();
  cargarHorarioActual();
}

async function eliminarCoordinador(idCoordinador) {
  try {
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/coordinadores/${idCoordinador}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar coordinador');
    }
    
    cargarCoordinadores();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function eliminarProfesor(idProfesor) {
  try {
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/profesores/${idProfesor}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar profesor');
    }
    
    cargarProfesores();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

export function initAdmin() {
  renderAdminDashboard();
}