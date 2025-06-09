// Importa los componentes
import { renderLogin } from './componentes/login/login.js';
import { renderRegistro } from './componentes/registro/registro.js';
import { DOM as gradosDOM } from './componentes/grados/grados.js';

/**
 * Configura el enrutamiento de la aplicación
 */
function setupRouter() {
  const root = document.getElementById('root');
  let idProfesorActual = null;

  function navigate(page, data = {}) {
    if (page === 'login') {
      renderLogin();
    } else if (page === 'registro') {
      renderRegistro();
    } else if (page === 'grados') {
      idProfesorActual = data.idProfesor;
      gradosDOM(idProfesorActual);
    }
  }

  // Eventos globales
  window.addEventListener('navigate', (e) => {
    navigate(e.detail.page, e.detail.data);
  });

  window.addEventListener('loginExitoso', (e) => {
    navigate('grados', { idProfesor: e.detail.idProfesor });
  });

  // Inicia con la página de login
  window.addEventListener('DOMContentLoaded', () => {
    navigate('login');
  });
}

// Inicia la aplicación
setupRouter();