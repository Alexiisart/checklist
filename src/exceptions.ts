/**
 * Función para detectar y almacenar datos compartidos antes del bootstrap
 */
export function urlLoader() {
  try {
    // Buscar datos compartidos en query parameters
    const urlParams = new URLSearchParams(window.location.search);
    let sharedData = urlParams.get('shared');

    // Si no hay en query params, buscar en hash para compatibilidad
    if (!sharedData) {
      const hash = window.location.hash;
      const match = hash.match(/^#(?:share-data|shared)=(.+)$/);
      if (match && match[1]) {
        sharedData = match[1];
      }
    }

    if (sharedData) {
      // Almacenar en sessionStorage para recuperar después del bootstrap
      sessionStorage.setItem('pendingSharedData', sharedData);

      // Limpiar la URL para evitar problemas con el router
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('shared');
      if (cleanUrl.hash.match(/^#(?:share-data|shared)=/)) {
        cleanUrl.hash = '#/home';
      }

      window.history.replaceState({}, '', cleanUrl.toString());
    }
  } catch (error) {
    console.error('Error detectando URL compartida:', error);
  }
}

// Suprimir errores de extensiones del navegador
export function suppressUnhandledRejection() {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes(
        'message channel closed before a response was received'
      )
    ) {
      event.preventDefault();
    }
  });
}
