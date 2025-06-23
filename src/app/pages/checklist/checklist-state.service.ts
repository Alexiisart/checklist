import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, first } from 'rxjs';
import { Router } from '@angular/router';
import { ChecklistService } from '../../services/checklist.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { ToastService } from '../../services/toast.service';
import {
  ChecklistData,
  ConfirmData,
  AlertData,
  ModalData,
} from '../../models/task.interface';

/** Interfaz que define la estructura del estado del checklist */
export interface ChecklistState {
  currentList: ChecklistData | null;
  progress: { completed: number; total: number; percentage: number };
  showEditModal: boolean;
  editModalData: ModalData | null;
  showSaveModalDialog: boolean;
  saveModalData: ModalData | null;
  showConfirmModal: boolean;
  confirmModalData: ConfirmData | null;
  showAlertModal: boolean;
  alertModalData: AlertData | null;
  hasUnsavedChanges: boolean;
}

/** Servicio que maneja el estado y la lógica del checklist */
@Injectable()
export class ChecklistStateService implements OnDestroy {
  private readonly AUTO_SAVE_INTERVAL = 15000; // 15 segundos

  private stateSubject = new BehaviorSubject<ChecklistState>({
    currentList: null,
    progress: { completed: 0, total: 0, percentage: 0 },
    showEditModal: false,
    editModalData: null,
    showSaveModalDialog: false,
    saveModalData: null,
    showConfirmModal: false,
    confirmModalData: null,
    showAlertModal: false,
    alertModalData: null,
    hasUnsavedChanges: false,
  });

  private destroy$ = new Subject<void>();
  private autoSaveInterval: any = null;
  private listId: string | null = null;
  private pendingAction: string | null = null;
  private pendingDeleteTaskId: number | null = null;

  // Observable público para el estado
  state$ = this.stateSubject.asObservable();

  constructor(
    private router: Router,
    private checklistService: ChecklistService,
    private pdfExportService: PdfExportService,
    private toastService: ToastService
  ) {
    this.subscribeToChecklistChanges();
  }

  /** Limpia recursos cuando se destruye el servicio */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** Inicializa el estado con un ID de lista específico y comienza el autoguardado */
  initializeWithListId(listId: string): void {
    this.listId = listId;
    if (this.listId) {
      this.loadList(this.listId);
    }
    this.startAutoSave();
  }

  /** Limpia recursos y detiene el autoguardado */
  cleanup(): void {
    this.stopAutoSave();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Suscribe el servicio a cambios en la lista del checklist */
  private subscribeToChecklistChanges(): void {
    this.checklistService.currentList$.subscribe((list) => {
      this.updateState({ currentList: list });
      this.updateProgress();
    });
  }

  /** Carga una lista por su ID */
  private loadList(listId: string): void {
    const list = this.checklistService.loadList(listId);
    if (!list) {
      this.toastService.showAlert('Lista no encontrada', 'danger');
      this.router.navigate(['/home']);
    }
  }

  /** Actualiza el progreso de las tareas completadas */
  private updateProgress(): void {
    const progress = this.checklistService.getProgress();
    this.updateState({ progress });

    if (progress.total > 0 && progress.completed === progress.total) {
      setTimeout(() => {
        this.toastService.showAlert(
          '¡Felicitaciones! Has completado todas las tareas',
          'success'
        );
      }, 300);
    }
  }

  /** Actualiza el estado del checklist */
  private updateState(partialState: Partial<ChecklistState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /** Maneja el cambio de estado de una tarea */
  onTaskToggled(event: { taskId: number; completed: boolean }): void {
    this.checklistService.toggleTask(event.taskId, event.completed);
    this.markAsChanged();
  }

  /** Maneja el cambio de estado de una subtarea */
  onSubtaskToggled(event: {
    taskId: number;
    subtaskId: number;
    completed: boolean;
  }): void {
    this.checklistService.toggleSubtask(
      event.taskId,
      event.subtaskId,
      event.completed
    );
    this.markAsChanged();
  }

  /** Agrega una nueva subtarea a una tarea */
  onSubtaskAdded(event: { taskId: number; name: string }): void {
    const subtasks = event.name
      .split('+')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this.checklistService.addSubtask(event.taskId, event.name);
    this.markAsChanged();

    const message =
      subtasks.length > 1
        ? `${subtasks.length} subtareas agregadas`
        : `Subtarea "${event.name}" agregada`;
    this.toastService.showAlert(message, 'success');
  }

  /** Elimina una subtarea de una tarea */
  onSubtaskRemoved(event: { taskId: number; subtaskId: number }): void {
    this.checklistService.removeSubtask(event.taskId, event.subtaskId);
    this.markAsChanged();
    this.toastService.showAlert('Subtarea eliminada', 'info');
  }

  /** Actualiza el nombre de una subtarea */
  onSubtaskUpdated(event: {
    taskId: number;
    subtaskId: number;
    newName: string;
  }): void {
    this.checklistService.updateSubtask(
      event.taskId,
      event.subtaskId,
      event.newName
    );
    this.markAsChanged();
    this.toastService.showAlert(
      `Subtarea actualizada: "${event.newName}"`,
      'success'
    );
  }

  /** Agrega un nuevo error a una tarea */
  onErrorAdded(event: { taskId: number; description: string }): void {
    this.checklistService.addError(event.taskId, event.description);
    this.markAsChanged();
    this.toastService.showAlert(
      `Error agregado: "${event.description}"`,
      'warning'
    );
  }

  /** Elimina un error de una tarea */
  onErrorRemoved(event: { taskId: number; errorId: number }): void {
    this.checklistService.removeError(event.taskId, event.errorId);
    this.markAsChanged();
    this.toastService.showAlert('Error eliminado', 'info');
  }

  /** Actualiza la descripción de un error */
  onErrorUpdated(event: {
    taskId: number;
    errorId: number;
    newDescription: string;
  }): void {
    this.checklistService.updateError(
      event.taskId,
      event.errorId,
      event.newDescription
    );
    this.markAsChanged();
    this.toastService.showAlert(
      `Error actualizado: "${event.newDescription}"`,
      'warning'
    );
  }

  /** Actualiza el nombre de una tarea */
  onTaskUpdated(event: { taskId: number; newName: string }): void {
    this.checklistService.updateTask(event.taskId, event.newName);
    this.markAsChanged();
    this.toastService.showAlert(
      `Tarea actualizada: "${event.newName}"`,
      'success'
    );
  }

  /** Inicia el proceso de eliminación de una tarea */
  onTaskDeleted(taskId: number): void {
    const currentState = this.stateSubject.value;
    const task = currentState.currentList?.tasks.find((t) => t.id === taskId);
    const taskName = task?.name || '';

    this.pendingDeleteTaskId = taskId;
    this.updateState({
      confirmModalData: {
        title: 'Eliminar Tarea',
        message: `¿Estás seguro de que quieres eliminar la tarea "${taskName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
      showConfirmModal: true,
    });
  }

  /** Maneja cambios en las observaciones de la lista */
  onObservationsChange(): void {
    const currentState = this.stateSubject.value;
    if (currentState.currentList) {
      this.checklistService.updateObservations(
        currentState.currentList.observations
      );
      this.markAsChanged();
    }
  }

  /** Activa el modo de edición mostrando el modal correspondiente */
  editMode(): void {
    const currentState = this.stateSubject.value;
    if (!currentState.currentList) return;

    const tasksString = currentState.currentList.tasks
      .map((task) => task.name)
      .join(', ');

    this.updateState({
      editModalData: {
        title: 'Editar Lista de Tareas',
        label: 'Tareas separadas por comas:',
        placeholder: 'Cliente, Vehículos, Reclamos, Inventario...',
        currentValue: tasksString,
      },
      showEditModal: true,
    });
  }

  /** Confirma la edición de la lista de tareas */
  onEditConfirm(newTasksString: string): void {
    this.checklistService.updateTasks(newTasksString);
    this.markAsChanged();
    this.toastService.showAlert(
      'Lista actualizada preservando datos existentes',
      'success'
    );
    this.closeEditModal();
  }

  /** Cierra el modal de edición */
  closeEditModal(): void {
    this.updateState({
      showEditModal: false,
      editModalData: null,
    });
  }

  /** Muestra el modal para guardar la lista */
  showSaveModal(): void {
    const currentState = this.stateSubject.value;
    const currentName = currentState.currentList?.name || '';

    this.updateState({
      saveModalData: {
        title: 'Guardar Lista',
        label: 'Nombre de la lista:',
        placeholder: 'Mi checklist del día...',
        currentValue: currentName,
      },
      showSaveModalDialog: true,
    });
  }

  /** Confirma el guardado de la lista */
  onSaveConfirm(name: string): void {
    const saved = this.checklistService.saveList(name);

    if (!saved) {
      if (!name.trim()) {
        this.toastService.showAlert(
          'El nombre no puede estar vacío',
          'warning'
        );
      }
      return;
    }

    this.updateState({ hasUnsavedChanges: false });
    this.closeSaveModal();
    this.toastService.showAlert('Lista guardada exitosamente', 'success');

    if (this.pendingAction === 'go-home') {
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    }
  }

  /** Cierra el modal de guardado */
  closeSaveModal(): void {
    this.updateState({
      showSaveModalDialog: false,
      saveModalData: null,
    });
  }

  /** Guarda directamente sin pedir nombre */
  saveProgressDirectly(): void {
    const currentState = this.stateSubject.value;

    if (!currentState.currentList) {
      this.toastService.showAlert('No hay lista para guardar', 'warning');
      return;
    }

    const currentName =
      currentState.currentList.name ||
      `Lista ${new Date().toLocaleDateString()}`;
    const saved = this.checklistService.saveList(currentName);

    if (saved) {
      this.updateState({ hasUnsavedChanges: false });
      this.toastService.showAlert('Progreso guardado', 'success', 2000);
    } else {
      this.toastService.showAlert('Error al guardar', 'danger');
    }
  }

  /** Confirma el inicio de una nueva lista, verificando cambios pendientes */
  confirmStartNewList(): void {
    this.checklistService.hasUnsavedChanges$
      .pipe(first())
      .subscribe((hasUnsavedChanges) => {
        if (hasUnsavedChanges) {
          this.updateState({
            confirmModalData: {
              title: 'Cambios sin guardar',
              message:
                'Tienes cambios sin guardar. ¿Quieres guardar antes de comenzar una nueva lista?',
              confirmText: 'Guardar y nueva lista',
              cancelText: 'Nueva lista sin guardar',
            },
            showConfirmModal: true,
          });
          this.pendingAction = 'start-new-list-with-save';
        } else {
          // Si no hay cambios, ir directamente a nueva lista
          this.checklistService.clearAll();
          this.toastService.showAlert('Comenzando nueva lista', 'info');
          this.router.navigate(['/new-list']);
        }
      });
  }

  /** Confirma la acción pendiente (limpiar todo, ir a home o eliminar tarea) */
  onConfirmAction(): void {
    if (this.pendingAction === 'start-new-list-with-save') {
      // Guardar primero y luego ir a nueva lista
      const currentState = this.stateSubject.value;
      if (currentState.currentList) {
        const currentName =
          currentState.currentList.name ||
          `Lista ${new Date().toLocaleDateString()}`;
        const saved = this.checklistService.saveList(currentName);
        if (saved) {
          this.toastService.showAlert('Lista guardada', 'success', 1500);
          setTimeout(() => {
            this.checklistService.clearAll();
            this.router.navigate(['/new-list']);
          }, 1500);
        }
      }
    } else if (this.pendingAction === 'go-home') {
      this.showSaveModal();
    } else if (this.pendingDeleteTaskId !== null) {
      const currentState = this.stateSubject.value;
      const task = currentState.currentList?.tasks.find(
        (t) => t.id === this.pendingDeleteTaskId
      );
      const taskName = task?.name || '';

      this.checklistService.deleteTask(this.pendingDeleteTaskId);
      this.toastService.showAlert(`Tarea "${taskName}" eliminada`, 'info');
      this.pendingDeleteTaskId = null;
    }
    this.pendingAction = null;
    this.closeConfirmModal();
  }

  /** Cancela la acción pendiente */
  onCancelAction(): void {
    if (this.pendingAction === 'go-home') {
      this.router.navigate(['/home']);
    } else if (this.pendingAction === 'start-new-list-with-save') {
      // Si cancela "Guardar y nueva lista", significa "Nueva lista sin guardar"
      this.checklistService.clearAll();
      this.toastService.showAlert('Comenzando nueva lista sin guardar', 'info');
      this.router.navigate(['/new-list']);
    }
    this.closeConfirmModal();
  }

  /** Cierra el modal de confirmación */
  closeConfirmModal(): void {
    this.updateState({
      showConfirmModal: false,
      confirmModalData: null,
    });
    this.pendingAction = null;
    this.pendingDeleteTaskId = null;
  }

  /** Navega a la página principal, verificando cambios sin guardar */
  goHome(): void {
    this.checklistService.hasUnsavedChanges$
      .pipe(first())
      .subscribe((hasUnsavedChanges) => {
        if (hasUnsavedChanges) {
          this.updateState({
            confirmModalData: {
              title: 'Cambios sin guardar',
              message:
                'Tienes cambios sin guardar. ¿Quieres guardar antes de salir?',
              confirmText: 'Guardar y salir',
              cancelText: 'Salir sin guardar',
            },
            showConfirmModal: true,
          });
          this.pendingAction = 'go-home';
        } else {
          this.router.navigate(['/home']);
        }
      });
  }

  /** Exporta la lista actual a PDF */
  exportToPDF(): void {
    const currentState = this.stateSubject.value;
    if (currentState.currentList) {
      this.toastService.showAlert(
        'Presiona Ctrl+P para exportar como PDF',
        'info',
        4000
      );
      setTimeout(() => {
        this.pdfExportService.exportToPDF(currentState.currentList!);
      }, 500);
    }
  }

  /** Cierra la alerta modal */
  closeAlert(): void {
    this.updateState({
      showAlertModal: false,
      alertModalData: null,
    });
  }

  /** Inicia el intervalo de autoguardado */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.performAutoSave();
    }, this.AUTO_SAVE_INTERVAL);
  }

  /** Detiene el intervalo de autoguardado */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /** Realiza el autoguardado si hay cambios pendientes */
  private performAutoSave(): void {
    const currentState = this.stateSubject.value;
    if (
      currentState.hasUnsavedChanges &&
      currentState.currentList &&
      currentState.currentList.name
    ) {
      const success = this.checklistService.saveList(
        currentState.currentList.name
      );
      if (success) {
        this.updateState({ hasUnsavedChanges: false });
        this.toastService.showAlert(
          'Lista guardada automáticamente',
          'info',
          2000
        );
      }
    }
  }

  /** Marca el estado como modificado */
  private markAsChanged(): void {
    this.updateState({ hasUnsavedChanges: true });
  }
}
