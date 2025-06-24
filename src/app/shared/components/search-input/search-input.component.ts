import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../atomic/inputs';

/**
 * Componente de barra de búsqueda reutilizable
 * Recibe el término de búsqueda como input y emite eventos de cambio y limpieza
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <div class="search-container">
      <app-input
        type="search"
        [placeholder]="placeholder"
        [value]="searchTerm"
        iconLeft="search"
        [clearable]="true"
        size="md"
        variant="default"
        extraClasses="search-input-custom"
        (valueChange)="onSearchChange($event)"
        (keydownEvent)="onKeyDown($event)"
      ></app-input>
    </div>
  `,
  styles: [
    `
      .search-container {
        margin-bottom: var(--space-6);
        display: flex;
        justify-content: flex-start;
        width: 100%;
        max-width: 400px;
      }

      /* Estilos personalizados para el input de búsqueda */
      .search-input-custom {
        width: 100%;
      }

      /* Responsive para barra de búsqueda */
      @media (max-width: 768px) {
        .search-container {
          margin-bottom: var(--space-4);
          max-width: 100%;
        }
      }
    `,
  ],
})
export class SearchInputComponent {
  /**
   * Término de búsqueda actual
   */
  @Input() searchTerm: string = '';

  /**
   * Placeholder del input de búsqueda
   */
  @Input() placeholder: string = 'Buscar...';

  /**
   * Evento emitido cuando cambia el término de búsqueda
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Evento emitido cuando se limpia la búsqueda
   */
  @Output() clearSearch = new EventEmitter<void>();

  /**
   * Maneja el cambio en el input de búsqueda
   */
  onSearchChange(value: string): void {
    this.searchChange.emit(value);

    // Si el valor está vacío, emitir evento de limpiar
    if (!value.trim()) {
      this.clearSearch.emit();
    }
  }

  /**
   * Maneja eventos de teclado
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearSearch.emit();
    }
  }
}
