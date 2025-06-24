import { Injectable } from '@angular/core';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';

/**
 * Servicio para manejar las funciones relacionadas con errores del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistErrorsService {
  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Agrega un nuevo error a una tarea
   */
  addError(taskId: number, description: string): void {
    this.checklistService.addError(taskId, description);
    this.toastService.showAlert(`Error agregado: "${description}"`, 'warning');
  }

  /**
   * Elimina un error de una tarea
   */
  removeError(taskId: number, errorId: number): void {
    this.checklistService.removeError(taskId, errorId);
    this.toastService.showAlert('Error eliminado', 'info');
  }

  /**
   * Actualiza la descripción de un error
   */
  updateError(taskId: number, errorId: number, newDescription: string): void {
    this.checklistService.updateError(taskId, errorId, newDescription);
    this.toastService.showAlert(
      `Error actualizado: "${newDescription}"`,
      'warning'
    );
  }
}
