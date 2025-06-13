// componentes/recuperarContraseña/recuperarContraseña.js
export const renderRecuperarContraseña = () => {
  const root = document.getElementById('root');
  
  // Estado para manejar el flujo de recuperación
  let estado = 'solicitarCorreo'; // 'solicitarCorreo', 'ingresarCodigo', 'nuevaPassword'
  let email = '';
  let token = '';

  function renderizarFormulario() {
    switch (estado) {
      case 'solicitarCorreo':
        root.innerHTML = `
          <div class="recuperar-container">
            <h2>Recuperar Contraseña</h2>
            <form id="solicitarCodigoForm">
              <p>Ingresa el correo electrónico asociado a tu cuenta:</p>
              <input type="email" id="email" placeholder="Correo electrónico" required>
              <button type="submit">Enviar Código</button>
            </form>
            <p>¿Recordaste tu contraseña? <a href="#" id="loginLink">Inicia Sesión</a></p>
            <div class="error" id="recuperarError"></div>
            <div class="success" id="recuperarSuccess"></div>
          </div>
        `;
        break;
        
      case 'ingresarCodigo':
        root.innerHTML = `
          <div class="recuperar-container">
            <h2>Verificar Código</h2>
            <p>Hemos enviado un código de verificación a ${email}</p>
            <form id="verificarCodigoForm">
              <input type="text" id="codigo" placeholder="Código de 6 dígitos" required maxlength="6">
              <button type="submit">Verificar Código</button>
            </form>
            <button id="reenviarCodigoBtn" class="btn-secundario">Reenviar Código</button>
            <div class="error" id="recuperarError"></div>
            <div class="success" id="recuperarSuccess"></div>
          </div>
        `;
        break;
        
      case 'nuevaPassword':
        root.innerHTML = `
          <div class="recuperar-container">
            <h2>Nueva Contraseña</h2>
            <form id="nuevaPasswordForm">
              <input type="password" id="nuevaPassword" placeholder="Nueva contraseña" required minlength="6">
              <input type="password" id="confirmarPassword" placeholder="Confirmar nueva contraseña" required minlength="6">
              <button type="submit">Actualizar Contraseña</button>
            </form>
            <div class="error" id="recuperarError"></div>
            <div class="success" id="recuperarSuccess"></div>
          </div>
        `;
        break;
    }
    
    configurarEventListeners();
  }

  function configurarEventListeners() {
    const loginLink = document.getElementById('loginLink');
    const reenviarCodigoBtn = document.getElementById('reenviarCodigoBtn');
    
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { page: 'login' } 
        }));
      });
    }
    
    if (reenviarCodigoBtn) {
      reenviarCodigoBtn.addEventListener('click', solicitarCodigo);
    }
    
    const solicitarCodigoForm = document.getElementById('solicitarCodigoForm');
    const verificarCodigoForm = document.getElementById('verificarCodigoForm');
    const nuevaPasswordForm = document.getElementById('nuevaPasswordForm');
    
    if (solicitarCodigoForm) {
      solicitarCodigoForm.addEventListener('submit', solicitarCodigo);
    }
    
    if (verificarCodigoForm) {
      verificarCodigoForm.addEventListener('submit', verificarCodigo);
    }
    
    if (nuevaPasswordForm) {
      nuevaPasswordForm.addEventListener('submit', actualizarPassword);
    }
  }

  async function solicitarCodigo(e) {
    if (e) e.preventDefault();
    
    const errorElement = document.getElementById('recuperarError');
    const successElement = document.getElementById('recuperarSuccess');
    
    // Limpiar mensajes anteriores
    if (errorElement) errorElement.textContent = '';
    if (successElement) successElement.textContent = '';
    
    const emailInput = document.getElementById('email');
    if (!emailInput && estado === 'ingresarCodigo') {
      // Reenviar código
      await enviarCodigo(email);
      return;
    }
    
    if (!emailInput) return;
    
    email = emailInput.value.trim();
    
    if (!email) {
      mostrarError('El correo electrónico es requerido');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/solicitar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar el código');
      }
      
      estado = 'ingresarCodigo';
      renderizarFormulario();
      mostrarExito('Código enviado. Revisa tu correo electrónico.');
      
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  }
  
  async function verificarCodigo(e) {
    e.preventDefault();
    
    const codigo = document.getElementById('codigo').value.trim();
    const errorElement = document.getElementById('recuperarError');
    const successElement = document.getElementById('recuperarSuccess');
    
    // Limpiar mensajes anteriores
    errorElement.textContent = '';
    successElement.textContent = '';
    
    if (!codigo || codigo.length !== 6) {
      mostrarError('Por favor ingresa un código de 6 dígitos');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar el código');
      }
      
      token = data.token;
      estado = 'nuevaPassword';
      renderizarFormulario();
      
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  }
  
  async function actualizarPassword(e) {
    e.preventDefault();
    
    const nuevaPassword = document.getElementById('nuevaPassword').value;
    const confirmarPassword = document.getElementById('confirmarPassword').value;
    const errorElement = document.getElementById('recuperarError');
    const successElement = document.getElementById('recuperarSuccess');
    
    // Limpiar mensajes anteriores
    errorElement.textContent = '';
    successElement.textContent = '';
    
    if (nuevaPassword.length < 6) {
      mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (nuevaPassword !== confirmarPassword) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/actualizar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, nuevaPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la contraseña');
      }
      
      mostrarExito('Contraseña actualizada correctamente. Redirigiendo...');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { page: 'login' } 
        }));
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  }
  
  function mostrarError(mensaje) {
    const errorElement = document.getElementById('recuperarError');
    if (errorElement) errorElement.textContent = mensaje;
  }
  
  function mostrarExito(mensaje) {
    const successElement = document.getElementById('recuperarSuccess');
    if (successElement) successElement.textContent = mensaje;
  }
  
  async function enviarCodigo(email) {
    try {
      const response = await fetch('http://localhost:3000/solicitar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al reenviar el código');
      }
      
      mostrarExito('Código reenviado. Revisa tu correo electrónico.');
      
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  }

  // Inicializar con el primer formulario
  renderizarFormulario();
};