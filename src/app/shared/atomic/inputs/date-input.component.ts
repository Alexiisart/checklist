import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipComponent],
  template: `
    <div class="date-input-container" [class]="'size-' + size">
      <div
        class="date-input-wrapper"
        (mouseenter)="showTooltip = true"
        (mouseleave)="showTooltip = false"
      >
        <input
          [id]="inputId"
          type="date"
          class="date-input"
          [class.overdue]="isOverdue"
          [(ngModel)]="dateValue"
          (ngModelChange)="onDateChange($event)"
          [placeholder]="placeholder"
          [min]="minDate"
          [disabled]="disabled"
        />

        @if (title) {
        <app-tooltip
          [text]="title"
          [visible]="showTooltip"
          position="top"
          variant="default"
        >
        </app-tooltip>
        } @if (dateValue && !disabled) {
        <button
          type="button"
          class="clear-date-btn"
          (click)="clearDate()"
          title="Eliminar fecha"
        >
          <span class="material-icons-outlined">close</span>
        </button>
        }
      </div>
    </div>
  `,
  styleUrls: ['./date-input.component.css'],
})
export class DateInputComponent implements OnInit, OnChanges {
  /** ID del input de fecha */
  @Input() inputId = 'date-input';

  /** Texto placeholder del input */
  @Input() placeholder = '';

  /** Valor del input en formato ISO string o null */
  @Input() value: string | null = null;

  /** Tamaño del input: 'sm' | 'md' | 'lg' */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Si el input está deshabilitado */
  @Input() disabled = false;

  /** Fecha mínima permitida en formato ISO string */
  @Input() minDate: string | null = null;

  /** Texto del tooltip */
  @Input() title = '';

  /** Evento emitido cuando cambia el valor */
  @Output() valueChange = new EventEmitter<string | null>();

  /** Valor actual del input */
  dateValue = '';

  /** Controla la visibilidad del tooltip */
  showTooltip = false;

  /**
   * Inicializa el componente estableciendo el valor inicial
   * y la fecha mínima por defecto si no se proporciona
   */
  ngOnInit(): void {
    this.dateValue = this.value ? this.formatDateForInput(this.value) : '';
    if (!this.minDate) {
      this.minDate = new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Actualiza el valor del input cuando cambian las propiedades
   */
  ngOnChanges(): void {
    this.dateValue = this.value ? this.formatDateForInput(this.value) : '';
  }

  /**
   * Maneja el cambio de fecha y emite el nuevo valor
   * @param value Nueva fecha seleccionada
   */
  onDateChange(value: string): void {
    const isoDate = value ? new Date(value).toISOString() : null;
    this.valueChange.emit(isoDate);
  }

  /**
   * Limpia el valor del input
   */
  clearDate(): void {
    this.dateValue = '';
    this.valueChange.emit(null);
  }

  /**
   * Formatea una fecha ISO para mostrarla en el input
   * @param isoDate Fecha en formato ISO string
   * @returns Fecha formateada YYYY-MM-DD
   */
  private formatDateForInput(isoDate: string): string {
    return isoDate.split('T')[0];
  }

  /**
   * Determina si la fecha está vencida
   * @returns true si la fecha es anterior a hoy
   */
  get isOverdue(): boolean {
    if (!this.dateValue) return false;
    return new Date(this.dateValue) < new Date();
  }
}
