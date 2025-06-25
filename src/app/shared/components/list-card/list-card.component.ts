import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedList } from '../../../models/task.interface';
import { ButtonComponent } from '../../atomic/buttons';
import { CheckboxComponent } from '../../atomic/checkboxes';

/**
 * Componente de tarjeta de lista reutilizable
 * Muestra una tarjeta con la información de una lista y maneja las acciones
 */
@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CheckboxComponent],
  template: `
    <div
      class="list-card"
      [class.selection-mode]="isSelectionMode"
      [class.selected]="isSelected"
      (click)="onCardClick()"
    >
      @if (isSelectionMode) {
      <div class="selection-checkbox">
        <app-checkbox
          type="primary"
          size="md"
          [checked]="isSelected"
          [inputId]="'list-select-' + list.id"
          ariaLabel="Seleccionar lista"
          (checkedChange)="onToggleSelection()"
          (clickEvent)="$event.stopPropagation()"
        ></app-checkbox>
      </div>
      }
      <div class="list-card-header">
        <div class="title-section">
          <h3 class="list-card-title">
            {{ list.name || 'Lista sin nombre' }}
          </h3>
          @if (!isSelectionMode) {
          <app-button
            type="icon"
            iconLeft="edit"
            size="sm"
            title="Renombrar lista"
            extraClasses="rename-list-btn"
            (click)="onRename(); $event.stopPropagation()"
          >
          </app-button>
          }
        </div>
        <span class="list-card-date">{{ formattedDate }}</span>
      </div>
      <p class="list-card-preview">{{ list.preview }}</p>
      <div class="list-card-stats">
        <span
          >{{ list.completedCount }} de {{ list.tasksCount }} completadas</span
        >
      </div>
      <div class="list-card-progress">
        <div
          class="list-card-progress-bar"
          [style.width.%]="progressPercentage"
        ></div>
      </div>
      @if (!isSelectionMode) {
      <div class="list-card-actions" (click)="$event.stopPropagation()">
        <div class="actions-left">
          <app-button
            type="icon"
            iconLeft="open_in_new"
            size="sm"
            title="Abrir en nueva pestaña"
            extraClasses="open-new-tab-btn"
            (clickEvent)="onOpenInNewTab()"
          >
          </app-button>
        </div>
        <div class="actions-right">
          <app-button
            type="icon"
            iconLeft="content_copy"
            size="sm"
            title="Duplicar lista"
            extraClasses="duplicate-list-btn"
            (clickEvent)="onDuplicate()"
          >
          </app-button>
          <app-button
            type="icon"
            iconLeft="delete"
            size="sm"
            title="Eliminar lista"
            extraClasses="delete-list-btn"
            (clickEvent)="onDelete()"
          >
          </app-button>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .list-card {
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 200px;
        box-sizing: border-box;
        max-width: 100%;
      }

      .list-card:hover {
        border-color: var(--color-border-focus);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .list-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-3);
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .list-card-title {
        display: contents;
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text-primary);
        line-height: 1.4;
        letter-spacing: -0.025em;
        flex: 1;
      }

      .list-card-date {
        font-size: 0.75rem;
        color: var(--color-text-muted);
        white-space: nowrap;
        font-weight: 500;
      }

      .list-card-preview {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0 0 16px 0;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .list-card-stats {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin-bottom: 12px;
      }

      .list-card-progress {
        background: var(--neutral-200);
        border-radius: var(--radius-sm);
        height: 4px;
        overflow: hidden;
        margin-bottom: var(--space-4);
      }

      .list-card-progress-bar {
        background: var(--primary-600);
        height: 100%;
        border-radius: var(--radius-sm);
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .list-card-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
      }

      .actions-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .actions-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .title-section .rename-list-btn {
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s ease;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        font-size: 0.875rem;
        width: 28px;
        height: 28px;
      }

      .title-section .rename-list-btn .material-icons-outlined {
        font-size: 16px;
        line-height: 1;
      }

      .title-section .rename-list-btn:hover {
        background: rgba(59, 130, 246, 0.1);
        color: var(--primary-600);
        opacity: 1;
      }

      .list-card-actions .open-new-tab-btn:hover {
        background: rgba(34, 197, 94, 0.1);
        color: var(--color-success);
      }

      /* Estilos para modo selección */
      .list-card.selection-mode {
        cursor: pointer;
        user-select: none;
      }

      .list-card.selection-mode:hover {
        background: var(--color-surface);
        border-color: var(--primary-300);
      }

      .list-card.selected {
        border-color: var(--primary-500) !important;
        box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2) !important;
      }

      .selection-checkbox {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
      }

      /* Eliminar estilos del checkbox nativo que ya no se usa */

      /* Tema oscuro para selección */
      [data-theme='dark'] .list-card.selected {
        background: rgba(20, 184, 166, 0.1) !important;
        border-color: var(--primary-400) !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .list-card {
          padding: var(--space-4);
        }

        .list-card-header {
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class ListCardComponent {
  /**
   * Datos de la lista a mostrar
   */
  @Input() list!: SavedList;

  /**
   * Si está en modo selección
   */
  @Input() isSelectionMode: boolean = false;

  /**
   * Si la tarjeta está seleccionada
   */
  @Input() isSelected: boolean = false;

  /**
   * Fecha formateada para mostrar
   */
  @Input() formattedDate: string = '';

  /**
   * Porcentaje de progreso calculado
   */
  @Input() progressPercentage: number = 0;

  /**
   * Evento emitido cuando se hace clic en la tarjeta
   */
  @Output() cardClick = new EventEmitter<string>();

  /**
   * Evento emitido cuando se alterna la selección
   */
  @Output() toggleSelection = new EventEmitter<string>();

  /**
   * Evento emitido cuando se quiere renombrar
   */
  @Output() rename = new EventEmitter<SavedList>();

  /**
   * Evento emitido cuando se quiere eliminar
   */
  @Output() delete = new EventEmitter<SavedList>();

  /**
   * Evento emitido cuando se quiere duplicar
   */
  @Output() duplicate = new EventEmitter<SavedList>();

  /**
   * Evento emitido cuando se quiere abrir en una nueva pestaña
   */
  @Output() openInNewTab = new EventEmitter<string>();

  /**
   * Maneja el clic en la tarjeta
   */
  onCardClick(): void {
    this.cardClick.emit(this.list.id);
  }

  /**
   * Maneja el toggle de selección
   */
  onToggleSelection(): void {
    this.toggleSelection.emit(this.list.id);
  }

  /**
   * Maneja el evento de renombrar
   */
  onRename(): void {
    this.rename.emit(this.list);
  }

  /**
   * Maneja el evento de duplicar
   */
  onDuplicate(): void {
    this.duplicate.emit(this.list);
  }

  /**
   * Maneja el evento de eliminar
   */
  onDelete(): void {
    this.delete.emit(this.list);
  }

  /**
   * Maneja el evento de abrir en una nueva pestaña
   */
  onOpenInNewTab(): void {
    this.openInNewTab.emit(this.list.id);
  }
}
