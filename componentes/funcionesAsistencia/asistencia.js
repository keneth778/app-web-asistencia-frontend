// componentes/funcionesAsistencia/asistencia.js

// Función para marcar la ausencia de un alumno
function AusenciaAlumnos(idEstudiante) {
  return fetch('http://localhost:3000/asistencia', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          id_estudiante: idEstudiante,
          presente: false,
      }),
  })
  .then((response) => {
      if (response.ok) {
          actualizarEstadoVisual(idEstudiante, false);
          return true;
      }
      throw new Error('Error al marcar la ausencia');
  })
  .catch((error) => {
      console.error('Error marcando ausencia:', error);
      return false;
  });
}

// Función para marcar la asistencia de un alumno
function asistenciaAlumnos(idEstudiante) {
  return fetch('http://localhost:3000/asistencia', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          id_estudiante: idEstudiante,
          presente: true,
      }),
  })
  .then((response) => {
      if (response.ok) {
          actualizarEstadoVisual(idEstudiante, true);
          return true;
      }
      throw new Error('Error al marcar la asistencia');
  })
  .catch((error) => {
      console.error('Error marcando asistencia:', error);
      return false;
  });
}

// Función para actualizar la interfaz visual
function actualizarEstadoVisual(idEstudiante, presente) {
  const item = document.querySelector(`li[data-id="${idEstudiante}"]`);
  const btnPresente = item.querySelector('.btn-marcar-presente');
  const btnAusente = item.querySelector('.btn-marcar-ausente');

  // Resetear clases
  item.classList.remove('estudiante-marcado-presente', 'estudiante-marcado-ausente');
  btnPresente.classList.remove('estado-presente');
  btnAusente.classList.remove('estado-ausente');

  // Aplicar nuevo estado
  if (presente) {
      item.classList.add('estudiante-marcado-presente');
      btnPresente.classList.add('estado-presente');
  } else {
      item.classList.add('estudiante-marcado-ausente');
      btnAusente.classList.add('estado-ausente');
  }
}

export { AusenciaAlumnos, asistenciaAlumnos };