import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, type ButtonType } from '../../atomic/buttons';

/**
 * Componente de estado vacío reutilizable
 * Muestra un estado vacío personalizable con icono, título, mensaje y botón opcional
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="empty-state">
      <span class="material-icons-outlined empty-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (buttonText) {
      <app-button
        [type]="buttonType"
        [text]="buttonText"
        [size]="buttonSize"
        [iconLeft]="buttonIcon"
        [fullWidth]="buttonFullWidth"
        [responsive]="buttonResponsive"
        (clickEvent)="onButtonClick()"
      >
      </app-button>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.5;
      }

      .empty-state h3 {
        margin: 0 0 12px 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .empty-state p {
        margin: 0 0 24px 0;
        font-size: 1rem;
        line-height: 1.5;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .empty-state {
          padding: 40px 16px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
      }

      @media (max-width: 480px) {
        .empty-state {
          padding: 32px 12px;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          font-size: 1.125rem;
        }

        .empty-state p {
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class EmptyStateComponent {
  /**
   * Icono de Material Icons a mostrar
   */
  @Input() icon: string = 'inbox';

  /**
   * Título del estado vacío
   */
  @Input() title: string = 'No hay elementos';

  /**
   * Mensaje descriptivo
   */
  @Input() message: string = 'No se encontraron elementos para mostrar.';

  /**
   * Texto del botón (opcional)
   */
  @Input() buttonText?: string;

  /**
   * Tipo del botón
   */
  @Input() buttonType: ButtonType = 'primary';

  /**
   * Tamaño del botón
   */
  @Input() buttonSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  /**
   * Icono del botón (opcional)
   */
  @Input() buttonIcon?: string;

  /**
   * Si el botón debe ocupar todo el ancho
   */
  @Input() buttonFullWidth: boolean = false;

  /**
   * Si el botón debe ser responsivo
   */
  @Input() buttonResponsive: boolean = true;

  /**
   * Evento emitido cuando se hace clic en el botón
   */
  @Output() buttonClick = new EventEmitter<void>();

  /**
   * Maneja el clic en el botón
   */
  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
