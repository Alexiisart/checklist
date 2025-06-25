import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Task } from '../../../models/task.interface';
import { ButtonComponent } from '../../atomic/buttons';

interface ReorderModalData {
  title: string;
  tasks: Task[];
  listId: string;
}

@Component({
  selector: 'app-reorder-modal',
  standalone: true,
  imports: [CommonModule, DragDropModule, ButtonComponent],
  template: `
    <div
      class="modal"
      [style.display]="isVisible ? 'flex' : 'none'"
      (click)="onOverlayClick($event)"
    >
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ data?.title || 'Reordenar' }}</h3>
          <app-button
            type="icon"
            iconLeft="close"
            size="sm"
            extraClasses="close-modal-btn"
            (clickEvent)="onClose()"
          >
          </app-button>
        </div>

        <div class="modal-body">
          <p class="instructions">Arrastra las tareas para cambiar su orden:</p>

          <div
            cdkDropList
            [cdkDropListData]="reorderedTasks"
            class="task-list"
            [cdkDropListSortingDisabled]="false"
            [cdkDropListAutoScrollDisabled]="false"
            [cdkDropListLockAxis]="'y'"
            (cdkDropListDropped)="onDrop($event)"
          >
            @for (task of reorderedTasks; track task.id) {
            <div
              cdkDrag
              class="task-item"
              [class.completed]="task.completed"
              [cdkDragBoundary]="'.modal-body'"
              [cdkDragLockAxis]="'y'"
            >
              <div class="drag-handle" cdkDragHandle>
                <span class="material-icons-outlined">drag_indicator</span>
              </div>
              <div class="task-content">
                <span class="task-name">{{ task.name }}</span>
                <div class="task-info">
                  @if (task.subtasks.length > 0) {
                  <span class="subtasks-count"
                    >{{ task.subtasks.length }} subtareas</span
                  >
                  } @if (task.errors.length > 0) {
                  <span class="errors-count"
                    >{{ task.errors.length }} problemas</span
                  >
                  }
                </div>
              </div>
              <div class="task-status">
                @if (task.completed) {
                <span class="material-icons-outlined completed-icon"
                  >check_circle</span
                >
                } @else {
                <span class="material-icons-outlined pending-icon"
                  >radio_button_unchecked</span
                >
                }
              </div>
            </div>
            }
          </div>
        </div>

        <div class="modal-footer">
          <app-button type="secondary" text="Cancelar" (clickEvent)="onClose()">
          </app-button>
          <app-button
            type="primary"
            text="Aplicar Orden"
            (clickEvent)="onConfirm()"
          >
          </app-button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reorder-modal.component.css'],
})
export class ReorderModalComponent {
  @Input() isVisible = false;
  @Input() data: ReorderModalData | null = null;

  @Output() confirmed = new EventEmitter<Task[]>();
  @Output() closed = new EventEmitter<void>();

  reorderedTasks: Task[] = [];

  ngOnChanges(): void {
    if (this.data && this.data.tasks) {
      // Crear una copia de las tareas para el reordenamiento
      this.reorderedTasks = [...this.data.tasks];
    }
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    moveItemInArray(
      this.reorderedTasks,
      event.previousIndex,
      event.currentIndex
    );
  }

  onConfirm(): void {
    this.confirmed.emit(this.reorderedTasks);
  }

  onClose(): void {
    this.closed.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
