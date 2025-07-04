import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../services/storage.service';
import { Subject, takeUntil, interval } from 'rxjs';

/**
 * Componente que muestra un indicador visual del uso de almacenamiento
 */
@Component({
  selector: 'app-storage-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="storage-indicator" [ngClass]="storageInfo.level">
      <!-- Versión para móviles -->
      <div class="mobile-version">
        <div class="storage-icon-mobile">
          <span class="material-icons-outlined">storage</span>
        </div>
        <div class="storage-percentage-mobile">
          {{ storageInfo.percentage.toFixed(1) }}%
        </div>
      </div>

      <!-- Versión para desktop -->
      <div class="desktop-version">
        <div class="storage-header">
          <span class="storage-text">
            Almacenamiento: {{ storageInfo.percentage.toFixed(1) }}%
          </span>
        </div>
        <div class="storage-progress">
          <div
            class="storage-progress-fill"
            [style.width.%]="storageInfo.percentage"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .storage-indicator {
        position: fixed;
        top: 24px;
        right: 24px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 16px;
        z-index: 10;
        min-width: 220px;
        font-size: 0.875rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .storage-indicator:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-lg);
      }

      /* Versión móvil - oculta por defecto */
      .mobile-version {
        display: none;
        flex-direction: column;
        align-items: center;
      }

      .storage-icon-mobile {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .storage-icon-mobile .material-icons-outlined {
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        transition: color 0.3s ease;
      }

      .storage-percentage-mobile {
        color: var(--color-text-primary);
        font-weight: 700;
        font-size: 1.5rem;
        letter-spacing: -0.025em;
        text-align: center;
      }

      /* Versión desktop - visible por defecto */
      .desktop-version {
        display: block;
      }

      .storage-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }

      .storage-text {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 0.875rem;
        letter-spacing: -0.025em;
      }

      .storage-progress {
        width: 100%;
        height: 6px;
        background: var(--color-surface-secondary);
        border-radius: var(--radius-sm);
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .storage-progress-fill {
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--primary-500),
          var(--primary-600)
        );
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: var(--radius-sm);
        position: relative;
      }

      .storage-progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.2) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0.2) 100%
        );
        border-radius: var(--radius-sm);
      }

      /* Estados del indicador */
      .storage-indicator.safe .storage-progress-fill {
        background: linear-gradient(90deg, #10b981, #059669);
      }

      .storage-indicator.safe .storage-text,
      .storage-indicator.safe .storage-percentage-mobile {
        color: var(--color-text-primary);
      }

      .storage-indicator.warning .storage-progress-fill {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }

      .storage-indicator.warning .storage-text,
      .storage-indicator.warning .storage-percentage-mobile {
        color: #f59e0b;
      }

      .storage-indicator.warning {
        border-color: rgba(245, 158, 11, 0.3);
        background: var(--color-surface-elevated);
      }

      .storage-indicator.danger .storage-progress-fill {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .storage-indicator.danger .storage-text,
      .storage-indicator.danger .storage-percentage-mobile {
        color: #ef4444;
      }

      .storage-indicator.danger {
        border-color: rgba(239, 68, 68, 0.3);
        background: var(--color-surface-elevated);
      }

      /* Animación de pulso para estados críticos */
      .storage-indicator.danger {
        animation: pulse-danger 2s infinite;
      }

      /* Responsivo */
      @media (max-width: 768px) {
        .storage-indicator {
          top: 16px;
          right: 16px;
          padding: 12px;
          min-width: 0;
          font-size: 0.8rem;
        }

        /* Mostrar versión móvil y ocultar desktop */
        .mobile-version {
          display: flex;
        }

        .desktop-version {
          display: none;
        }

        .storage-icon-mobile .material-icons-outlined {
          font-size: 2rem;
        }

        .storage-percentage-mobile {
          font-size: 1.25rem;
        }
      }

      @media (max-width: 480px) {
        .storage-indicator {
          top: 12px;
          right: 12px;
          padding: 10px;
          min-width: 0;
          font-size: 0.75rem;
        }

        .storage-icon-mobile .material-icons-outlined {
          font-size: 2rem;
        }

        .storage-percentage-mobile {
          font-size: 1.125rem;
        }
      }
    `,
  ],
})
export class StorageIndicatorComponent implements OnInit, OnDestroy {
  storageInfo = {
    percentage: 0,
    isNearLimit: false,
    isFull: false,
    formattedSize: '0 Bytes',
    level: 'safe' as 'safe' | 'warning' | 'danger',
  };

  private destroy$ = new Subject<void>();

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    // Actualizar inmediatamente
    this.updateStorageInfo();

    // Actualizar cada 5 segundos
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateStorageInfo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStorageInfo(): void {
    this.storageInfo = this.storageService.getStorageInfo();
  }
}
