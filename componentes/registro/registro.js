export const renderRegistro = () => {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="registro-container">
        <h2>Registro</h2>
        <form id="registroForm">
          <input type="text" id="nombre" placeholder="Nombre completo" required>
          <input type="email" id="email" placeholder="Correo electrónico" required>
          <input type="password" id="password" placeholder="Contraseña" required>
          <button type="submit">Registrarse</button>
        </form>
        <p>¿Ya tienes una cuenta? <a href="#" id="loginLink">Inicia Sesión</a></p>
        <div class="error" id="registroError"></div>
      </div>
    `;
  
    const registroForm = document.getElementById('registroForm');
    const loginLink = document.getElementById('loginLink');
  
    registroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        // 1. Registrar al profesor
        const registroResponse = await fetch('http://localhost:3000/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password })
        });
  
        const registroData = await registroResponse.json();
        
        if (!registroResponse.ok) {
          throw new Error(registroData.error || 'Error en el registro');
        }
  
        // 2. Asignar grados iniciales
        const asignacionResponse = await fetch('http://localhost:3000/asignar-grados-iniciales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_profesor: registroData.id_profesor })
        });
  
        if (!asignacionResponse.ok) {
          throw new Error('Error asignando grados iniciales');
        }
  
        alert('Registro exitoso. Se han asignado grados iniciales automáticamente.');
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
  
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('registroError').textContent = error.message;
      }
    });
  
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
    });
  };