/*registro.js*
 * Función principal que renderiza y gestiona el formulario de registro
 * @export {function} Permite su uso en otros módulos
 */
export const renderRegistro = () => {
  // Obtiene el elemento raíz donde se renderizará el componente
  const root = document.getElementById('root');
  
  // Renderiza el HTML del formulario de registro
  root.innerHTML = `
    <div class="registro-container">
      <h2>Registro</h2>
      <!-- Formulario de registro con campos requeridos -->
      <form id="registroForm">
        <input type="text" id="nombre" placeholder="Nombre completo" required>
        <input type="email" id="email" placeholder="Correo electrónico" required>
        <input type="password" id="password" placeholder="Contraseña" required>
        <button type="submit">Registrarse</button>
      </form>
      <!-- Enlace para redirigir al login -->
      <p>¿Ya tienes una cuenta? <a href="#" id="loginLink">Inicia Sesión</a></p>
      <!-- Contenedor para mensajes de error -->
      <div class="error" id="registroError"></div>
    </div>
  `;

  // Obtiene referencias a los elementos del DOM
  const registroForm = document.getElementById('registroForm');
  const loginLink = document.getElementById('loginLink');

  /**
   * Manejador del evento submit del formulario
   * @async
   */
  registroForm.addEventListener('submit', async (e) => {
    // Previene el comportamiento por defecto del formulario
    e.preventDefault();
    
    // Obtiene los valores de los campos del formulario
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // ---------------------------
      // 1. REGISTRO DEL PROFESOR
      // ---------------------------
      const registroResponse = await fetch('http://localhost:3000/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' // Indica que enviamos JSON
        },
        body: JSON.stringify({ 
          nombre, 
          email, 
          password 
        })
      });

      // Procesa la respuesta del registro
      const registroData = await registroResponse.json();
      
      // Si hay error en el registro, lanza excepción
      if (!registroResponse.ok) {
        throw new Error(registroData.error || 'Error en el registro');
      }

      // -------------------------------
      // 2. ASIGNACIÓN DE GRADOS INICIALES
      // -------------------------------
      const asignacionResponse = await fetch(
        'http://localhost:3000/asignar-grados-iniciales', 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          // Envía el ID del profesor recién registrado
          body: JSON.stringify({ 
            id_profesor: registroData.id_profesor 
          })
        }
      );

      // Verifica si la asignación fue exitosa
      if (!asignacionResponse.ok) {
        throw new Error('Error asignando grados iniciales');
      }

      // -------------------------------
      // 3. FEEDBACK Y REDIRECCIÓN
      // -------------------------------
      // Muestra alerta de éxito
      alert('Registro exitoso. Se han asignado grados iniciales automáticamente.');
      
      // Navega automáticamente al login
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: 'login' 
      }));

    } catch (error) {
      // -------------------------------
      // MANEJO DE ERRORES
      // -------------------------------
      console.error('Error:', error);
      // Muestra el mensaje de error en la interfaz
      document.getElementById('registroError').textContent = error.message;
    }
  });

  /**
   * Manejador del click en el enlace de login
   */
  loginLink.addEventListener('click', (e) => {
    // Previene el comportamiento por defecto del enlace
    e.preventDefault();
    // Dispara evento para navegar al login
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: 'login' 
    }));
  });
};