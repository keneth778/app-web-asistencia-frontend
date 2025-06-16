// componentes/graficas/graficas.js

/**
 * Renderiza el modal para mostrar gráficas de asistencia de un estudiante
 */
export function renderGraficasModal(idEstudiante, nombreEstudiante) {
  return `
    <div class="graficas-container" id="graficas-modal-${idEstudiante}">
      <div class="graficas-content">
        <div class="graficas-header">
          <h3 class="graficas-title">Estadísticas de ${nombreEstudiante}</h3>
          <button class="close-graficas" onclick="cerrarGraficasModal(${idEstudiante})">&times;</button>
        </div>
        
        <div class="graficas-body">
          <div class="grafica-container">
            <canvas id="asistencia-chart-${idEstudiante}"></canvas>
          </div>
          
          <div class="grafica-resumen">
            <div class="resumen-item">
              <span class="resumen-label">Asistencias:</span>
              <span class="resumen-value" id="asistencias-${idEstudiante}">0</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Inasistencias:</span>
              <span class="resumen-value" id="inasistencias-${idEstudiante}">0</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Porcentaje:</span>
              <span class="resumen-value" id="porcentaje-${idEstudiante}">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza el modal para mostrar gráficas de asistencia de un grado
 */
export function renderGraficasGradoModal(idGrado, nombreGrado) {
  return `
    <div class="graficas-container" id="graficas-grado-modal-${idGrado}">
      <div class="graficas-content">
        <div class="graficas-header">
          <h3 class="graficas-title">Estadísticas del Grado: ${nombreGrado}</h3>
          <button class="close-graficas" onclick="cerrarGraficasGradoModal(${idGrado})">&times;</button>
        </div>
        
        <div class="graficas-body">
          <div class="grafica-container">
            <canvas id="asistencia-grado-chart-${idGrado}"></canvas>
          </div>
          
          <div class="grafica-resumen">
            <div class="resumen-item">
              <span class="resumen-label">Total Asistencias:</span>
              <span class="resumen-value" id="total-asistencias-${idGrado}">0</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Total Inasistencias:</span>
              <span class="resumen-value" id="total-inasistencias-${idGrado}">0</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-label">Porcentaje Asistencia:</span>
              <span class="resumen-value" id="porcentaje-asistencia-${idGrado}">0%</span>
            </div>
          </div>
          
          <h4>Estadísticas por Alumno:</h4>
          <div class="grafica-container">
            <canvas id="alumnos-chart-${idGrado}"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza el modal para mostrar estadísticas de todos los grados del profesor
 */
export function renderEstadisticasGeneralesModal() {
  return `
    <div class="graficas-container" id="estadisticas-generales-modal">
      <div class="graficas-content">
        <div class="graficas-header">
          <h3 class="graficas-title">Estadísticas Generales</h3>
          <button class="close-graficas" onclick="cerrarEstadisticasGeneralesModal()">&times;</button>
        </div>
        
        <div class="graficas-body">
          <div class="grafica-container">
            <canvas id="estadisticas-generales-chart"></canvas>
          </div>
          
          <div class="grafica-resumen" id="resumen-estadisticas-generales"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Abre el modal de gráficas para un estudiante
 */
window.abrirGraficasModal = async function(idEstudiante, nombreEstudiante) {
  if (!document.getElementById(`graficas-modal-${idEstudiante}`)) {
    document.body.insertAdjacentHTML('beforeend', renderGraficasModal(idEstudiante, nombreEstudiante));
  }
  
  const modal = document.getElementById(`graficas-modal-${idEstudiante}`);
  modal.classList.add('show');
  await cargarDatosYRenderizarGrafica(idEstudiante);
};

/**
 * Abre el modal de gráficas para un grado
 */
window.abrirGraficasGradoModal = async function(idGrado, nombreGrado) {
  if (!document.getElementById(`graficas-grado-modal-${idGrado}`)) {
    document.body.insertAdjacentHTML('beforeend', renderGraficasGradoModal(idGrado, nombreGrado));
  }
  
  const modal = document.getElementById(`graficas-grado-modal-${idGrado}`);
  modal.classList.add('show');
  await cargarDatosYRenderizarGraficaGrado(idGrado);
};

/**
 * Abre el modal de estadísticas generales
 */
window.abrirEstadisticasGenerales = async function(idProfesor) {
  if (!document.getElementById('estadisticas-generales-modal')) {
    document.body.insertAdjacentHTML('beforeend', renderEstadisticasGeneralesModal());
  }
  
  const modal = document.getElementById('estadisticas-generales-modal');
  modal.classList.add('show');
  await cargarDatosYRenderizarEstadisticasGenerales(idProfesor);
};

/**
 * Cierra el modal de gráficas
 */
window.cerrarGraficasModal = function(idEstudiante) {
  const modal = document.getElementById(`graficas-modal-${idEstudiante}`);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * Cierra el modal de gráficas de grado
 */
window.cerrarGraficasGradoModal = function(idGrado) {
  const modal = document.getElementById(`graficas-grado-modal-${idGrado}`);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * Cierra el modal de estadísticas generales
 */
window.cerrarEstadisticasGeneralesModal = function() {
  const modal = document.getElementById('estadisticas-generales-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
};

/**
 * Carga los datos y renderiza la gráfica para un estudiante
 */
async function cargarDatosYRenderizarGrafica(idEstudiante) {
  try {
    const response = await fetch(`http://localhost:3000/asistencia-estudiante/${idEstudiante}`);
    if (!response.ok) throw new Error('Error al obtener datos de asistencia');
    
    const data = await response.json();
    const totalAsistencias = data.filter(a => a.presente).length;
    const totalInasistencias = data.length - totalAsistencias;
    const porcentaje = data.length > 0 ? Math.round((totalAsistencias / data.length) * 100) : 0;
    
    document.getElementById(`asistencias-${idEstudiante}`).textContent = totalAsistencias;
    document.getElementById(`inasistencias-${idEstudiante}`).textContent = totalInasistencias;
    document.getElementById(`porcentaje-${idEstudiante}`).textContent = `${porcentaje}%`;
    
    renderizarGraficaEstudiante(idEstudiante, data);
  } catch (error) {
    console.error('Error cargando datos de asistencia:', error);
    alert('Error al cargar los datos de asistencia');
  }
}

/**
 * Carga los datos y renderiza la gráfica para un grado
 */
async function cargarDatosYRenderizarGraficaGrado(idGrado) {
  try {
    const response = await fetch(`http://localhost:3000/asistencia-grado/${idGrado}`);
    if (!response.ok) throw new Error('Error al obtener datos de asistencia del grado');
    
    const data = await response.json();
    
    document.getElementById(`total-asistencias-${idGrado}`).textContent = data.totalPresentes || 0;
    document.getElementById(`total-inasistencias-${idGrado}`).textContent = data.totalAusentes || 0;
    document.getElementById(`porcentaje-asistencia-${idGrado}`).textContent = `${data.porcentajeAsistencia || 0}%`;
    
    renderizarGraficaGrado(idGrado, data);
    
    if (data.alumnos && data.alumnos.length > 0) {
      renderizarGraficaAlumnos(idGrado, data.alumnos);
    }
  } catch (error) {
    console.error('Error cargando datos de asistencia del grado:', error);
    alert('Error al cargar los datos de asistencia del grado');
  }
}

/**
 * Carga los datos y renderiza las estadísticas generales
 */
async function cargarDatosYRenderizarEstadisticasGenerales(idProfesor) {
  try {
    const response = await fetch(`http://localhost:3000/asistencia-profesor/${idProfesor}`);
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    
    const data = await response.json();
    const totalPresentes = data.reduce((sum, grado) => sum + (grado.total_presentes || 0), 0);
    const totalAusentes = data.reduce((sum, grado) => sum + (grado.total_ausentes || 0), 0);
    const totalRegistros = totalPresentes + totalAusentes;
    const porcentajeGeneral = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;
    
    const resumenDiv = document.getElementById('resumen-estadisticas-generales');
    if (resumenDiv) {
      resumenDiv.innerHTML = `
        <div class="resumen-item">
          <span class="resumen-label">Total Asistencias:</span>
          <span class="resumen-value">${totalPresentes}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-label">Total Inasistencias:</span>
          <span class="resumen-value">${totalAusentes}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-label">Porcentaje General:</span>
          <span class="resumen-value">${porcentajeGeneral}%</span>
        </div>
      `;
    }
    
    renderizarGraficaEstadisticasGenerales(data);
  } catch (error) {
    console.error('Error cargando estadísticas generales:', error);
    alert('Error al cargar las estadísticas generales');
  }
}

/**
 * Renderiza la gráfica de asistencia para un estudiante
 */
function renderizarGraficaEstudiante(idEstudiante, data) {
  const ctx = document.getElementById(`asistencia-chart-${idEstudiante}`);
  if (ctx.chart) ctx.chart.destroy();

  const asistenciaPorMes = {};
  data.forEach(item => {
    const fecha = new Date(item.fecha);
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    const clave = `${año}-${mes.toString().padStart(2, '0')}`;
    
    if (!asistenciaPorMes[clave]) {
      asistenciaPorMes[clave] = { presentes: 0, total: 0 };
    }
    
    asistenciaPorMes[clave].total++;
    if (item.presente) asistenciaPorMes[clave].presentes++;
  });
  
  const meses = Object.keys(asistenciaPorMes).sort();
  const porcentajes = meses.map(mes => {
    const { presentes, total } = asistenciaPorMes[mes];
    return Math.round((presentes / total) * 100);
  });
  
  ctx.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Porcentaje de asistencia',
        data: porcentajes,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentaje de asistencia' } },
        x: { title: { display: true, text: 'Mes' } }
      }
    }
  });
}

/**
 * Renderiza la gráfica de asistencia general del grado
 */
function renderizarGraficaGrado(idGrado, data) {
  const ctx = document.getElementById(`asistencia-grado-chart-${idGrado}`);
  if (ctx.chart) ctx.chart.destroy();
  
  ctx.chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Presentes', 'Ausentes'],
      datasets: [{
        data: [data.totalPresentes, data.totalAusentes],
        backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'],
        borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Asistencia General - ${data.nombreGrado}`, font: { size: 16 } },
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Renderiza la gráfica de asistencia por alumnos
 */
function renderizarGraficaAlumnos(idGrado, alumnos) {
  const ctx = document.getElementById(`alumnos-chart-${idGrado}`);
  if (ctx.chart) ctx.chart.destroy();
  
  alumnos.sort((a, b) => (b.porcentajeAsistencia || 0) - (a.porcentajeAsistencia || 0));
  
  const labels = alumnos.map(alumno => alumno.nombre);
  const data = alumnos.map(alumno => alumno.porcentajeAsistencia || 0);
  const backgroundColors = alumnos.map(alumno => {
    const porcentaje = alumno.porcentajeAsistencia || 0;
    if (porcentaje >= 80) return 'rgba(40, 167, 69, 0.7)';
    if (porcentaje >= 50) return 'rgba(255, 193, 7, 0.7)';
    return 'rgba(220, 53, 69, 0.7)';
  });
  
  ctx.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Porcentaje de Asistencia',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentaje de Asistencia' } }
      },
      plugins: {
        title: { display: true, text: 'Asistencia por Alumno', font: { size: 16 } },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const alumno = alumnos[context.dataIndex];
              return `Presentes: ${alumno.totalPresentes || 0}\nAusentes: ${alumno.totalAusentes || 0}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Renderiza la gráfica de estadísticas generales
 */
function renderizarGraficaEstadisticasGenerales(data) {
  const ctx = document.getElementById('estadisticas-generales-chart');
  if (ctx.chart) ctx.chart.destroy();
  
  const labels = data.map(grado => grado.nombre_grado);
  const porcentajes = data.map(grado => grado.porcentaje_asistencia || 0);
  const backgroundColors = porcentajes.map(p => {
    if (p >= 80) return 'rgba(40, 167, 69, 0.7)';
    if (p >= 50) return 'rgba(255, 193, 7, 0.7)';
    return 'rgba(220, 53, 69, 0.7)';
  });
  
  ctx.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Porcentaje de Asistencia por Grado',
        data: porcentajes,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentaje de Asistencia' } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const grado = data[context.dataIndex];
              return `Presentes: ${grado.total_presentes || 0}\nAusentes: ${grado.total_ausentes || 0}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Inicialización del componente
 */
export function initGraficas() {
  // No necesitamos hacer nada aquí, ya que las funciones están en window
}