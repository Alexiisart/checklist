import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamMember } from '../../../models/task.interface';
import { ButtonComponent } from '../buttons';

/**
 * Componente dropdown para gestionar asignaciones de equipo.
 * Permite seleccionar líderes y miembros de equipo.
 */
export type TeamDropdownType = 'leader' | 'member';
export type TeamDropdownSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-team-dropdown',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="team-dropdown" [class]="getSizeClass()">
      @if (type === 'leader' && isVisible) {
      <div class="team-dropdown-content">
        <div class="team-dropdown-header">
          <h4>Asignar Líder:</h4>
          <div class="leader-options">
            <app-button
              size="sm"
              [type]="!selectedMember ? 'secondary' : 'ghost'"
              text="Sin líder"
              (clickEvent)="onMemberSelect(null)"
            >
            </app-button>
            @for (member of teamMembers; track member.id) {
            <app-button
              size="sm"
              [type]="selectedMember?.id === member.id ? 'secondary' : 'ghost'"
              [text]="member.name"
              (clickEvent)="onMemberSelect(member)"
            >
            </app-button>
            }
          </div>
        </div>
        <div class="close-dropdown-btn">
          <app-button
            size="sm"
            type="outline-secondary"
            text="Cerrar"
            (clickEvent)="onClose()"
          >
          </app-button>
        </div>
      </div>
      } @if (type === 'member') {
      <select
        #memberSelect
        class="member-select"
        [value]="getSelectedMemberId()"
        (change)="onMemberSelectionChange($event)"
        [disabled]="!teamMembers || teamMembers.length === 0"
      >
        <option value="">Sin asignar</option>
        @for (member of teamMembers; track member.id) {
        <option [value]="member.id.toString()">{{ member.name }}</option>
        }
      </select>
      }
    </div>
  `,
  styleUrls: ['./team-dropdown.component.css'],
})
export class TeamDropdownComponent implements OnChanges {
  /** Referencia al select element */
  @ViewChild('memberSelect') memberSelect?: ElementRef<HTMLSelectElement>;

  /** Tipo de dropdown: 'leader' para seleccionar líder, 'member' para miembros */
  @Input() type: TeamDropdownType = 'member';

  /** Tamaño del dropdown: 'sm', 'md' o 'lg' */
  @Input() size: TeamDropdownSize = 'md';

  /** Lista de miembros del equipo disponibles */
  @Input() teamMembers: TeamMember[] = [];

  /** Miembro actualmente seleccionado */
  @Input() selectedMember: TeamMember | null = null;

  /** Controla la visibilidad del dropdown (solo para tipo 'leader') */
  @Input() isVisible: boolean = false;

  /** Texto placeholder para el dropdown */
  @Input() placeholder: string = 'Seleccionar miembro';

  /** Estado deshabilitado del dropdown */
  @Input() disabled: boolean = false;

  /** Emite cuando se selecciona un miembro */
  @Output() memberSelected = new EventEmitter<TeamMember | null>();

  /** Emite cuando se cierra el dropdown (solo para tipo 'leader') */
  @Output() closed = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Maneja la selección de un miembro en el dropdown tipo 'leader'
   * @param member Miembro seleccionado o null para "Sin líder"
   */
  onMemberSelect(member: TeamMember | null): void {
    this.memberSelected.emit(member);
  }

  /**
   * Maneja el cambio de selección en el dropdown tipo 'member'
   * @param event Evento del select nativo
   */
  onMemberSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const memberId = target.value;

    const selectedMember = memberId
      ? this.teamMembers.find((m) => m.id.toString() === memberId.toString()) ||
        null
      : null;

    this.memberSelected.emit(selectedMember);
  }

  /** Maneja el cierre del dropdown tipo 'leader' */
  onClose(): void {
    this.closed.emit();
  }

  /** Obtiene la clase CSS según el tamaño configurado */
  getSizeClass(): string {
    return `team-dropdown--${this.size}`;
  }

  /** Detecta cambios en las propiedades de entrada */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedMember'] || changes['teamMembers']) {
      // Forzar detección de cambios y actualización del select
      this.cdr.detectChanges();

      // Actualizar el valor del select manualmente
      setTimeout(() => {
        this.updateSelectValue();
      }, 0);
    }
  }

  /** Obtiene el ID del miembro seleccionado como string */
  getSelectedMemberId(): string {
    return this.selectedMember?.id?.toString() || '';
  }

  /** Actualiza manualmente el valor del select */
  private updateSelectValue(): void {
    if (this.memberSelect && this.type === 'member') {
      const selectElement = this.memberSelect.nativeElement;
      const selectedId = this.getSelectedMemberId();
      selectElement.value = selectedId;
    }
  }
}
