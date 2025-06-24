import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import {
  ChecklistStateService,
  ChecklistState,
} from './checklist-state.service';

// Componente principal que maneja la funcionalidad del checklist. Permite ver y editar tareas, subtareas, errores y observaciones
@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskItemComponent,
    ModalComponent,
    ConfirmModalComponent,
    AlertModalComponent,
  ],
  providers: [ChecklistStateService],
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css'],
})
export class ChecklistComponent implements OnInit, OnDestroy {
  // Estado reactivo desde el service
  state$: Observable<ChecklistState>;

  // Propiedades expuestas para el template (compatibilidad con HTML original)
  currentList: any = null;
  progress = { completed: 0, total: 0, percentage: 0 };
  showEditModal = false;
  editModalData: any = null;
  showSaveModalDialog = false;
  saveModalData: any = null;
  showConfirmModal = false;
  confirmModalData: any = null;
  showAlertModal = false;
  alertModalData: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private stateService: ChecklistStateService
  ) {
    this.state$ = this.stateService.state$;
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
      this.showEditModal = state.showEditModal;
      this.editModalData = state.editModalData;
      this.showSaveModalDialog = state.showSaveModalDialog;
      this.saveModalData = state.saveModalData;
      this.showConfirmModal = state.showConfirmModal;
      this.confirmModalData = state.confirmModalData;
      this.showAlertModal = state.showAlertModal;
      this.alertModalData = state.alertModalData;
    });
  }

  // Limpia recursos al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.cleanup();
  }

  // Maneja el cambio de estado completado/no completado de una tarea
  onTaskToggled(event: { taskId: number; completed: boolean }): void {
    this.stateService.onTaskToggled(event);
  }

  // Maneja el cambio de estado completado/no completado de una subtarea
  onSubtaskToggled(event: {
    taskId: number;
    subtaskId: number;
    completed: boolean;
  }): void {
    this.stateService.onSubtaskToggled(event);
  }

  // Agrega una nueva subtarea a una tarea existente
  onSubtaskAdded(event: { taskId: number; name: string }): void {
    this.stateService.onSubtaskAdded(event);
  }

  // Elimina una subtarea existente
  onSubtaskRemoved(event: { taskId: number; subtaskId: number }): void {
    this.stateService.onSubtaskRemoved(event);
  }

  // Actualiza el nombre de una subtarea existente
  onSubtaskUpdated(event: {
    taskId: number;
    subtaskId: number;
    newName: string;
  }): void {
    this.stateService.onSubtaskUpdated(event);
  }

  // Agrega un nuevo error a una tarea
  onErrorAdded(event: { taskId: number; description: string }): void {
    this.stateService.onErrorAdded(event);
  }

  // Elimina un error existente
  onErrorRemoved(event: { taskId: number; errorId: number }): void {
    this.stateService.onErrorRemoved(event);
  }

  // Actualiza la descripción de un error existente
  onErrorUpdated(event: {
    taskId: number;
    errorId: number;
    newDescription: string;
  }): void {
    this.stateService.onErrorUpdated(event);
  }

  // Actualiza el nombre de una tarea existente
  onTaskUpdated(event: { taskId: number; newName: string }): void {
    this.stateService.onTaskUpdated(event);
  }

  // Elimina una tarea existente
  onTaskDeleted(taskId: number): void {
    this.stateService.onTaskDeleted(taskId);
  }

  // Maneja cambios en las observaciones generales
  onObservationsChange(): void {
    this.stateService.onObservationsChange();
  }

  // Activa el modo de edición masiva de tareas
  editMode(): void {
    this.stateService.editMode();
  }

  // Confirma los cambios realizados en modo edición
  onEditConfirm(newTasksString: string): void {
    this.stateService.onEditConfirm(newTasksString);
  }

  // Cierra el modal de edición masiva
  closeEditModal(): void {
    this.stateService.closeEditModal();
  }

  // Confirma el guardado de la lista
  onSaveConfirm(name: string): void {
    this.stateService.onSaveConfirm(name);
  }

  // Cierra el modal de guardado
  closeSaveModal(): void {
    this.stateService.closeSaveModal();
  }

  // Confirma el inicio de una nueva lista
  confirmStartNewList(): void {
    this.stateService.confirmStartNewList();
  }

  // Confirma la acción pendiente (limpiar lista, eliminar tarea, etc)
  onConfirmAction(): void {
    this.stateService.onConfirmAction();
  }

  // Cancela la acción pendiente
  onCancelAction(): void {
    this.stateService.onCancelAction();
  }

  // Navega a la página principal
  goHome(): void {
    this.stateService.goHome();
  }

  // Exporta la lista actual a PDF
  exportToPDF(): void {
    this.stateService.exportToPDF();
  }

  // Cierra el modal de alerta
  closeAlert(): void {
    this.stateService.closeAlert();
  }

  // Guarda directamente el progreso o pide nombre si no lo tiene
  saveProgress(): void {
    this.stateService.saveProgressDirectly();
  }

  // Obtiene el texto del botón de guardar según el estado
  getSaveButtonText(): string {
    return this.currentList?.name ? 'Guardar' : 'Guardar como...';
  }

  // Obtiene el tooltip del botón de guardar según el estado
  getSaveButtonTooltip(): string {
    return this.currentList?.name
      ? 'Actualizar la lista guardada'
      : 'Guardar la lista con un nombre';
  }
}
