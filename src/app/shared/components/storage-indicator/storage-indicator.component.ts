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
  `,
  styles: [
    `
      .storage-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-surface-primary);
        border: 1px solid var(--color-border-primary);
        border-radius: var(--radius-medium);
        padding: 12px;
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        min-width: 200px;
        font-size: 12px;
        transition: all 0.3s ease;
      }

      .storage-header {
        margin-bottom: 8px;
      }

      .storage-text {
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .storage-progress {
        width: 100%;
        height: 4px;
        background: var(--color-surface-secondary);
        border-radius: 2px;
        overflow: hidden;
      }

      .storage-progress-fill {
        height: 100%;
        background: var(--color-primary-500);
        transition: width 0.3s ease, background-color 0.3s ease;
        border-radius: 2px;
      }

      /* Estados del indicador */
      .storage-indicator.safe .storage-progress-fill {
        background: var(--color-primary-500);
      }

      .storage-indicator.safe .storage-text {
        color: var(--color-text-secondary);
      }

      .storage-indicator.warning .storage-progress-fill {
        background: #f59e0b;
      }

      .storage-indicator.warning .storage-text {
        color: #f59e0b;
      }

      .storage-indicator.warning {
        border-color: #f59e0b;
      }

      .storage-indicator.danger .storage-progress-fill {
        background: #ef4444;
      }

      .storage-indicator.danger .storage-text {
        color: #ef4444;
      }

      .storage-indicator.danger {
        border-color: #ef4444;
      }

      /* Responsivo */
      @media (max-width: 768px) {
        .storage-indicator {
          top: 10px;
          right: 10px;
          padding: 8px;
          min-width: 150px;
          font-size: 11px;
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
