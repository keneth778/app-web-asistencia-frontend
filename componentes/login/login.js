

export const renderLogin = () => {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Correo electrónico" required>
        <input type="password" id="password" placeholder="Contraseña" required>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <div class="error" id="loginError"></div>
    </div>
  `;

  const loginForm = document.getElementById('loginForm');
  const registerLink = document.getElementById('registerLink');
  const recuperarLink = document.getElementById('recuperarLink');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    try {
      const response = await fetch('https://app-web-asistencia-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Credenciales incorrectas');

      // Disparar evento con el tipo de usuario
      window.dispatchEvent(new CustomEvent('loginExitoso', {
        detail: { 
          id: data.user.id,
          email: data.user.email,
          tipo: data.user.tipo
        }
        
      }));
    } catch (error) {
      console.error('Error en el login:', error);
      errorElement.textContent = error.message || 'Error al iniciar sesión';
    }
  });

  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: 'registro' 
    }));
  });

};