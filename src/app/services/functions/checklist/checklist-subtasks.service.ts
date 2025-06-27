import { Injectable } from '@angular/core';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';

/**
 * Servicio para manejar las funciones relacionadas con subtareas del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistSubtasksService {
  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Maneja el cambio de estado de una subtarea
   */
  toggleSubtask(taskId: number, subtaskId: number, completed: boolean): void {
    this.checklistService.toggleSubtask(taskId, subtaskId, completed);
  }

  /**
   * Agrega una nueva subtarea a una tarea
   */
  addSubtask(taskId: number, name: string): void {
    const subtasks = name
      .split('+')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this.checklistService.addSubtask(taskId, name);

    const message =
      subtasks.length > 1
        ? `${subtasks.length} subtareas agregadas`
        : `Subtarea "${name}" agregada`;
    this.toastService.showAlert(message, 'success');
  }

  /**
   * Elimina una subtarea de una tarea
   */
  removeSubtask(taskId: number, subtaskId: number): void {
    this.checklistService.removeSubtask(taskId, subtaskId);
    this.toastService.showAlert('Subtarea eliminada', 'info');
  }

  /**
   * Actualiza el nombre de una subtarea
   */
  updateSubtask(taskId: number, subtaskId: number, newName: string): void {
    this.checklistService.updateSubtask(taskId, subtaskId, newName);
    this.toastService.showAlert(
      `Subtarea actualizada: "${newName}"`,
      'success'
    );
  }

  /**
   * Cambia la prioridad de una subtarea
   */
  toggleSubtaskPriority(
    taskId: number,
    subtaskId: number,
    priority: boolean
  ): void {
    this.checklistService.toggleSubtaskPriority(taskId, subtaskId, priority);
    const message = priority
      ? 'Subtarea marcada como prioritaria'
      : 'Subtarea ya no es prioritaria';
    this.toastService.showAlert(message, 'success');
  }
}
