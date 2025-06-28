import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComparisonModalData } from '../../../services/external/shared-list-comparison.service';
import { ButtonComponent } from '../../atomic/buttons/button.component';

/**
 * Componente modal para mostrar cuando existe una lista con el mismo nombre
 * Permite al usuario decidir entre actualizar la lista existente o crear una copia
 */
@Component({
  selector: 'app-list-comparison-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './list-comparison-modal.component.html',
  styleUrl: './list-comparison-modal.component.css',
})
export class ListComparisonModalComponent {
  @Input() show: boolean = false;
  @Input() data: ComparisonModalData | null = null;
  @Output() updateExisting = new EventEmitter<void>();
  @Output() createCopy = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /**
   * Verifica si el modal debe ser visible
   */
  isModalVisible(): boolean {
    return !!this.show;
  }

  /**
   * Verifica si hay datos válidos para mostrar
   */
  hasValidData(): boolean {
    return !!(this.data?.existingList && this.data?.sharedList);
  }

  /**
   * Obtiene el número de tareas de la lista existente
   */
  getExistingTasksCount(): number {
    return this.data?.existingList?.tasks?.length ?? 0;
  }

  /**
   * Obtiene el número de tareas de la lista compartida
   */
  getSharedTasksCount(): number {
    return this.data?.sharedList?.tasks?.length ?? 0;
  }

  /**
   * Obtiene la fecha de modificación de la lista existente
   */
  getExistingModifiedDate(): string | undefined {
    return this.data?.existingList?.modifiedDate;
  }

  /**
   * Obtiene la fecha de la lista compartida
   */
  getSharedDate(): string | undefined {
    return (
      this.data?.sharedList?.sharedAt || this.data?.sharedList?.createdDate
    );
  }

  /**
   * Maneja clics en el overlay para cerrar el modal
   */
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  /**
   * Obtiene el nombre de la lista sin el sufijo "(Compartida)"
   */
  getListName(): string {
    return (
      this.data?.sharedList?.name
        ?.replace(/\s*\(Compartida\)\s*$/, '')
        .trim() || 'Lista sin nombre'
    );
  }

  /**
   * Formatea una fecha para mostrar de manera legible
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'Fecha no disponible';
    try {
      return new Date(date).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no válida';
    }
  }

  /**
   * Maneja la acción de actualizar la lista existente
   */
  onUpdateExisting(): void {
    this.updateExisting.emit();
  }

  /**
   * Maneja la acción de crear una copia nueva
   */
  onCreateCopy(): void {
    this.createCopy.emit();
  }

  /**
   * Maneja la acción de cancelar
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
