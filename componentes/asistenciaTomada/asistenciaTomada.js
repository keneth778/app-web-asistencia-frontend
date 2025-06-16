
export function renderAsistenciaTomadaModal(asistenciaData) {
  // 1. Primero convertimos el objeto a JSON
  const asistenciaJSON = JSON.stringify(asistenciaData);
  
  // 2. Luego escapamos las comillas para HTML
  const asistenciaEscapada = asistenciaJSON.replace(/"/g, '&quot;');

  const estado = asistenciaData.presente ? 
    (asistenciaData.llego_tarde ? 'PRESENTE (TARDE)' : 'PRESENTE') : 
    'AUSENTE';

  return `
    <div class="modal-asistencia-tomada" id="modal-asistencia-tomada">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Asistencia ya registrada</h3>
          <button class="close-modal" onclick="cerrarModalAsistenciaTomada()">&times;</button>
        </div>
        <div class="modal-body">
          <p>Estado actual: <strong>${estado}</strong></p>
          <p>Registrado el: ${asistenciaData.fecha.split(' ')[0]} a las ${asistenciaData.hora}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-modificar" onclick="mostrarModalModificarAsistencia(${asistenciaEscapada})">
            ✏️ Modificar
          </button>
          <button class="btn-aceptar" onclick="cerrarModalAsistenciaTomada()">Aceptar</button>
        </div>
      </div>
    </div>
  `;
}
export function mostrarModalAsistenciaTomada(asistenciaData) {
  if (!document.getElementById('modal-asistencia-tomada')) {
    document.body.insertAdjacentHTML('beforeend', renderAsistenciaTomadaModal(asistenciaData));
  }
  
  const modal = document.getElementById('modal-asistencia-tomada');
  modal.style.display = 'flex';
  
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

window.cerrarModalAsistenciaTomada = function() {
  const modal = document.getElementById('modal-asistencia-tomada');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

window.mostrarModalModificarAsistencia = function(asistenciaData) {
  console.log('Datos recibidos:', asistenciaData); // ← Agrega esto para depuración
  import('../modificarAsistencia/modificarAsistencia.js')
    .then(module => {
      console.log('Tipo de datos:', typeof asistenciaData); // ← Y esto
      module.mostrarModalModificarAsistencia(asistenciaData);
      cerrarModalAsistenciaTomada();
    });
};