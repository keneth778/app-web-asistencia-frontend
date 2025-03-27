//ligin.js
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
      <p>¿No tienes una cuenta? <a href="#" id="registerLink">Regístrate</a></p>
      <div class="error" id="loginError"></div>
    </div>
  `;

  const loginForm = document.getElementById('loginForm');
  const registerLink = document.getElementById('registerLink');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Respuesta no válida del servidor');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      window.dispatchEvent(new CustomEvent('loginExitoso', {
        detail: { idProfesor: data.profesor.id_profesor }
      }));

    } catch (error) {
      console.error('Error en el login:', error);
      errorElement.textContent = error.message || 'Error al iniciar sesión';
    }
  });

  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'registro' } }));
  });
};