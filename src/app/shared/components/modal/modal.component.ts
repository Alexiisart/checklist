import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalData } from '../../../models/task.interface';

/**
 * Componente modal reutilizable para entrada de texto.
 * Permite mostrar un diálogo modal con un campo de texto y botones de confirmación/cancelación.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="modal"
      [style.display]="isVisible ? 'flex' : 'none'"
      (click)="onOverlayClick($event)"
    >
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ data?.title || 'Agregar elemento' }}</h3>
          <button class="close-modal-btn" (click)="close()">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <label for="modalTextarea">{{ data?.label || 'Descripción:' }}</label>
          <textarea
            id="modalTextarea"
            [(ngModel)]="inputValue"
            [placeholder]="data?.placeholder || 'Escribe aquí...'"
            rows="4"
            (keydown)="onKeyDown($event)"
          >
          </textarea>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" (click)="close()">Cancelar</button>
          <button class="primary-btn" (click)="confirm()">Agregar</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @Input() isVisible = false;
  @Input() data: ModalData | null = null;
  @Output() confirmed = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  inputValue = '';

  /**
   * Maneja los cambios en las propiedades de entrada del componente.
   * Inicializa el valor del input cuando el modal se hace visible.
   */
  ngOnChanges(): void {
    if (this.isVisible && this.data?.currentValue) {
      this.inputValue = this.data.currentValue;
    } else if (this.isVisible) {
      this.inputValue = '';
    }
  }

  /**
   * Maneja los clics en el overlay del modal.
   * Cierra el modal si se hace clic fuera del contenido.
   * @param event - Evento del clic
   */
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Maneja los eventos de teclado en el textarea.
   * Enter sin Shift confirma el modal.
   * Escape cierra el modal.
   * @param event - Evento de teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.confirm();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Confirma el contenido del modal.
   * Emite el valor del input si no está vacío y cierra el modal.
   */
  confirm(): void {
    if (this.inputValue.trim()) {
      this.confirmed.emit(this.inputValue.trim());
      this.close();
    }
  }

  /**
   * Cierra el modal.
   * Limpia el input y emite el evento de cierre.
   */
  close(): void {
    this.isVisible = false;
    this.inputValue = '';
    this.closed.emit();
  }
}
