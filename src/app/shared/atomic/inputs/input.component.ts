import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'url'
  | 'tel';
export type InputVariant = 'default' | 'filled' | 'outlined' | 'minimal';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Componente Input elegante y reutilizable
 *
 * Características:
 * - Múltiples tipos de input (text, email, password, search, etc.)
 * - Soporte para textarea
 * - 4 variantes de estilo diferentes
 * - 5 tamaños predefinidos
 * - Estados de error y éxito
 * - Iconos izquierda y derecha
 * - Texto de ayuda y error
 * - Animaciones fluidas
 * - Accesibilidad completa
 * - Compatible con reactive forms
 * - Completamente responsivo
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="input-container"
      [class]="containerClasses"
      [attr.data-size]="size"
      [attr.data-variant]="variant"
    >
      @if (label) {
      <label [for]="inputId" class="input-label">{{ label }}</label>
      }

      <div class="input-wrapper">
        @if (iconLeft) {
        <span class="material-icons-outlined input-icon input-icon-left">{{
          iconLeft
        }}</span>
        } @if (isTextarea) {
        <textarea
          #inputElement
          [id]="inputId"
          class="input-field textarea-field"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [rows]="rows"
          [attr.maxlength]="maxLength || null"
          [attr.aria-label]="ariaLabel"
          [attr.aria-describedby]="ariaDescribedBy"
          [attr.title]="title || null"
          (input)="onInput($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
          (keydown)="onKeyDown($event)"
          (keyup)="onKeyUp($event)"
        ></textarea>
        } @else {
        <input
          #inputElement
          [type]="type"
          [id]="inputId"
          class="input-field"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [attr.maxlength]="maxLength || null"
          [attr.aria-label]="ariaLabel"
          [attr.aria-describedby]="ariaDescribedBy"
          [attr.title]="title || null"
          (input)="onInput($event)"
          (focus)="onFocus($event)"
          (blur)="onBlur($event)"
          (keydown)="onKeyDown($event)"
          (keyup)="onKeyUp($event)"
        />
        } @if (clearable && value && !disabled) {
        <button
          type="button"
          class="input-clear-btn"
          (click)="clearValue()"
          [attr.aria-label]="'Limpiar'"
        >
          <span class="material-icons-outlined">close</span>
        </button>
        } @else if (iconRight) {
        <span class="material-icons-outlined input-icon input-icon-right">{{
          iconRight
        }}</span>
        }
      </div>

      @if (helpText && !errorText) {
      <div class="input-help">{{ helpText }}</div>
      } @if (errorText) {
      <div class="input-error">{{ errorText }}</div>
      } @if (showCharacterCount && maxLength) {
      <div class="input-character-count">
        {{ value.length }}/{{ maxLength }}
      </div>
      }
    </div>
  `,
  styleUrls: ['./input.component.css'],
})
export class InputComponent implements ControlValueAccessor {
  // Tipo de input
  @Input() type: InputType = 'text';

  // Variante visual del input
  @Input() variant: InputVariant = 'default';

  // Tamaño del input
  @Input() size: InputSize = 'md';

  // Etiqueta del input
  @Input() label: string = '';

  // Placeholder del input
  @Input() placeholder: string = '';

  // Texto de ayuda
  @Input() helpText: string = '';

  // Texto de error
  @Input() errorText: string = '';

  // Valor del input
  @Input() value: string = '';

  // Estado disabled
  @Input() disabled: boolean = false;

  // Estado readonly
  @Input() readonly: boolean = false;

  // ID único para el input
  @Input() inputId: string = `input-${Math.random().toString(36).substr(2, 9)}`;

  // Icono izquierdo
  @Input() iconLeft: string = '';

  // Icono derecho
  @Input() iconRight: string = '';

  // Permite limpiar el input
  @Input() clearable: boolean = false;

  // Máximo de caracteres
  @Input() maxLength: number | null = null;

  // Mostrar contador de caracteres
  @Input() showCharacterCount: boolean = false;

  // Usar textarea en lugar de input
  @Input() isTextarea: boolean = false;

  // Número de filas para textarea
  @Input() rows: number = 3;

  // Etiqueta ARIA para accesibilidad
  @Input() ariaLabel: string = '';

  // ID del elemento que describe el input
  @Input() ariaDescribedBy: string = '';

  // Tooltip del input
  @Input() title: string = '';

  // Clases CSS adicionales
  @Input() extraClasses: string = '';

  // Evento emitido cuando cambia el valor
  @Output() valueChange = new EventEmitter<string>();

  // Evento emitido en focus
  @Output() focusEvent = new EventEmitter<FocusEvent>();

  // Evento emitido en blur
  @Output() blurEvent = new EventEmitter<FocusEvent>();

  // Evento emitido en keydown
  @Output() keydownEvent = new EventEmitter<KeyboardEvent>();

  // Evento emitido en keyup
  @Output() keyupEvent = new EventEmitter<KeyboardEvent>();

  @ViewChild('inputElement', { static: false })
  inputElement!: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  // Variables para ControlValueAccessor
  private onChange = (value: string) => {};
  private onTouched = () => {};

  // Clases CSS computadas para el contenedor
  get containerClasses(): string {
    const classes = ['input-base'];

    if (this.disabled) classes.push('input-disabled');
    if (this.readonly) classes.push('input-readonly');
    if (this.errorText) classes.push('input-error-state');
    if (this.iconLeft) classes.push('input-has-icon-left');
    if (this.iconRight) classes.push('input-has-icon-right');
    if (this.clearable && this.value) classes.push('input-has-clear');
    if (this.extraClasses) classes.push(this.extraClasses);

    return classes.join(' ');
  }

  // Maneja el evento input
  onInput(event: Event): void {
    if (this.disabled || this.readonly) return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = target.value;

    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  // Maneja el evento focus
  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  // Maneja el evento blur
  onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurEvent.emit(event);
  }

  // Maneja el evento keydown
  onKeyDown(event: KeyboardEvent): void {
    this.keydownEvent.emit(event);
  }

  // Maneja el evento keyup
  onKeyUp(event: KeyboardEvent): void {
    this.keyupEvent.emit(event);
  }

  // Limpia el valor del input
  clearValue(): void {
    if (this.disabled || this.readonly) return;

    this.value = '';
    this.onChange('');
    this.valueChange.emit('');

    // Focus al input después de limpiar
    if (this.inputElement?.nativeElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  // Enfoca el input
  focus(): void {
    if (this.inputElement?.nativeElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  // Selecciona todo el texto del input
  selectAll(): void {
    if (this.inputElement?.nativeElement) {
      this.inputElement.nativeElement.select();
    }
  }

  // Implementación de ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';

    // Forzar actualización del input nativo si está disponible
    if (this.inputElement?.nativeElement) {
      this.inputElement.nativeElement.value = this.value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
