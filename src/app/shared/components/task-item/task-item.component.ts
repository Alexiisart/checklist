import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Task,
  Subtask,
  TaskError,
  ModalData,
} from '../../../models/task.interface';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../../atomic/buttons';
import { CheckboxComponent } from '../../atomic/checkboxes';

// Componente que representa un elemento de tarea individual. Permite gestionar tareas, subtareas y errores asociados.
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, CheckboxComponent],
  template: `
    <div class="task-item" [class.completed]="task.completed">
      <div class="task-header">
        <app-checkbox
          type="success"
          size="md"
          [checked]="task.completed"
          [inputId]="'task-' + task.id"
          ariaLabel="Marcar tarea como completada"
          (checkedChange)="onTaskToggle($event)"
        ></app-checkbox>
        <span class="task-title">{{ task.name }}</span>
        <app-button
          type="icon"
          iconLeft="edit"
          size="sm"
          title="Editar tarea"
          extraClasses="edit-task-btn"
          (clickEvent)="editTask()"
        >
        </app-button>
        <app-button
          type="icon"
          iconLeft="delete"
          size="sm"
          title="Eliminar tarea"
          extraClasses="delete-task-btn"
          (clickEvent)="deleteTask()"
        >
        </app-button>
        <app-button
          type="ghost"
          text="Subtarea"
          iconLeft="add"
          size="sm"
          title="Agregar subtarea"
          extraClasses="subtask-btn add-subtask-btn"
          (clickEvent)="showAddSubtask()"
        >
        </app-button>
        <app-button
          type="ghost"
          text="Documentar problema"
          iconLeft="warning"
          size="sm"
          title="Documentar problemas que ocurrieron al realizar esta tarea"
          extraClasses="add-error-btn"
          (clickEvent)="showAddError()"
        >
        </app-button>
        <app-button
          type="icon"
          iconLeft="file_download"
          size="sm"
          title="Exportar esta tarea con sus subtareas"
          extraClasses="export-task-btn"
          (clickEvent)="exportTask()"
        >
        </app-button>
      </div>

      <!-- Subtareas -->
      @if (task.subtasks.length > 0) {
      <div class="subtasks-container">
        <div class="subtasks-label">Subtareas:</div>
        @for (subtask of task.subtasks; track trackBySubtaskId($index, subtask))
        {
        <div class="subtask-item">
          <app-checkbox
            type="default"
            size="md"
            [checked]="subtask.completed"
            [inputId]="'subtask-' + subtask.id"
            ariaLabel="Marcar subtarea como completada"
            (checkedChange)="onSubtaskToggle(subtask, $event)"
          ></app-checkbox>
          <span class="subtask-text" [class.completed]="subtask.completed">{{
            subtask.name
          }}</span>
          <app-button
            type="icon"
            iconLeft="edit"
            size="xs"
            title="Editar subtarea"
            extraClasses="edit-subtask-btn"
            (clickEvent)="editSubtask(subtask)"
          >
          </app-button>
          <app-button
            type="icon"
            iconLeft="close"
            size="xs"
            extraClasses="subtask-btn remove-subtask-btn"
            (clickEvent)="removeSubtask(subtask)"
          >
          </app-button>
        </div>
        }
      </div>
      }

      <!-- Errores -->
      @if (task.errors.length > 0) {
      <div class="errors-container">
        @for (error of task.errors; track trackByErrorId($index, error)) {
        <div class="error-item">
          <span class="error-text">{{ error.name }}</span>
          <app-button
            type="icon"
            iconLeft="edit"
            size="xs"
            title="Editar problema que ocurrió al realizar la tarea"
            extraClasses="edit-error-btn"
            (clickEvent)="editError(error)"
          >
          </app-button>
          <app-button
            type="icon"
            iconLeft="close"
            size="xs"
            extraClasses="remove-error-btn"
            (clickEvent)="removeError(error)"
          >
          </app-button>
        </div>
        }
      </div>
      }
    </div>

    <app-modal
      [isVisible]="showModal"
      [data]="modalData"
      (confirmed)="onModalConfirm($event)"
      (closed)="closeModal()"
    >
    </app-modal>
  `,
  styleUrls: ['./task-item.component.css'],
})
export class TaskItemComponent {
  // Tarea que se mostrará en el componente
  @Input() task!: Task;

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

  // Controla la visibilidad del modal
  showModal = false;

  // Datos que se mostrarán en el modal
  modalData: ModalData | null = null;

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

  // Elimina una subtarea
  removeSubtask(subtask: Subtask): void {
    this.subtaskRemoved.emit({ taskId: this.task.id, subtaskId: subtask.id });
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
}
