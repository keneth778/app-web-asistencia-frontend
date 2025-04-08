// Exporta la función principal para que pueda ser utilizada por otros módulos
export const renderLogin = () => {
  // Obtiene el elemento raíz donde se renderizará el login
  const root = document.getElementById('root');
  
  // Renderiza el HTML del formulario de login dentro del root
  root.innerHTML = `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <form id="loginForm">
        <!-- Input para el correo electrónico con validación HTML5 -->
        <input type="email" id="email" placeholder="Correo electrónico" required>
        <!-- Input para la contraseña (el tipo password oculta los caracteres) -->
        <input type="password" id="password" placeholder="Contraseña" required>
        <!-- Botón para enviar el formulario -->
        <button type="submit">Iniciar Sesión</button>
      </form>
      <!-- Enlace para redirigir al formulario de registro -->
      <p>¿No tienes una cuenta? <a href="#" id="registerLink">Regístrate</a></p>
      <!-- Contenedor para mostrar mensajes de error -->
      <div class="error" id="loginError"></div>
    </div>
  `;

  // Obtiene referencias a los elementos del DOM recién creados
  const loginForm = document.getElementById('loginForm');
  const registerLink = document.getElementById('registerLink');

  // Agrega un event listener para cuando se envía el formulario
  loginForm.addEventListener('submit', async (e) => {
    // Previene el comportamiento por defecto del formulario (recarga de página)
    e.preventDefault();
    
    // Obtiene los valores ingresados por el usuario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Obtiene referencia al elemento donde se mostrarán errores
    const errorElement = document.getElementById('loginError');

    try {
      // Realiza una petición HTTP POST al endpoint de login
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indica que enviamos datos JSON
        },
        body: JSON.stringify({ email, password }), // Convierte credenciales a JSON
      });

      // Verifica que la respuesta sea de tipo JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Si no es JSON, lee el texto plano y lanza un error
        const text = await response.text();
        throw new Error(text || 'Respuesta no válida del servidor');
      }

      // Convierte la respuesta a JSON
      const data = await response.json();

      // Si la respuesta indica un error (status no 200-299)
      if (!response.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // Si el login es exitoso, dispara un evento personalizado con el ID del profesor
      window.dispatchEvent(new CustomEvent('loginExitoso', {
        detail: { idProfesor: data.profesor.id_profesor }
      }));

    } catch (error) {
      // Captura cualquier error que ocurra durante el proceso
      console.error('Error en el login:', error);
      // Muestra el mensaje de error al usuario
      errorElement.textContent = error.message || 'Error al iniciar sesión';
    }
  });

  // Agrega event listener al enlace de registro
  registerLink.addEventListener('click', (e) => {
    // Previene el comportamiento por defecto del enlace
    e.preventDefault();
    // Dispara un evento personalizado para navegar al registro
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { page: 'registro' } 
    }));
  });
};