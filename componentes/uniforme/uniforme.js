// componentes/uniforme/uniforme.js

/**
 * Renderiza el modal para registrar el uniforme
 * @param {number} idEstudiante - ID del estudiante
 * @param {string} nombreEstudiante - Nombre del estudiante
 * @returns {string} HTML del modal
 */
export function renderUniformeModal(idEstudiante, nombreEstudiante) {
  return `
    <div class="uniforme-container" id="uniforme-modal-${idEstudiante}">
      <div class="uniforme-content">
        <div class="uniforme-header">
          <h3 class="uniforme-title">Uniforme de ${nombreEstudiante}</h3>
          <button class="close-uniforme" onclick="cerrarUniformeModal(${idEstudiante})">&times;</button>
        </div>
        
        <div class="uniforme-items">
          <div class="uniforme-item">
            <div class="uniforme-icon">👕</div>
            <span>Camisa</span>
            <div class="uniforme-controls">
              <button class="uniforme-btn si" onclick="marcarUniformeItem(${idEstudiante}, 'camisa', true)">Sí</button>
              <button class="uniforme-btn no" onclick="marcarUniformeItem(${idEstudiante}, 'camisa', false)">No</button>
            </div>
          </div>
          
          <div class="uniforme-item">
            <div class="uniforme-icon">👖</div>
            <span>Pantalón</span>
            <div class="uniforme-controls">
              <button class="uniforme-btn si" onclick="marcarUniformeItem(${idEstudiante}, 'pantalon', true)">Sí</button>
              <button class="uniforme-btn no" onclick="marcarUniformeItem(${idEstudiante}, 'pantalon', false)">No</button>
            </div>
          </div>
          
          <div class="uniforme-item">
            <div class="uniforme-icon">🧦</div>
            <span>Calcetines</span>
            <div class="uniforme-controls">
              <button class="uniforme-btn si" onclick="marcarUniformeItem(${idEstudiante}, 'calcetines', true)">Sí</button>
              <button class="uniforme-btn no" onclick="marcarUniformeItem(${idEstudiante}, 'calcetines', false)">No</button>
            </div>
          </div>
          
          <div class="uniforme-item">
            <div class="uniforme-icon">👞</div>
            <span>Zapatos</span>
            <div class="uniforme-controls">
              <button class="uniforme-btn si" onclick="marcarUniformeItem(${idEstudiante}, 'zapatos', true)">Sí</button>
              <button class="uniforme-btn no" onclick="marcarUniformeItem(${idEstudiante}, 'zapatos', false)">No</button>
            </div>
          </div>
        </div>
        
        <div class="uniforme-footer">
          <button class="btn-cancelar-uniforme" onclick="cerrarUniformeModal(${idEstudiante})">Cancelar</button>
          <button class="btn-guardar-uniforme" onclick="guardarUniforme(${idEstudiante})">Guardar</button>
        </div>
      </div>
    </div>
  `;
}


// Estado temporal para el uniforme
const uniformeState = {};

/**
 * Abre el modal de uniforme para un estudiante
 * @param {number} idEstudiante - ID del estudiante
 * @param {string} nombreEstudiante - Nombre del estudiante
 */
window.abrirUniformeModal = function(idEstudiante, nombreEstudiante) {
  // Inicializar estado si no existe
  if (!uniformeState[idEstudiante]) {
    uniformeState[idEstudiante] = {
      camisa: null,
      pantalon: null,
      calcetines: null,
      zapatos: null,
      tipo: 'diario' // Valor por defecto
    };
  }
  
  // Renderizar el modal si no existe
  if (!document.getElementById(`uniforme-modal-${idEstudiante}`)) {
    document.body.insertAdjacentHTML('beforeend', renderUniformeModal(idEstudiante, nombreEstudiante));
  }
  
  // Mostrar el modal
  const modal = document.getElementById(`uniforme-modal-${idEstudiante}`);
  modal.classList.add('show');
};

/**
 * Cierra el modal de uniforme
 * @param {number} idEstudiante - ID del estudiante
 */
window.abrirUniformeModal = function(idEstudiante, nombreEstudiante) {
  // Inicializar estado si no existe
  if (!uniformeState[idEstudiante]) {
    uniformeState[idEstudiante] = {
      camisa: null,
      pantalon: null,
      calcetines: null,
      zapatos: null,
      tipo: 'diario' // Valor por defecto
    };
  }
  
  // Renderizar el modal si no existe
  if (!document.getElementById(`uniforme-modal-${idEstudiante}`)) {
    document.body.insertAdjacentHTML('beforeend', renderUniformeModal(idEstudiante, nombreEstudiante));
  }
  
  // Mostrar el modal
  const modal = document.getElementById(`uniforme-modal-${idEstudiante}`);
  modal.classList.add('show');
};

window.cerrarUniformeModal = function(idEstudiante) {
  const modal = document.getElementById(`uniforme-modal-${idEstudiante}`);
  if (modal) {
    modal.classList.remove('show');
    // Opcional: eliminar el modal del DOM después de la animación
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

window.marcarUniformeItem = function(idEstudiante, item, valor) {
  if (uniformeState[idEstudiante]) {
    uniformeState[idEstudiante][item] = valor;
    
    // Actualizar estilos de los botones
    const modal = document.getElementById(`uniforme-modal-${idEstudiante}`);
    if (modal) {
      const siBtn = modal.querySelector(`button[onclick="marcarUniformeItem(${idEstudiante}, '${item}', true)"]`);
      const noBtn = modal.querySelector(`button[onclick="marcarUniformeItem(${idEstudiante}, '${item}', false)"]`);
      
      if (siBtn && noBtn) {
        siBtn.classList.toggle('active', valor === true);
        noBtn.classList.toggle('active', valor === false);
      }
    }
  }
};

window.guardarUniforme = async function(idEstudiante) {
  if (!uniformeState[idEstudiante]) {
    alert('No hay datos de uniforme para guardar');
    return;
  }
  
  const { camisa, pantalon, calcetines, zapatos, tipo } = uniformeState[idEstudiante];
  
  // Validar que todos los campos estén marcados
  if (camisa === null || pantalon === null || calcetines === null || zapatos === null) {
    alert('Por favor marca todos los items del uniforme');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/registrar-uniforme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_estudiante: idEstudiante,
        camisa,
        pantalon,
        calcetines,
        zapatos,
        tipo
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al guardar el uniforme');
    }
    
    alert('Uniforme registrado correctamente');
    cerrarUniformeModal(idEstudiante);
    
  } catch (error) {
    console.error('Error:', error);
    alert(`Error al guardar el uniforme: ${error.message}`);
  }
};

// Exporta una función para inicializar el componente
export function initUniforme() {
  // No necesitamos hacer nada aquí, ya que las funciones están en window
}