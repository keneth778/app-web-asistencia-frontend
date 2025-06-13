// index.js - Router actualizado
import { renderLogin } from './componentes/login/login.js';
import { renderRegistro } from './componentes/registro/registro.js';
import { DOM as gradosDOM } from './componentes/grados/grados.js';
import { renderRecuperarContraseña } from './componentes/recuperarContraseña/recuperarContraseña.js'; 
import { initCoordinador } from './componentes/coordinador/coordinador.js';

function setupRouter() {
  const root = document.getElementById('root');
  let idProfesorActual = null;
  let esCoordinador = false;

  function navigate(page, data = {}) {
    if (page === 'login') {
      esCoordinador = false;
      renderLogin();
    } else if (page === 'registro') {
      renderRegistro();
    } else if (page === 'grados') {
      idProfesorActual = data.idProfesor;
      gradosDOM(idProfesorActual, false); // No es coordinador
    } else if (page === 'recuperar') {
      renderRecuperarContraseña();
    } else if (page === 'coordinador') {
      esCoordinador = true;
      initCoordinador();
    } else {
      renderLogin();
    }
  }

  // Eventos globales
  window.addEventListener('navigate', (e) => {
    if (typeof e.detail === 'string') {
      navigate(e.detail);
    } else if (e.detail && e.detail.page) {
      navigate(e.detail.page, e.detail.data || {});
    }
  });

  window.addEventListener('loginExitoso', (e) => {
    if (e.detail.tipo === 'coordinador') {
      navigate('coordinador');
    } else {
      navigate('grados', { idProfesor: e.detail.id });
    }
  });

  // Inicia con la página de login
  window.addEventListener('DOMContentLoaded', () => {
    navigate('login');
  });
}

// Inicia la aplicación
setupRouter();