import { Injectable } from '@angular/core';

export interface ToastData {
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /**
   * Muestra un toast notification como en el original
   * @param message Mensaje a mostrar
   * @param type Tipo de toast
   * @param duration Duración en ms
   */
  showAlert(
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info' = 'info',
    duration: number = 3000
  ): void {
    // Crear elemento de alerta toast igual que en el original
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 3000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      box-shadow: var(--shadow-md);
      font-family: 'Inter', sans-serif;
    `;

    // Colores según el tipo usando variables CSS
    const colors = {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-error)',
      info: 'var(--color-info)',
    };

    alert.style.backgroundColor = colors[type] || colors.info;
    alert.textContent = message;

    // Agregar estilos de animación si no existen
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(alert);

    // Remover después del tiempo especificado
    setTimeout(() => {
      alert.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      }, 300);
    }, duration);
  }
}
