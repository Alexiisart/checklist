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
  templateUrl: './list-card.component.html',
  styleUrl: './list-card.component.css',
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
   * Evento emitido cuando se quiere copiar la lista al portapapeles
   */
  @Output() copyList = new EventEmitter<SavedList>();

  /**
   * Evento emitido cuando se quiere compartir la lista
   */
  @Output() shareList = new EventEmitter<SavedList>();

  /**
   * Evento emitido cuando se quiere cambiar la prioridad de la lista
   */
  @Output() togglePriority = new EventEmitter<SavedList>();

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

  /**
   * Maneja el evento de copiar la lista
   */
  onCopyList(): void {
    this.copyList.emit(this.list);
  }

  /**
   * Maneja el evento de compartir la lista
   */
  onShareList(): void {
    this.shareList.emit(this.list);
  }

  /**
   * Maneja el evento de cambiar prioridad
   */
  onTogglePriority(): void {
    this.togglePriority.emit(this.list);
  }
}
