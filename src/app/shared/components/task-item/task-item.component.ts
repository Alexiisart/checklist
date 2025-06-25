import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  Task,
  Subtask,
  TaskError,
  ModalData,
  TeamMember,
} from '../../../models/task.interface';
import { ModalComponent } from '../modal/modal.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../atomic/buttons';
import { CheckboxComponent } from '../../atomic/checkboxes';
import { TeamDropdownComponent } from '../../atomic/dropdowns';
import { ChecklistTeamService } from '../../../services/functions/checklist';

// Componente que representa un elemento de tarea individual. Permite gestionar tareas, subtareas y errores asociados.
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ModalComponent,
    ConfirmModalComponent,
    ButtonComponent,
    CheckboxComponent,
    TeamDropdownComponent,
  ],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css'],
})
export class TaskItemComponent {
  // Tarea que se mostrará en el componente
  @Input() task!: Task;

  // Equipo de la lista completa
  @Input() listTeam: TeamMember[] = [];

  // Evento emitido cuando se cambia el estado de completado de la tarea
  @Output() taskToggled = new EventEmitter<{
    taskId: number;
    completed: boolean;
  }>();

  // Evento emitido cuando se cambia el estado de completado de una subtarea
  @Output() subtaskToggled = new EventEmitter<{
    taskId: number;
    subtaskId: number;
    completed: boolean;
  }>();

  // Evento emitido cuando se agrega una nueva subtarea
  @Output() subtaskAdded = new EventEmitter<{ taskId: number; name: string }>();

  // Evento emitido cuando se elimina una subtarea
  @Output() subtaskRemoved = new EventEmitter<{
    taskId: number;
    subtaskId: number;
  }>();

  // Evento emitido cuando se actualiza una subtarea
  @Output() subtaskUpdated = new EventEmitter<{
    taskId: number;
    subtaskId: number;
    newName: string;
  }>();

  // Evento emitido cuando se reordenan las subtareas
  @Output() subtasksReordered = new EventEmitter<{
    taskId: number;
    reorderedSubtasks: Subtask[];
  }>();

  // Evento emitido cuando se documenta un problema que ocurrió al realizar la tarea
  @Output() errorAdded = new EventEmitter<{
    taskId: number;
    description: string;
  }>();

  // Evento emitido cuando se elimina un problema documentado
  @Output() errorRemoved = new EventEmitter<{
    taskId: number;
    errorId: number;
  }>();

  // Evento emitido cuando se actualiza un problema documentado
  @Output() errorUpdated = new EventEmitter<{
    taskId: number;
    errorId: number;
    newDescription: string;
  }>();

  // Evento emitido cuando se actualiza la tarea
  @Output() taskUpdated = new EventEmitter<{
    taskId: number;
    newName: string;
  }>();

  // Evento emitido cuando se elimina la tarea
  @Output() taskDeleted = new EventEmitter<number>();

  // Evento emitido cuando se quiere exportar esta tarea específica
  @Output() taskExported = new EventEmitter<number>();

  // Los eventos de gestión de equipo ahora se manejan a través del servicio ChecklistTeamService

  // Controla la visibilidad del modal
  showModal = false;

  // Datos que se mostrarán en el modal
  modalData: ModalData | null = null;

  // Controla la visibilidad del modal de confirmación
  showConfirmModal = false;

  // Datos del modal de confirmación
  confirmModalData: any = null;

  // Subtarea pendiente de eliminación
  subtaskToDelete: Subtask | null = null;

  // Acción actual que se está realizando
  currentAction:
    | 'add-subtask'
    | 'edit-subtask'
    | 'add-error'
    | 'edit-error'
    | 'edit-task'
    | null = null;

  // Subtarea actual que se está editando
  currentSubtask: Subtask | null = null;

  // Error actual que se está editando
  currentError: TaskError | null = null;

  constructor(public teamService: ChecklistTeamService) {}

  // Funciones de tracking personalizadas para evitar errores de IDs duplicados
  trackBySubtaskId(index: number, subtask: Subtask): string | number {
    // Si no hay ID válido, usar el índice como fallback
    if (!subtask || (!subtask.id && subtask.id !== 0)) {
      console.warn(
        'Subtarea sin ID válido detectada en índice:',
        index,
        subtask
      );
      return `fallback-subtask-${index}`;
    }
    return subtask.id;
  }

  trackByErrorId(index: number, error: TaskError): string | number {
    // Si no hay ID válido, usar el índice como fallback
    if (!error || (!error.id && error.id !== 0)) {
      console.warn('Error sin ID válido detectado en índice:', index, error);
      return `fallback-error-${index}`;
    }
    return error.id;
  }

  // Maneja el cambio de estado de la tarea principal
  onTaskToggle(checked: boolean): void {
    // Actualizar inmediatamente el estado local para respuesta visual rápida
    this.task.completed = checked;

    // Emitir el evento para que el padre también actualice su estado
    this.taskToggled.emit({
      taskId: this.task.id,
      completed: checked,
    });
  }

  // Maneja el cambio de estado de una subtarea
  onSubtaskToggle(subtask: Subtask, checked: boolean): void {
    // Actualizar inmediatamente el estado local para respuesta visual rápida
    subtask.completed = checked;

    // Emitir el evento para que el padre también actualice su estado
    this.subtaskToggled.emit({
      taskId: this.task.id,
      subtaskId: subtask.id,
      completed: checked,
    });
  }

  // Muestra el modal para agregar una nueva subtarea
  showAddSubtask(): void {
    this.currentAction = 'add-subtask';
    this.modalData = {
      title: 'Agregar Subtarea',
      label: 'Nombre de la subtarea (usa + para separar múltiples):',
      placeholder:
        'Ejemplo: Llamar al cliente + Revisar documentos + Enviar email',
    };
    this.showModal = true;
  }

  // Muestra el modal para editar una subtarea existente
  editSubtask(subtask: Subtask): void {
    this.currentAction = 'edit-subtask';
    this.currentSubtask = subtask;
    this.modalData = {
      title: 'Editar Subtarea',
      label: 'Nombre de la subtarea:',
      placeholder: 'Ejemplo: Llamar al cliente, Revisar documentos...',
      currentValue: subtask.name,
    };
    this.showModal = true;
  }

  // Muestra modal de confirmación para eliminar una subtarea
  removeSubtask(subtask: Subtask): void {
    this.subtaskToDelete = subtask;
    this.confirmModalData = {
      title: 'Eliminar Subtarea',
      message: `¿Estás seguro de que quieres eliminar la subtarea "${subtask.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };
    this.showConfirmModal = true;
  }

  // Confirma la eliminación de la subtarea
  confirmSubtaskDeletion(): void {
    if (this.subtaskToDelete) {
      this.subtaskRemoved.emit({
        taskId: this.task.id,
        subtaskId: this.subtaskToDelete.id,
      });
      this.cancelSubtaskDeletion();
    }
  }

  // Cancela la eliminación de la subtarea
  cancelSubtaskDeletion(): void {
    this.subtaskToDelete = null;
    this.showConfirmModal = false;
    this.confirmModalData = null;
  }

  // Muestra el modal para documentar un problema que ocurrió al realizar la tarea
  showAddError(): void {
    this.currentAction = 'add-error';
    this.modalData = {
      title: 'Documentar Problema',
      label: 'Describe qué problema ocurrió al realizar esta tarea:',
      placeholder:
        'Ejemplo: Cliente no disponible, Faltan documentos, No se pudo acceder al sistema, Información incompleta...',
    };
    this.showModal = true;
  }

  // Muestra el modal para editar un problema que ocurrió al realizar la tarea
  editError(error: TaskError): void {
    this.currentAction = 'edit-error';
    this.currentError = error;
    this.modalData = {
      title: 'Editar Problema',
      label: 'Describe qué problema ocurrió al realizar esta tarea:',
      placeholder: error.name,
      currentValue: error.name,
    };
    this.showModal = true;
  }

  // Elimina un error
  removeError(error: TaskError): void {
    this.errorRemoved.emit({ taskId: this.task.id, errorId: error.id });
  }

  // Muestra el modal para editar la tarea principal
  editTask(): void {
    this.currentAction = 'edit-task';
    this.modalData = {
      title: 'Editar Tarea',
      label: 'Nombre de la tarea:',
      placeholder: 'Nombre de la tarea...',
      currentValue: this.task.name,
    };
    this.showModal = true;
  }

  // Elimina la tarea principal
  deleteTask(): void {
    this.taskDeleted.emit(this.task.id);
  }

  // Exporta la tarea actual con sus subtareas
  exportTask(): void {
    this.taskExported.emit(this.task.id);
  }

  // Muestra el modal para gestionar el equipo (no se usa, se maneja a nivel de lista)
  showManageTeam(): void {
    this.teamService.showManageTeamModal();
  }

  // Alterna la visibilidad del dropdown de equipo
  toggleTeamDropdown(): void {
    this.teamService.toggleLeaderDropdown();
  }

  // Asigna un líder a la tarea
  assignLeader(member: TeamMember | null): void {
    this.teamService.updateTaskLeader(this.task.id, member);
  }

  // Asigna un miembro a una subtarea
  assignMemberToSubtask(subtask: Subtask, member: TeamMember | null): void {
    this.teamService.assignMemberToSubtask(this.task.id, subtask.id, member);
  }

  // Obtiene el nombre del miembro asignado a una subtarea
  getAssignedMemberName(subtask: Subtask): string {
    return subtask.assignedMember?.name || 'Sin asignar';
  }

  // Obtiene el nombre del líder de la tarea
  getLeaderName(): string {
    return this.task.leader?.name || 'Sin líder';
  }

  // Maneja la confirmación del modal según la acción actual
  onModalConfirm(value: string): void {
    switch (this.currentAction) {
      case 'add-subtask':
        this.subtaskAdded.emit({ taskId: this.task.id, name: value });
        break;
      case 'edit-subtask':
        if (this.currentSubtask) {
          this.subtaskUpdated.emit({
            taskId: this.task.id,
            subtaskId: this.currentSubtask.id,
            newName: value,
          });
        }
        break;
      case 'add-error':
        this.errorAdded.emit({ taskId: this.task.id, description: value });
        break;
      case 'edit-error':
        if (this.currentError) {
          this.errorUpdated.emit({
            taskId: this.task.id,
            errorId: this.currentError.id,
            newDescription: value,
          });
        }
        break;
      case 'edit-task':
        this.taskUpdated.emit({ taskId: this.task.id, newName: value });
        break;
    }
  }

  // Cierra el modal y reinicia los valores relacionados
  closeModal(): void {
    this.showModal = false;
    this.currentAction = null;
    this.currentSubtask = null;
    this.currentError = null;
    this.modalData = null;
  }

  // Maneja el reordenamiento de subtareas con drag and drop
  onSubtaskDrop(event: CdkDragDrop<Subtask[]>): void {
    // Usar directamente moveItemInArray en el array original como en la documentación
    moveItemInArray(
      this.task.subtasks,
      event.previousIndex,
      event.currentIndex
    );

    // Emitir el evento con las subtareas ya reordenadas
    this.subtasksReordered.emit({
      taskId: this.task.id,
      reorderedSubtasks: [...this.task.subtasks],
    });
  }
}
