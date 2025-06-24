import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra un indicador de progreso del almacenamiento
 * Recibe el porcentaje como input y muestra el estado visual correspondiente
 */
@Component({
  selector: 'app-storage-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (storagePercentage > 60) {
    <div class="storage-indicator">
      <div class="storage-header">
        <span class="material-icons-outlined">storage</span>
        <span class="storage-text"
          >Espacio usado: {{ storagePercentage }}%</span
        >
      </div>
      <div class="storage-progress">
        <div
          class="storage-progress-fill"
          [style.width.%]="storagePercentage"
        ></div>
      </div>
      @if (storagePercentage > 80) {
      <p class="storage-warning">
        ⚠️ Espacio casi lleno. Considera eliminar listas antiguas.
      </p>
      }
    </div>
    }
  `,
  styles: [
    `
      .storage-indicator {
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-xs);
      }

      .storage-header {
        display: flex;
        align-items: center;
        margin-bottom: var(--space-2);
      }

      .storage-text {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .storage-progress {
        background: var(--neutral-200);
        border-radius: var(--radius-sm);
        height: 6px;
        overflow: hidden;
        margin-bottom: var(--space-2);
      }

      .storage-progress-fill {
        background: var(--color-warning);
        height: 100%;
        border-radius: var(--radius-sm);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .storage-warning {
        margin: 8px 0 0 0;
        font-size: 0.875rem;
        color: var(--warning-color);
        font-weight: 500;
      }
    `,
  ],
})
export class StorageProgressIndicatorComponent {
  /**
   * Porcentaje de almacenamiento usado (0-100)
   */
  @Input() storagePercentage: number = 0;
}
