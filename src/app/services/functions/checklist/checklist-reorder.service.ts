import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';
import { Task, ChecklistData, Subtask } from '../../../models/task.interface';

interface ReorderModalData {
  title: string;
  tasks: Task[];
  listId: string;
}

/**
 * Servicio para manejar el reordenamiento de tareas y subtareas
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistReorderService {
  private showReorderModalSubject = new BehaviorSubject<boolean>(false);
  private reorderModalDataSubject =
    new BehaviorSubject<ReorderModalData | null>(null);

  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  // Observables públicos
  get showReorderModal$(): Observable<boolean> {
    return this.showReorderModalSubject.asObservable();
  }

  get reorderModalData$(): Observable<ReorderModalData | null> {
    return this.reorderModalDataSubject.asObservable();
  }

  /**
   * Muestra el modal de reordenamiento de tareas
   */
  showTaskReorderModal(currentList: ChecklistData): void {
    if (!currentList || !currentList.tasks || currentList.tasks.length === 0) {
      this.toastService.showAlert('No hay tareas para reordenar', 'warning');
      return;
    }

    const modalData: ReorderModalData = {
      title: 'Reordenar Tareas',
      tasks: [...currentList.tasks], // Copia para evitar mutaciones
      listId: currentList.id,
    };

    this.reorderModalDataSubject.next(modalData);
    this.showReorderModalSubject.next(true);
  }

  /**
   * Cierra el modal de reordenamiento
   */
  closeReorderModal(): void {
    this.showReorderModalSubject.next(false);
    this.reorderModalDataSubject.next(null);
  }

  /**
   * Confirma el nuevo orden de las tareas
   * Usa el método updateTasks para actualizar todas las tareas con el nuevo orden
   */
  confirmTaskReorder(reorderedTasks: Task[]): void {
    try {
      // Crear string con las tareas en el nuevo orden
      const tasksString = reorderedTasks.map((task) => task.name).join('\n');

      // Usar el método público updateTasks del ChecklistService
      this.checklistService.updateTasks(tasksString);

      this.toastService.showAlert(
        'Orden de tareas actualizado correctamente',
        'success'
      );
      this.closeReorderModal();
    } catch (error) {
      console.error('Error al reordenar tareas:', error);
      this.toastService.showAlert(
        'Error al actualizar el orden de las tareas',
        'danger'
      );
    }
  }

  /**
   * Reordena las subtareas de una tarea específica
   * NO muta el array original, solo notifica el cambio
   */
  reorderSubtasks(): void {
    // Solo mostrar notificación, el cambio ya se aplicó en el componente
    this.toastService.showAlert(
      'Orden de subtareas actualizado correctamente',
      'success'
    );
  }
}
