import { Injectable } from '@angular/core';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';
import { BehaviorSubject } from 'rxjs';
import { ConfirmData } from '../../../models/task.interface';

/**
 * Servicio para manejar las funciones relacionadas con tareas del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistTasksService {
  // Subject para manejar el estado del modal de confirmación de eliminación
  private _showConfirmModal$ = new BehaviorSubject<boolean>(false);
  private _confirmModalData$ = new BehaviorSubject<ConfirmData | null>(null);

  // Observables públicos
  public readonly showConfirmModal$ = this._showConfirmModal$.asObservable();
  public readonly confirmModalData$ = this._confirmModalData$.asObservable();

  // ID de tarea pendiente para eliminar
  private pendingDeleteTaskId: number | null = null;

  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Maneja el cambio de estado de una tarea
   */
  toggleTask(taskId: number, completed: boolean): void {
    this.checklistService.toggleTask(taskId, completed);
  }

  /**
   * Actualiza el nombre de una tarea
   */
  updateTask(taskId: number, newName: string): void {
    this.checklistService.updateTask(taskId, newName);
    this.toastService.showAlert(`Tarea actualizada: "${newName}"`, 'success');
  }

  /**
   * Inicia el proceso de eliminación de una tarea mostrando el modal de confirmación
   */
  initiateTaskDeletion(taskId: number): void {
    const task = this.getTask(taskId);
    const taskName = task?.name || '';

    this.pendingDeleteTaskId = taskId;
    this._confirmModalData$.next({
      title: 'Eliminar Tarea',
      message: `¿Estás seguro de que quieres eliminar la tarea "${taskName}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    this._showConfirmModal$.next(true);
  }

  /**
   * Confirma y ejecuta la eliminación de la tarea
   */
  confirmTaskDeletion(): void {
    if (this.pendingDeleteTaskId !== null) {
      const task = this.getTask(this.pendingDeleteTaskId);
      const taskName = task?.name || '';

      this.checklistService.deleteTask(this.pendingDeleteTaskId);
      this.toastService.showAlert(`Tarea "${taskName}" eliminada`, 'info');

      this.pendingDeleteTaskId = null;
    }
    this.closeConfirmModal();
  }

  /**
   * Cancela la eliminación de la tarea
   */
  cancelTaskDeletion(): void {
    this.pendingDeleteTaskId = null;
    this.closeConfirmModal();
  }

  /**
   * Cierra el modal de confirmación
   */
  closeConfirmModal(): void {
    this._showConfirmModal$.next(false);
    this._confirmModalData$.next(null);
    this.pendingDeleteTaskId = null;
  }

  /**
   * Obtiene información de una tarea por ID
   */
  private getTask(taskId: number) {
    let currentList: any = null;
    this.checklistService.currentList$
      .subscribe((list) => {
        currentList = list;
      })
      .unsubscribe();
    return currentList?.tasks.find((t: any) => t.id === taskId);
  }
}
