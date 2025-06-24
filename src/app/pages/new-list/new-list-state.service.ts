import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ChecklistService } from '../../services/checklist.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmData } from '../../models/task.interface';

/** Interfaz que define la estructura del estado del componente new-list */
export interface NewListState {
  taskInput: string;
  showConfirmModal: boolean;
  confirmModalData: ConfirmData | null;
  isGenerating: boolean;
}

/** Servicio que maneja el estado y la lógica del componente NewList */
@Injectable()
export class NewListStateService {
  private stateSubject = new BehaviorSubject<NewListState>({
    taskInput: '',
    showConfirmModal: false,
    confirmModalData: null,
    isGenerating: false,
  });

  // Observable público para el estado
  state$ = this.stateSubject.asObservable();

  constructor(
    private router: Router,
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /** Actualiza el estado del componente */
  private updateState(partialState: Partial<NewListState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /** Actualiza el texto de entrada de tareas */
  updateTaskInput(input: string): void {
    this.updateState({ taskInput: input });
  }

  /** Maneja el evento de presionar una tecla en el textarea */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.generateChecklist();
    }
  }

  /**
   * Genera un nuevo checklist a partir del texto ingresado.
   * Valida el input, crea la lista y navega a la vista del checklist.
   */
  generateChecklist(): void {
    const currentState = this.stateSubject.value;
    const input = currentState.taskInput.trim();

    if (!input) {
      this.toastService.showAlert(
        'Por favor ingresa al menos una tarea',
        'warning'
      );
      return;
    }

    // Parsear las tareas del input
    const taskNames = input
      .split(',')
      .map((task) => task.trim())
      .filter((task) => task);

    if (taskNames.length === 0) {
      this.toastService.showAlert(
        'No se encontraron tareas válidas',
        'warning'
      );
      return;
    }

    // Marcar como generando
    this.updateState({ isGenerating: true });

    // Crear la lista con las tareas parseadas
    this.checklistService.createNewList(taskNames);

    this.toastService.showAlert(
      `Checklist generado con ${taskNames.length} tareas`,
      'success'
    );

    // Navegar al checklist después de un breve retraso
    setTimeout(() => {
      this.updateState({ isGenerating: false });
      this.router.navigate(['/checklist']);
    }, 500);
  }

  /** Inicia el proceso para volver al inicio */
  backToHome(): void {
    const currentState = this.stateSubject.value;
    const hasInputContent = currentState.taskInput.trim().length > 0;

    if (hasInputContent) {
      this.updateState({
        confirmModalData: {
          title: 'Volver al inicio',
          message:
            '¿Quieres volver al inicio? Se perderá el contenido que hayas escrito.',
          confirmText: 'Sí, volver',
          cancelText: 'Cancelar',
        },
        showConfirmModal: true,
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  /** Confirma la acción de volver al inicio */
  confirmBackToHome(): void {
    this.updateState({ taskInput: '' });
    this.router.navigate(['/home']);
    this.closeConfirmModal();
  }

  /** Cancela la acción de volver al inicio */
  cancelBackToHome(): void {
    this.closeConfirmModal();
  }

  /** Cierra el modal de confirmación */
  private closeConfirmModal(): void {
    this.updateState({
      showConfirmModal: false,
      confirmModalData: null,
    });
  }

  /** Obtiene el valor actual del estado */
  getCurrentState(): NewListState {
    return this.stateSubject.value;
  }

  /** Limpia el estado cuando se destruye el componente */
  cleanup(): void {
    this.updateState({
      taskInput: '',
      showConfirmModal: false,
      confirmModalData: null,
      isGenerating: false,
    });
  }
}
