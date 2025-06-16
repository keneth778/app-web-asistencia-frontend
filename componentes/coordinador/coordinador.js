// componentes/coordinador/coordinador.js
import { renderAgregarAlumno } from '../agregarAlumno/agregarAlumno.js';
import { renderBotonEliminar, configurarEliminarAlumno } from '../eliminarAlumno/eliminarAlumno.js';
import { DOM as gradosDOM } from '../grados/grados.js';

/**
 * Renderiza el dashboard del coordinador
 */
export function renderCoordinador() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="coordinador-container">
      <div class="coordinador-header">
        <h1 class="coordinador-title">Panel del Coordinador</h1>
        <button class="btn-agregar-profesor" id="btnAgregarProfesor">
          + Agregar Profesor
        </button>
      </div>
      <div id="profesoresContainer"></div>
      
      <!-- Modal para agregar profesor -->
      <div class="modal-agregar-profesor" id="modalAgregarProfesor">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Agregar Nuevo Profesor</h2>
            <button class="close-modal">&times;</button>
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

  
  renderGraficaCumplimiento();
  // Cargar lista de profesores
  cargarProfesores();

  // Configurar eventos
  configurarEventos();
}
async function renderGraficaCumplimiento() {
  try {
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/asistencia-profesores');
    if (!response.ok) throw new Error('Error al obtener datos');
    const data = await response.json();

    const container = document.createElement('div');
    container.className = 'grafica-cumplimiento-container';
    container.innerHTML = `
      <h2>Cumplimiento de Asistencia por Profesor</h2>
      <div class="grafica-container">
        <canvas id="grafica-cumplimiento"></canvas>
      </div>
    `;

    document.querySelector('.coordinador-container').appendChild(container);

    // Espera a que el canvas esté en el DOM
    setTimeout(() => {
      const ctx = document.getElementById('grafica-cumplimiento').getContext('2d');
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(prof => prof.nombre_profesor),
          datasets: [{
            label: 'Porcentaje de Cumplimiento',
            data: data.map(prof => prof.porcentaje_cumplimiento || 0),
            backgroundColor: data.map(prof => {
              const porcentaje = prof.porcentaje_cumplimiento || 0;
              return porcentaje > 80 ? 'rgba(40, 167, 69, 0.7)' :
                     porcentaje > 50 ? 'rgba(255, 193, 7, 0.7)' :
                                      'rgba(220, 53, 69, 0.7)';
            }),
            borderColor: data.map(prof => {
              const porcentaje = prof.porcentaje_cumplimiento || 0;
              return porcentaje > 80 ? 'rgba(40, 167, 69, 1)' :
                     porcentaje > 50 ? 'rgba(255, 193, 7, 1)' :
                                      'rgba(220, 53, 69, 1)';
            }),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Porcentaje de Cumplimiento'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Profesores'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  const prof = data[context.dataIndex];
                  return `
Grados: ${prof.grados_asignados}
Estudiantes: ${prof.estudiantes_asignados}
Días con registros: ${prof.dias_con_registros}
Total registros: ${prof.total_registros}
                  `;
                }
              }
            }
          }
        }
      });
    }, 100);
  } catch (error) {
    console.error('Error:', error);
    const container = document.querySelector('.coordinador-container');
    container.insertAdjacentHTML('beforeend', `
      <div class="error-grafica">
        Error al cargar la gráfica de cumplimiento: ${error.message}
      </div>
    `);
  }
}

/**
 * Carga la lista de profesores desde el backend
 */
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

/**
 * Renderiza la lista de profesores
 */
// Actualiza la función renderProfesores en coordinador.js
async function renderProfesores(profesores) {
  const container = document.getElementById('profesoresContainer');
  
  if (profesores.length === 0) {
    container.innerHTML = '<p>No hay profesores registrados.</p>';
    return;
  }

  let html = '<div class="profesores-grid">';
  
  // Para cada profesor, obtener sus grados
  for (const profesor of profesores) {
    const grados = await obtenerGradosProfesor(profesor.id_profesor);
    
    html += `
      <div class="profesor-card" data-id="${profesor.id_profesor}">
        <div class="profesor-header">
          <h3 class="profesor-nombre">${profesor.nombre}</h3>
          <button class="btn-eliminar-profesor" data-id="${profesor.id_profesor}">
            Eliminar
          </button>
        </div>
        <p>Email: ${profesor.email}</p>
        <div class="grados-list">
          <h4>Grados asignados:</h4>
          ${grados.length > 0 ? 
            grados.map(grado => `
              <div class="grado-item">
                <span>${grado.nombre}</span>
                <button class="btn-tomar-asistencia" 
                  data-id-grado="${grado.id_grado}"
                  data-id-profesor="${profesor.id_profesor}">
                  Tomar Asistencia
                </button>
              </div>
            `).join('') : 
            '<p>No tiene grados asignados</p>'}
        </div>
        <div class="agregar-grado-container">
          <input type="text" id="nuevo-grado-${profesor.id_profesor}" 
            placeholder="Nombre del nuevo grado">
          <button class="btn-agregar-grado" 
            onclick="agregarGradoAProfesor(${profesor.id_profesor})">
            Agregar Grado
          </button>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Agregar esta función al objeto window
window.agregarGradoAProfesor = async function(idProfesor) {
  const inputGrado = document.getElementById(`nuevo-grado-${idProfesor}`);
  const nombreGrado = inputGrado.value.trim();
  
  if (!nombreGrado) {
    alert('Por favor ingresa un nombre para el grado');
    return;
  }

  try {
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/asignar-grado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_grado: nombreGrado,
        id_profesor: idProfesor
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al agregar grado');
    }

    // Recargar la lista de profesores
    cargarProfesores();
    mostrarMensajeExito('Grado agregado correctamente');

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
};

// Función para mostrar mensajes de éxito
function mostrarMensajeExito(mensaje) {
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-exito-temporal';
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
 * Obtiene los grados de un profesor
 */
  async function obtenerGradosProfesor(idProfesor) {
    try {
      const response = await fetch(`https://app-web-asistencia-backend.onrender.com/grados/${idProfesor}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo grados:', error);
      return [];
    }
  }

/**
 * Configura los event listeners
 */
function configurarEventos() {
  // Modal para agregar profesor
  const btnAgregar = document.getElementById('btnAgregarProfesor');
  const modal = document.getElementById('modalAgregarProfesor');
  const closeModal = document.querySelector('.close-modal');
  const form = document.getElementById('formAgregarProfesor');
  
  btnAgregar.addEventListener('click', () => {
    modal.style.display = 'flex';
  });
  
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Formulario para agregar profesor
// En coordinador.js, modifica el event listener del formulario de agregar profesor
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById('nombreProfesor').value.trim();
  const email = document.getElementById('emailProfesor').value.trim();
  const password = document.getElementById('passwordProfesor').value;
  
  try {
    // 1. Registrar al profesor
    const response = await fetch('https://app-web-asistencia-backend.onrender.com/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al agregar profesor');
    }
    
    const data = await response.json();
    const idProfesor = data.id_profesor;
    
    // 2. Asignar grados iniciales
    const gradosIniciales = ['Primero', 'Segundo', 'Tercero'];
    
    for (const nombreGrado of gradosIniciales) {
      await fetch('https://app-web-asistencia-backend.onrender.com/asignar-grado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_grado: nombreGrado,
          id_profesor: idProfesor
        })
      });
    }
    
    // Cerrar modal y recargar lista
    modal.style.display = 'none';
    form.reset();
    cargarProfesores();
    mostrarMensajeExito('Profesor agregado con 3 grados iniciales');
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});
  
  // Delegación de eventos para los botones dinámicos
  document.addEventListener('click', async (e) => {
    // Eliminar profesor
    if (e.target.classList.contains('btn-eliminar-profesor')) {
      const idProfesor = e.target.dataset.id;
      if (confirm('¿Estás seguro de eliminar este profesor?')) {
        await eliminarProfesor(idProfesor);
      }
    }
    
    // Tomar asistencia
    if (e.target.classList.contains('btn-tomar-asistencia')) {
      const idGrado = e.target.dataset.idGrado;
      const idProfesor = e.target.dataset.idProfesor;
      tomarAsistencia(idGrado, idProfesor);
    }
  });
}

/**
 * Elimina un profesor
 */
async function eliminarProfesor(idProfesor) {
  try {
    const response = await fetch(`https://app-web-asistencia-backend.onrender.com/profesores/${idProfesor}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar profesor');
    }
    
    // Recargar lista
    cargarProfesores();
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Redirige a la vista de tomar asistencia
 */
function tomarAsistencia(idGrado, idProfesor) {
  // Usamos el mismo componente de grados pero con permisos de coordinador
  gradosDOM(idProfesor, true); // true indica que es coordinador
}


/**
 * Configuración inicial del coordinador
 */
export function initCoordinador() {
  renderCoordinador();
}