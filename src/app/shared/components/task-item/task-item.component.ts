import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Task,
  Subtask,
  TaskError,
  ModalData,
} from '../../../models/task.interface';
import { ModalComponent } from '../modal/modal.component';

/**
 * Componente que representa un elemento de tarea individual.
 * Permite gestionar tareas, subtareas y errores asociados.
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <div class="task-item" [class.completed]="task.completed">
      <div class="task-header">
        <input
          type="checkbox"
          class="task-checkbox"
          [checked]="task.completed"
          (change)="onTaskToggle($event)"
        />
        <span class="task-title">{{ task.name }}</span>
        <button class="edit-task-btn" (click)="editTask()" title="Editar tarea">
          <span class="material-icons-outlined">edit</span>
        </button>
        <button
          class="delete-task-btn"
          (click)="deleteTask()"
          title="Eliminar tarea"
        >
          <span class="material-icons-outlined">delete</span>
        </button>
        <button
          class="subtask-btn add-subtask-btn"
          (click)="showAddSubtask()"
          title="Agregar subtarea"
        >
          <span class="material-icons-outlined">add</span> Subtarea
        </button>
        <button
          class="add-error-btn"
          (click)="showAddError()"
          title="Documentar problemas que ocurrieron al realizar esta tarea"
        >
          <span class="material-icons-outlined">warning</span> Documentar
          problema
        </button>
      </div>

      <!-- Subtareas -->
      <div class="subtasks-container" *ngIf="task.subtasks.length > 0">
        <div class="subtasks-label">Subtareas:</div>
        <div class="subtask-item" *ngFor="let subtask of task.subtasks">
          <input
            type="checkbox"
            class="subtask-checkbox"
            [checked]="subtask.completed"
            (change)="onSubtaskToggle(subtask, $event)"
          />
          <span class="subtask-text" [class.completed]="subtask.completed">{{
            subtask.name
          }}</span>
          <button
            class="edit-subtask-btn"
            (click)="editSubtask(subtask)"
            title="Editar subtarea"
          >
            <span class="material-icons-outlined">edit</span>
          </button>
          <button
            class="subtask-btn remove-subtask-btn"
            (click)="removeSubtask(subtask)"
          >
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- Errores -->
      <div class="errors-container" *ngIf="task.errors.length > 0">
        <div class="error-item" *ngFor="let error of task.errors">
          <span class="error-text">{{ error.name }}</span>
          <button
            class="edit-error-btn"
            (click)="editError(error)"
            title="Editar problema que ocurrió al realizar la tarea"
          >
            <span class="material-icons-outlined">edit</span>
          </button>
          <button class="remove-error-btn" (click)="removeError(error)">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>
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
  /** Tarea que se mostrará en el componente */
  @Input() task!: Task;

  /** Evento emitido cuando se cambia el estado de completado de la tarea */
  @Output() taskToggled = new EventEmitter<{
    taskId: number;
    completed: boolean;
  }>();

  /** Evento emitido cuando se cambia el estado de completado de una subtarea */
  @Output() subtaskToggled = new EventEmitter<{
    taskId: number;
    subtaskId: number;
    completed: boolean;
  }>();

  /** Evento emitido cuando se agrega una nueva subtarea */
  @Output() subtaskAdded = new EventEmitter<{ taskId: number; name: string }>();

  /** Evento emitido cuando se elimina una subtarea */
  @Output() subtaskRemoved = new EventEmitter<{
    taskId: number;
    subtaskId: number;
  }>();

  /** Evento emitido cuando se actualiza una subtarea */
  @Output() subtaskUpdated = new EventEmitter<{
    taskId: number;
    subtaskId: number;
    newName: string;
  }>();

  /** Evento emitido cuando se documenta un problema que ocurrió al realizar la tarea */
  @Output() errorAdded = new EventEmitter<{
    taskId: number;
    description: string;
  }>();

  /** Evento emitido cuando se elimina un problema documentado */
  @Output() errorRemoved = new EventEmitter<{
    taskId: number;
    errorId: number;
  }>();

  /** Evento emitido cuando se actualiza un problema documentado */
  @Output() errorUpdated = new EventEmitter<{
    taskId: number;
    errorId: number;
    newDescription: string;
  }>();

  /** Evento emitido cuando se actualiza la tarea */
  @Output() taskUpdated = new EventEmitter<{
    taskId: number;
    newName: string;
  }>();

  /** Evento emitido cuando se elimina la tarea */
  @Output() taskDeleted = new EventEmitter<number>();

  /** Controla la visibilidad del modal */
  showModal = false;

  /** Datos que se mostrarán en el modal */
  modalData: ModalData | null = null;

  /** Acción actual que se está realizando */
  currentAction:
    | 'add-subtask'
    | 'edit-subtask'
    | 'add-error'
    | 'edit-error'
    | 'edit-task'
    | null = null;

  /** Subtarea actual que se está editando */
  currentSubtask: Subtask | null = null;

  /** Error actual que se está editando */
  currentError: TaskError | null = null;

  /**
   * Maneja el cambio de estado de la tarea principal
   * @param event Evento del checkbox
   */
  onTaskToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.taskToggled.emit({ taskId: this.task.id, completed: target.checked });
  }

  /**
   * Maneja el cambio de estado de una subtarea
   * @param subtask Subtarea que se está modificando
   * @param event Evento del checkbox
   */
  onSubtaskToggle(subtask: Subtask, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.subtaskToggled.emit({
      taskId: this.task.id,
      subtaskId: subtask.id,
      completed: target.checked,
    });
  }

  /**
   * Muestra el modal para agregar una nueva subtarea
   */
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

  /**
   * Muestra el modal para editar una subtarea existente
   * @param subtask Subtarea que se va a editar
   */
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

  /**
   * Elimina una subtarea
   * @param subtask Subtarea que se va a eliminar
   */
  removeSubtask(subtask: Subtask): void {
    this.subtaskRemoved.emit({ taskId: this.task.id, subtaskId: subtask.id });
  }

  /**
   * Muestra el modal para documentar un problema que ocurrió al realizar la tarea
   */
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

  /**
   * Muestra el modal para editar un problema que ocurrió al realizar la tarea
   * @param error Error que se va a editar
   */
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

  /**
   * Elimina un error
   * @param error Error que se va a eliminar
   */
  removeError(error: TaskError): void {
    this.errorRemoved.emit({ taskId: this.task.id, errorId: error.id });
  }

  /**
   * Muestra el modal para editar la tarea principal
   */
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

  /**
   * Elimina la tarea principal
   */
  deleteTask(): void {
    this.taskDeleted.emit(this.task.id);
  }

  /**
   * Maneja la confirmación del modal según la acción actual
   * @param value Valor ingresado en el modal
   */
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

  /**
   * Cierra el modal y reinicia los valores relacionados
   */
  closeModal(): void {
    this.showModal = false;
    this.currentAction = null;
    this.currentSubtask = null;
    this.currentError = null;
    this.modalData = null;
  }
}
