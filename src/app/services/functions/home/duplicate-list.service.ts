import { Injectable } from '@angular/core';
import { ChecklistService } from '../../checklist.service';
import { UuidService } from '../../uuid.service';
import { StorageService } from '../../storage.service';
import { ToastService } from '../../toast.service';
import {
  SavedList,
  ChecklistData,
  ConfirmData,
} from '../../../models/task.interface';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio para manejar la duplicación de listas guardadas
 */
@Injectable({
  providedIn: 'root',
})
export class DuplicateListService {
  // Subject para manejar el estado del modal de confirmación
  private _showConfirmModal$ = new BehaviorSubject<boolean>(false);
  private _confirmModalData$ = new BehaviorSubject<ConfirmData | null>(null);

  // Observables públicos
  public readonly showConfirmModal$ = this._showConfirmModal$.asObservable();
  public readonly confirmModalData$ = this._confirmModalData$.asObservable();

  // Lista temporal para la operación de duplicado
  private listToDuplicate: SavedList | null = null;

  constructor(
    private checklistService: ChecklistService,
    private uuidService: UuidService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  /**
   * Inicia el proceso de duplicación mostrando el modal de confirmación
   * @param originalList La lista original a duplicar
   */
  initiateDuplication(originalList: SavedList): void {
    this.listToDuplicate = originalList;
    const nextCopyName = this.generateCopyName(originalList.name);

    this._confirmModalData$.next({
      title: 'Duplicar Lista',
      message: `¿Quieres crear una copia de la lista "${originalList.name}"?\n\nSe creará una nueva lista llamada "${nextCopyName}" con todas las tareas sin completar.`,
      confirmText: 'Sí, duplicar',
      cancelText: 'Cancelar',
    });

    this._showConfirmModal$.next(true);
  }

  /**
   * Confirma y ejecuta la duplicación de la lista
   */
  async confirmDuplication(): Promise<void> {
    if (!this.listToDuplicate) return;

    try {
      const copyName = this.generateCopyName(this.listToDuplicate.name);
      const duplicatedList = await this.duplicateList(
        this.listToDuplicate,
        copyName
      );

      this.toastService.showAlert(
        `Lista "${duplicatedList.name}" duplicada exitosamente`,
        'success'
      );
    } catch (error) {
      console.error('Error al duplicar lista:', error);
      this.toastService.showAlert('Error al duplicar la lista', 'danger');
    } finally {
      this.cancelDuplication();
    }
  }

  /**
   * Cancela el proceso de duplicación
   */
  cancelDuplication(): void {
    this.listToDuplicate = null;
    this._showConfirmModal$.next(false);
    this._confirmModalData$.next(null);
  }

  /**
   * Duplica una lista guardada (método interno)
   * @param originalList La lista original a duplicar
   * @param copyName Nombre para la lista duplicada
   * @returns Promise<SavedList> La lista duplicada
   */
  private async duplicateList(
    originalList: SavedList,
    copyName: string
  ): Promise<SavedList> {
    try {
      // Obtener los datos completos de la lista original
      const originalData = await this.checklistService.loadList(
        originalList.id
      );

      if (!originalData) {
        throw new Error('No se pudo cargar la lista original');
      }

      // Crear una nueva lista con datos duplicados
      const duplicatedData: ChecklistData = {
        id: this.uuidService.generateUniqueId(),
        name: copyName,
        tasks: originalData.tasks.map((task) => ({
          ...task,
          id: this.uuidService.generateNumericId(),
          // Resetear estado de completado
          completed: false,
          // Limpiar líder en la copia
          leader: null,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            id: this.uuidService.generateNumericId(),
            completed: false,
            // Limpiar asignación en la copia
            assignedMember: null,
          })),
          errors: [], // Limpiar errores de la copia
        })),
        observations: '', // Limpiar observaciones
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        team: [...(originalData.team || [])], // Copiar el equipo
      };

      // Primero establecer la lista duplicada como lista actual
      this.checklistService['currentListSubject'].next(duplicatedData);
      // Luego guardar la lista
      this.checklistService.saveList(duplicatedData.name);

      // Crear y retornar la SavedList duplicada
      const duplicatedSavedList: SavedList = {
        id: duplicatedData.id,
        name: duplicatedData.name,
        tasksCount: duplicatedData.tasks.length,
        completedCount: 0, // Todas las tareas están sin completar
        date: duplicatedData.createdDate,
        preview: this.generatePreview(duplicatedData.tasks.map((t) => t.name)),
      };

      return duplicatedSavedList;
    } catch (error) {
      console.error('Error al duplicar lista:', error);
      throw new Error('No se pudo duplicar la lista');
    }
  }

  /**
   * Genera un nombre único para la copia
   * @param originalName Nombre original de la lista
   * @returns string Nombre único para la copia
   */
  private generateCopyName(originalName: string): string {
    const currentLists = this.storageService.getSavedLists();

    // Si no hay copia existente, usar el nombre base
    const baseCopyName = `${originalName} (Copia)`;
    if (!currentLists.some((list) => list.name === baseCopyName)) {
      return baseCopyName;
    }

    // Buscar el número más alto de copia existente
    let highestNumber = 0;
    const copyPattern = new RegExp(
      `^${this.escapeRegExp(originalName)} \\(Copia( (\\d+))?\\)$`
    );

    currentLists.forEach((list) => {
      const match = list.name.match(copyPattern);
      if (match) {
        const number = match[2] ? parseInt(match[2], 10) : 1;
        highestNumber = Math.max(highestNumber, number);
      }
    });

    return `${originalName} (Copia ${highestNumber + 1})`;
  }

  /**
   * Escapa caracteres especiales para regex
   * @param string Cadena a escapar
   * @returns string Cadena escapada
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Genera una vista previa del contenido de las tareas
   * @param taskNames Array de nombres de tareas
   * @returns string Vista previa
   */
  private generatePreview(taskNames: string[]): string {
    if (taskNames.length === 0) return 'Lista vacía';

    const preview = taskNames.slice(0, 3).join(', ');
    return taskNames.length > 3 ? `${preview}...` : preview;
  }
}
