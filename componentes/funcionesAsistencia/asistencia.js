function toggleAsistenciaLocal(idEstudiante, presente) {
    cambiosPendientes.asistencias[idEstudiante] = presente;
    actualizarEstadoVisual(idEstudiante, presente);
  }
  
  function abrirEditorReporte(idEstudiante) {
    const editor = document.getElementById(`editor-reporte-${idEstudiante}`);
    editor.style.display = 'block';
    editor.focus();
    
    // Cargar reporte existente si hay
    if (cambiosPendientes.reportes[idEstudiante]) {
      editor.value = cambiosPendientes.reportes[idEstudiante];
    }
  }
  
  function guardarReporteLocal(idEstudiante, reporte) {
    cambiosPendientes.reportes[idEstudiante] = reporte;
    const indicador = document.getElementById(`indicador-reporte-${idEstudiante}`);
    
    if (reporte && reporte.trim() !== '') {
      indicador.style.display = 'flex';
    } else {
      indicador.style.display = 'none';
    }
    
    document.getElementById(`editor-reporte-${idEstudiante}`).style.display = 'none';
  }