import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastData {
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible) {
    <div class="alert alert-{{ data?.type || 'info' }}" [@slideIn]>
      {{ data?.message }}
    </div>
    }
  `,
  styles: [
    `
      .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        max-width: 300px;
        box-shadow: var(--shadow-md);
        font-family: 'Inter', sans-serif;
        animation: slideIn 0.3s ease;
      }

      .alert-success {
        background-color: var(--color-success);
      }

      .alert-warning {
        background-color: var(--color-warning);
      }

      .alert-danger {
        background-color: var(--color-error);
      }

      .alert-info {
        background-color: var(--color-info);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `,
  ],
})
export class ToastComponent {
  /**
   * Indica si el toast está visible
   */
  @Input() isVisible = false;

  /**
   * Datos del toast a mostrar
   */
  @Input() data: ToastData | null = null;

  /**
   * Evento emitido cuando se cierra el toast
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Inicializa el componente y configura el temporizador para ocultar el toast
   */
  ngOnInit() {
    if (this.isVisible && this.data) {
      const duration = this.data.duration || 3000;
      setTimeout(() => {
        this.hideToast();
      }, duration);
    }
  }

  /**
   * Oculta el toast con una animación de salida
   * y emite el evento closed cuando termina
   */
  private hideToast() {
    const alert = document.querySelector('.alert') as HTMLElement;
    if (alert) {
      alert.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        this.isVisible = false;
        this.closed.emit();
      }, 300);
    }
  }
}
