import { Injectable } from '@angular/core';
import { StorageService } from '../../storage.service';
import { ToastService } from '../../toast.service';
import { ChecklistData, SavedList } from '../../../models/task.interface';

/**
 * Servicio para manejar el toggle de prioridad de las listas
 */
@Injectable({
  providedIn: 'root',
})
export class TogglePriorityService {
  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  /**
   * Cambia la prioridad de una lista
   * @param list Lista a la que cambiar la prioridad
   * @returns Promise que resuelve cuando se completa la operación
   */
  async toggleListPriority(list: SavedList): Promise<void> {
    try {
      // Cargar los datos completos de la lista
      const listData = this.storageService.loadList(list.id);
      if (!listData) {
        throw new Error('Lista no encontrada');
      }

      // Cambiar la prioridad
      const newPriority = !list.priority;
      listData.priority = newPriority;
      listData.modifiedDate = new Date().toISOString();

      // Guardar la lista actualizada
      this.storageService.saveList(listData);

      // Mostrar mensaje de confirmación
      const message = newPriority
        ? `Lista "${list.name}" marcada como prioritaria`
        : `Lista "${list.name}" ya no es prioritaria`;

      this.toastService.showAlert(message, 'success');
    } catch (error) {
      console.error('Error al cambiar prioridad de lista:', error);
      this.toastService.showAlert(
        'Error al cambiar la prioridad de la lista',
        'danger'
      );
    }
  }
}
