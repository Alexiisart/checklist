import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-danger'
  | 'ghost'
  | 'icon'
  | 'text'
  | 'subtle'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Componente Button centralizado y reutilizable.
 * Incluye todos los tipos de botones del sistema de diseño
 * y permite personalizar su tamaño, tipo, texto, iconos, etc.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  /** Tipo/variante del botón */
  @Input() type: ButtonType = 'primary';

  /** Tamaño del botón */
  @Input() size: ButtonSize = 'md';

  /** Texto del botón */
  @Input() text?: string;

  /** Icono a la izquierda del texto */
  @Input() iconLeft?: string;

  /** Icono a la derecha del texto */
  @Input() iconRight?: string;

  /** Si el botón está deshabilitado */
  @Input() disabled: boolean = false;

  /** Si el botón está en estado de carga */
  @Input() loading: boolean = false;

  /** Si el botón debe ocupar todo el ancho */
  @Input() fullWidth: boolean = false;

  /** Si el botón debe ser responsivo (full width en móvil) */
  @Input() responsive: boolean = false;

  /** Tipo HTML del botón */
  @Input() htmlType: 'button' | 'submit' | 'reset' = 'button';

  /** Aria label para accesibilidad */
  @Input() ariaLabel?: string;

  /** Título del botón (tooltip) */
  @Input() title?: string;

  /** Clases CSS adicionales */
  @Input() extraClasses?: string;

  /** Evento de clic */
  @Output() clickEvent = new EventEmitter<Event>();

  /** Genera las clases CSS del botón */
  get buttonClasses(): string {
    const classes = ['btn', `btn-${this.type}`, `btn-${this.size}`];

    if (this.fullWidth) classes.push('btn-full-width');
    if (this.responsive) classes.push('btn-responsive');
    if (this.loading) classes.push('btn-loading');
    if (!this.text && (this.iconLeft || this.iconRight))
      classes.push('btn-icon-only');
    if (this.extraClasses) classes.push(this.extraClasses);

    return classes.join(' ');
  }

  /** Maneja el evento de clic */
  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clickEvent.emit(event);
    }
  }
}
