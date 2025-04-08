/**
 * Función para marcar la ausencia de un alumno en el sistema
 * @param {number} idEstudiante - ID del estudiante a marcar como ausente
 * @returns {Promise<boolean>} Retorna true si fue exitoso, false si hubo error
 */
function AusenciaAlumnos(idEstudiante) {
    // Realiza una petición POST al endpoint de asistencia
    return fetch('http://localhost:3000/asistencia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indica que enviamos datos JSON
        },
        // Cuerpo de la petición con los datos del estudiante y estado (ausente)
        body: JSON.stringify({
            id_estudiante: idEstudiante,
            presente: false, // false indica ausencia
        }),
    })
    .then((response) => {
        // Si la respuesta es exitosa (status 200-299)
        if (response.ok) {
            // Actualiza la interfaz visual para reflejar la ausencia
            actualizarEstadoVisual(idEstudiante, false);
            return true; // Retorna éxito
        }
        // Si hay error en la respuesta, lanza excepción
        throw new Error('Error al marcar la ausencia');
    })
    .catch((error) => {
        // Captura y registra cualquier error en la operación
        console.error('Error marcando ausencia:', error);
        return false; // Retorna fallo
    });
  }
  
  /**
   * Función para marcar la asistencia de un alumno en el sistema
   * @param {number} idEstudiante - ID del estudiante a marcar como presente
   * @returns {Promise<boolean>} Retorna true si fue exitoso, false si hubo error
   */
  function asistenciaAlumnos(idEstudiante) {
    // Realiza una petición POST al endpoint de asistencia
    return fetch('http://localhost:3000/asistencia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indica que enviamos datos JSON
        },
        // Cuerpo de la petición con los datos del estudiante y estado (presente)
        body: JSON.stringify({
            id_estudiante: idEstudiante,
            presente: true, // true indica presencia
        }),
    })
    .then((response) => {
        // Si la respuesta es exitosa (status 200-299)
        if (response.ok) {
            // Actualiza la interfaz visual para reflejar la presencia
            actualizarEstadoVisual(idEstudiante, true);
            return true; // Retorna éxito
        }
        // Si hay error en la respuesta, lanza excepción
        throw new Error('Error al marcar la asistencia');
    })
    .catch((error) => {
        // Captura y registra cualquier error en la operación
        console.error('Error marcando asistencia:', error);
        return false; // Retorna fallo
    });
  }
  
  /**
   * Función para actualizar visualmente el estado de asistencia de un estudiante
   * @param {number} idEstudiante - ID del estudiante a actualizar
   * @param {boolean} presente - Estado de asistencia (true = presente, false = ausente)
   */
  function actualizarEstadoVisual(idEstudiante, presente) {
    // Obtiene el elemento HTML del estudiante usando su ID como selector
    const item = document.querySelector(`li[data-id="${idEstudiante}"]`);
    
    // Obtiene los botones de presente y ausente dentro del elemento
    const btnPresente = item.querySelector('.btn-marcar-presente');
    const btnAusente = item.querySelector('.btn-marcar-ausente');
  
    // Remueve todas las clases de estado previas (reset visual)
    item.classList.remove('estudiante-marcado-presente', 'estudiante-marcado-ausente');
    btnPresente.classList.remove('estado-presente');
    btnAusente.classList.remove('estado-ausente');
  
    // Aplica las clases CSS correspondientes al nuevo estado
    if (presente) {
        // Estilos para estado "presente"
        item.classList.add('estudiante-marcado-presente');
        btnPresente.classList.add('estado-presente');
    } else {
        // Estilos para estado "ausente"
        item.classList.add('estudiante-marcado-ausente');
        btnAusente.classList.add('estado-ausente');
    }
  }
  
  // Exporta las funciones para ser usadas en otros módulos
  export { AusenciaAlumnos, asistenciaAlumnos };