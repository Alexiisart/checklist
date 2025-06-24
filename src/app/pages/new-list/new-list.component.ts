import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../shared/atomic/buttons';
import { InputComponent } from '../../shared/atomic/inputs';
import { ConfirmData } from '../../models/task.interface';
import { NewListStateService, NewListState } from './new-list-state.service';

/** Componente para crear una nueva lista de tareas.
 *  Permite al usuario ingresar tareas separadas por comas y generar un checklist. */
@Component({
  selector: 'app-new-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent,
    ButtonComponent,
    InputComponent,
  ],
  providers: [NewListStateService],
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.css'],
})
export class NewListComponent implements OnInit, OnDestroy {
  // Estado reactivo desde el service
  state$: Observable<NewListState>;

  // Propiedades expuestas para el template (compatibilidad con HTML original)
  taskInput = '';
  showConfirmModal = false;
  confirmModalData: ConfirmData | null = null;
  isGenerating = false;

  private destroy$ = new Subject<void>();

  constructor(private stateService: NewListStateService) {
    this.state$ = this.stateService.state$;
  }

  // Inicializa el componente suscribiéndose al estado
  ngOnInit(): void {
    // Suscribirse a los cambios de estado
    this.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.taskInput = state.taskInput;
      this.showConfirmModal = state.showConfirmModal;
      this.confirmModalData = state.confirmModalData;
      this.isGenerating = state.isGenerating;
    });
  }

  // Limpia recursos al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.cleanup();
  }

  /** Navega de vuelta a la página principal */
  backToHome(): void {
    this.stateService.backToHome();
  }

  /** Maneja el cambio en el input de tareas */
  onTaskInputChange(): void {
    this.stateService.updateTaskInput(this.taskInput);
  }

  /** Maneja el evento de presionar una tecla en el textarea */
  onKeyPress(event: KeyboardEvent): void {
    this.stateService.onKeyPress(event);
  }

  /** Genera el checklist basado en el input de tareas */
  generateChecklist(): void {
    this.stateService.generateChecklist();
  }

  /** Maneja la confirmación del modal */
  onConfirmAction(): void {
    this.stateService.confirmBackToHome();
  }

  /** Maneja la cancelación del modal */
  onCancelAction(): void {
    this.stateService.cancelBackToHome();
  }
}
