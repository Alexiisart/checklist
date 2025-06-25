import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { ReorderModalComponent } from '../../shared/components/reorder-modal/reorder-modal.component';
import { ButtonComponent } from '../../shared/atomic/buttons';
import { InputComponent } from '../../shared/atomic/inputs';
import {
  ChecklistStateService,
  ChecklistState,
} from './checklist-state.service';
import { Task, Subtask } from '../../models/task.interface';
import {
  ChecklistTasksService,
  ChecklistSubtasksService,
  ChecklistErrorsService,
  ChecklistModalsService,
  ChecklistNavigationService,
  ChecklistExportService,
  ChecklistReorderService,
} from '../../services/functions/checklist';
import { ChecklistService } from '../../services/checklist.service';

/**
 * Componente principal del checklist.
 * Sigue el patrón arquitectónico de HomeComponent con servicios de funciones inyectados directamente.
 * Ver CHECKLIST_ARCHITECTURE.md para detalles completos de la arquitectura.
 */
@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    CommonModule,
    TaskItemComponent,
    ModalComponent,
    ConfirmModalComponent,
    AlertModalComponent,
    ReorderModalComponent,
    ButtonComponent,
    InputComponent,
  ],
  providers: [ChecklistStateService],
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css'],
})
export class ChecklistComponent implements OnInit, OnDestroy {
  // ===== ESTADO BÁSICO =====
  public state$: Observable<ChecklistState>;

  // Propiedades para el template (compatibilidad con HTML existente)
  currentList: any = null;
  progress = { completed: 0, total: 0, percentage: 0 };

  // ===== OBSERVABLES DE SERVICIOS DE FUNCIONES =====

  // Observables del servicio de tareas
  public taskShowConfirmModal$!: Observable<boolean>;
  public taskConfirmModalData$!: Observable<any>;

  // Observables del servicio de modales
  public showEditModal$!: Observable<boolean>;
  public editModalData$!: Observable<any>;
  public showSaveModal$!: Observable<boolean>;
  public saveModalData$!: Observable<any>;
  public showAlertModal$!: Observable<boolean>;
  public alertModalData$!: Observable<any>;

  // Observables del servicio de navegación
  public navigationShowConfirmModal$!: Observable<boolean>;
  public navigationConfirmModalData$!: Observable<any>;

  // Observables de reordenamiento
  public showReorderModal$!: Observable<boolean>;
  public reorderModalData$!: Observable<any>;

  // ===== CONTROL DE SUBSCRIPCIONES =====
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private stateService: ChecklistStateService,
    private checklistService: ChecklistService,
    // Servicios de funciones
    private tasksService: ChecklistTasksService,
    private subtasksService: ChecklistSubtasksService,
    private errorsService: ChecklistErrorsService,
    private modalsService: ChecklistModalsService,
    private navigationService: ChecklistNavigationService,
    private exportService: ChecklistExportService,
    private reorderService: ChecklistReorderService
  ) {
    // Inicializar observable del estado básico
    this.state$ = this.stateService.state$;

    // Inicializar observables de servicios de funciones
    this.initializeServiceObservables();
  }

  /** Inicializa todos los observables de los servicios de funciones */
  private initializeServiceObservables(): void {
    // Observables del servicio de tareas
    this.taskShowConfirmModal$ = this.tasksService.showConfirmModal$;
    this.taskConfirmModalData$ = this.tasksService.confirmModalData$;

    // Observables del servicio de modales
    this.showEditModal$ = this.modalsService.showEditModal$;
    this.editModalData$ = this.modalsService.editModalData$;
    this.showSaveModal$ = this.modalsService.showSaveModal$;
    this.saveModalData$ = this.modalsService.saveModalData$;
    this.showAlertModal$ = this.modalsService.showAlertModal$;
    this.alertModalData$ = this.modalsService.alertModalData$;

    // Observables del servicio de navegación
    this.navigationShowConfirmModal$ = this.navigationService.showConfirmModal$;
    this.navigationConfirmModalData$ = this.navigationService.confirmModalData$;

    // Observables del servicio de reordenamiento
    this.showReorderModal$ = this.reorderService.showReorderModal$;
    this.reorderModalData$ = this.reorderService.reorderModalData$;
  }

  // Inicializa el componente suscribiéndose a los cambios de ruta y estado
  ngOnInit(): void {
    // Suscribirse a cambios de ruta
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const listId = params['id'];
      if (listId) {
        this.stateService.initializeWithListId(listId);
      }
    });

    // Suscribirse al estado para mantener compatibilidad con el HTML original
    this.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.currentList = state.currentList;
      this.progress = state.progress;
    });
  }

  // Limpia recursos al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.cleanup();
  }

  // ===== MÉTODOS DE CICLO DE VIDA Y UTILIDADES =====

  /** Función de tracking personalizada para el ngFor de tareas */
  trackByTaskId(index: number, task: any): string | number {
    // Si no hay ID válido, usar el índice como fallback
    if (!task || (!task.id && task.id !== 0)) {
      console.warn('Tarea sin ID válido detectada en índice:', index, task);
      return `fallback-task-${index}`;
    }
    return task.id;
  }

  // ===== GESTIÓN DE TAREAS =====

  /** Maneja el cambio de estado completado/no completado de una tarea */
  onTaskToggled(event: { taskId: number; completed: boolean }): void {
    this.tasksService.toggleTask(event.taskId, event.completed);
    this.stateService.markAsChanged();
  }

  /** Actualiza el nombre de una tarea existente */
  onTaskUpdated(event: { taskId: number; newName: string }): void {
    this.tasksService.updateTask(event.taskId, event.newName);
    this.stateService.markAsChanged();
  }

  /** Elimina una tarea existente */
  onTaskDeleted(taskId: number): void {
    this.tasksService.initiateTaskDeletion(taskId);
  }

  /** Confirma la eliminación de la tarea */
  confirmTaskDeletion(): void {
    this.tasksService.confirmTaskDeletion();
    this.stateService.markAsChanged();
  }

  /** Cancela la eliminación de la tarea */
  cancelTaskDeletion(): void {
    this.tasksService.cancelTaskDeletion();
  }

  // ===== GESTIÓN DE SUBTAREAS =====

  /** Maneja el cambio de estado completado/no completado de una subtarea */
  onSubtaskToggled(event: {
    taskId: number;
    subtaskId: number;
    completed: boolean;
  }): void {
    this.subtasksService.toggleSubtask(
      event.taskId,
      event.subtaskId,
      event.completed
    );
    this.stateService.markAsChanged();
  }

  // Agrega una nueva subtarea a una tarea existente
  onSubtaskAdded(event: { taskId: number; name: string }): void {
    this.subtasksService.addSubtask(event.taskId, event.name);
    this.stateService.markAsChanged();
  }

  // Elimina una subtarea existente
  onSubtaskRemoved(event: { taskId: number; subtaskId: number }): void {
    this.subtasksService.removeSubtask(event.taskId, event.subtaskId);
    this.stateService.markAsChanged();
  }

  // Actualiza el nombre de una subtarea existente
  onSubtaskUpdated(event: {
    taskId: number;
    subtaskId: number;
    newName: string;
  }): void {
    this.subtasksService.updateSubtask(
      event.taskId,
      event.subtaskId,
      event.newName
    );
    this.stateService.markAsChanged();
  }

  // Reordena las subtareas de una tarea específica
  onSubtasksReordered(): void {
    this.reorderService.reorderSubtasks();
    // Marcar cambios en el ChecklistService para la detección de navegación
    this.checklistService.markAsUnsaved();
    this.stateService.markAsChanged();
  }

  // ===== GESTIÓN DE ERRORES =====

  /** Agrega un nuevo error a una tarea */
  onErrorAdded(event: { taskId: number; description: string }): void {
    this.errorsService.addError(event.taskId, event.description);
    this.stateService.markAsChanged();
  }

  /** Elimina un error existente */
  onErrorRemoved(event: { taskId: number; errorId: number }): void {
    this.errorsService.removeError(event.taskId, event.errorId);
    this.stateService.markAsChanged();
  }

  /** Actualiza la descripción de un error existente */
  onErrorUpdated(event: {
    taskId: number;
    errorId: number;
    newDescription: string;
  }): void {
    this.errorsService.updateError(
      event.taskId,
      event.errorId,
      event.newDescription
    );
    this.stateService.markAsChanged();
  }

  // ===== EXPORTACIÓN =====

  /** Exporta una tarea específica a TXT */
  onTaskExported(taskId: number): void {
    if (this.currentList) {
      this.exportService.exportSingleTaskToTXT(this.currentList, taskId);
    }
  }

  /** Exporta la lista actual a PDF */
  exportToPDF(): void {
    if (this.currentList) {
      this.exportService.exportToPDF(this.currentList);
    }
  }

  /** Exporta la lista actual a TXT */
  exportToTXT(): void {
    if (this.currentList) {
      this.exportService.exportToTXT(this.currentList);
    }
  }

  // ===== NAVEGACIÓN Y OBSERVACIONES =====

  /** Maneja cambios en las observaciones generales */
  onObservationsChange(): void {
    if (this.currentList) {
      this.navigationService.updateObservations(this.currentList.observations);
      this.stateService.markAsChanged();
    }
  }

  /** Activa el modo de edición masiva de tareas */
  editMode(): void {
    if (!this.currentList) return;

    const tasksString = this.currentList.tasks
      .map((task: any) => task.name)
      .join(', ');

    this.modalsService.showEditModal(tasksString);
  }

  /** Confirma los cambios realizados en modo edición masiva */
  onEditConfirm(newTasksString: string): void {
    this.navigationService.editTasksInBulk(newTasksString);
    this.stateService.markAsChanged();
    this.modalsService.closeEditModal();
  }

  /** Cierra el modal de edición masiva */
  closeEditModal(): void {
    this.modalsService.closeEditModal();
  }

  /** Confirma el guardado de la lista */
  onSaveConfirm(name: string): void {
    const saved = this.navigationService.saveList(name);

    if (saved) {
      this.stateService.updateState({ hasUnsavedChanges: false });
      this.modalsService.closeSaveModal();

      // Si hay una acción pendiente en navegación, manejarla
      if (this.navigationService.currentPendingAction === 'go-home') {
        setTimeout(() => {
          // El navigationService maneja la navegación
        }, 1000);
      }
    }
  }

  /** Cierra el modal de guardado */
  closeSaveModal(): void {
    this.modalsService.closeSaveModal();
  }

  /** Confirma el inicio de una nueva lista */
  confirmStartNewList(): void {
    this.navigationService.confirmStartNewList();
  }

  /** Confirma la acción pendiente (limpiar lista, eliminar tarea, etc) */
  onConfirmAction(): void {
    this.navigationService.confirmAction(this.currentList);

    // Si la acción requiere mostrar modal de guardado, hacerlo
    if (
      this.navigationService.currentPendingAction === 'go-home' &&
      (!this.currentList?.name || this.currentList.name.trim() === '')
    ) {
      this.navigationService.setPendingAction('go-home');
      this.showSaveModalDialog();
    }
  }

  /** Cancela la acción pendiente */
  onCancelAction(): void {
    this.navigationService.cancelAction();
  }

  /** Navega a la página principal */
  goHome(): void {
    this.navigationService.goHome();
  }

  // ===== MODALES Y UTILIDADES =====

  /** Muestra el modal para guardar la lista (incluye sugerencia automática de nombre) */
  showSaveModalDialog(): void {
    let suggestedName = this.currentList?.name || '';

    // Si no tiene nombre, sugerir el nombre de la primera tarea
    if (!suggestedName || suggestedName.trim() === '') {
      const firstTask = this.currentList?.tasks?.[0];
      if (firstTask) {
        suggestedName = firstTask.name;
      }
    }

    this.modalsService.showSaveModal(suggestedName);
  }

  /** Cierra el modal de alerta */
  closeAlert(): void {
    this.modalsService.closeAlertModal();
  }

  /** Guarda directamente el progreso o pide nombre si no lo tiene */
  saveProgress(): void {
    const saved = this.navigationService.saveProgressDirectly(this.currentList);

    if (saved) {
      this.stateService.updateState({ hasUnsavedChanges: false });
    } else if (
      this.currentList &&
      (!this.currentList.name || this.currentList.name.trim() === '')
    ) {
      this.showSaveModalDialog();
    }
  }

  /** Obtiene el texto del botón de guardar según el estado */
  getSaveButtonText(): string {
    return this.currentList?.name ? 'Guardar' : 'Guardar como...';
  }

  /** Obtiene el tooltip del botón de guardar según el estado */
  getSaveButtonTooltip(): string {
    return this.currentList?.name
      ? 'Actualizar la lista guardada'
      : 'Guardar la lista con un nombre';
  }

  // ===== REORDENAMIENTO =====

  /** Muestra el modal de reordenamiento de tareas */
  showReorderModal(): void {
    if (this.currentList) {
      this.reorderService.showTaskReorderModal(this.currentList);
    }
  }

  /** Confirma el reordenamiento de tareas */
  onReorderConfirm(reorderedTasks: Task[]): void {
    this.reorderService.confirmTaskReorder(reorderedTasks);
    // Marcar cambios en el ChecklistService para la detección de navegación
    this.checklistService.markAsUnsaved();
    this.stateService.markAsChanged();
  }

  /** Cierra el modal de reordenamiento */
  closeReorderModal(): void {
    this.reorderService.closeReorderModal();
  }
}
