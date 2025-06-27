import { Injectable } from '@angular/core';
import { ChecklistService } from './checklist.service';
import { ToastService } from './toast.service';

/**
 * Servicio para gestionar fechas de cumplimiento de tareas y subtareas
 * Proporciona métodos para actualizar fechas de vencimiento y completado
 */
@Injectable({
  providedIn: 'root',
})
export class DateManagerService {
  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Actualiza la fecha de vencimiento de una tarea
   */
  updateTaskDueDate(taskId: number, dueDate: string | null): void {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.dueDate = dueDate;
      this.checklistService['updateList'](currentList);

      const message = dueDate
        ? 'Fecha de vencimiento establecida'
        : 'Fecha de vencimiento eliminada';
      this.toastService.showAlert(message, 'success');
    }
  }

  /**
   * Establece automáticamente la fecha de completado de una tarea
   */
  setTaskCompletedDate(taskId: number, completed: boolean): void {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completedDate = completed ? new Date().toISOString() : null;
      this.checklistService['updateList'](currentList);
    }
  }

  /**
   * Obtiene estadísticas de fechas para una lista
   */
  getDateStatistics() {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return null;

    const now = new Date();
    const stats = {
      totalWithDates: 0,
      overdue: 0,
      dueSoon: 0,
      completed: 0,
    };

    currentList.tasks.forEach((task) => {
      if (task.dueDate) {
        stats.totalWithDates++;
        const dueDate = new Date(task.dueDate);

        if (task.completed) {
          stats.completed++;
        } else {
          const threeDaysFromNow = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000
          );

          if (dueDate < now) {
            stats.overdue++;
          } else if (dueDate <= threeDaysFromNow) {
            stats.dueSoon++;
          }
        }
      }
    });

    return stats;
  }
}
