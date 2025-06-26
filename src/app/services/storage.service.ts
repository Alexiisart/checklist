import { Injectable } from '@angular/core';
import { ChecklistData, SavedList } from '../models/task.interface';
import { ToastService } from './toast.service';

/**
 * Servicio para gestionar el almacenamiento local de datos de la aplicación.
 * Maneja el guardado y carga de listas de tareas, así como el control del espacio de almacenamiento.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** Clave para almacenar el progreso actual */
  private readonly STORAGE_KEY = 'checklist_data';
  /** Clave para almacenar las listas guardadas */
  private readonly LISTS_KEY = 'saved_lists';
  /** Clave para almacenar las preferencias del usuario */
  private readonly PREFERENCES_KEY = 'user_preferences';
  /** Tamaño máximo de almacenamiento permitido (3.5 MB) */
  private readonly MAX_STORAGE_SIZE = 3.5 * 1024 * 1024; // 3.5 MB en bytes

  constructor(private toastService: ToastService) {}

  /**
   * Guarda el progreso actual en el almacenamiento local
   * @param data Datos del checklist a guardar
   * @throws Error si no hay espacio suficiente
   */
  saveCurrentProgress(data: ChecklistData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('No se pudo guardar el progreso. Espacio insuficiente.');
    }
  }

  /**
   * Carga el progreso actual desde el almacenamiento local
   * @returns Los datos del checklist o null si no hay datos guardados
   */
  loadCurrentProgress(): ChecklistData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Elimina el progreso actual del almacenamiento local
   */
  clearCurrentProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Guarda una lista completa en el almacenamiento local
   * @param listData Datos de la lista a guardar
   * @throws Error si no hay espacio suficiente
   */
  saveList(listData: ChecklistData): void {
    try {
      // Calcular el tamaño que ocupará la nueva lista
      const listJson = JSON.stringify(listData);
      const listKey = `list_${listData.id}`;
      const newListSize = (listJson.length + listKey.length) * 2; // UTF-16

      // Verificar si ya existe la lista (para actualizaciones)
      const existingData = localStorage.getItem(listKey);
      const existingSize = existingData
        ? (existingData.length + listKey.length) * 2
        : 0;

      // Calcular espacio necesario (diferencia si es actualización, total si es nueva)
      const spaceNeeded = newListSize - existingSize;

      // Verificar espacio disponible solo si se necesita más espacio
      if (spaceNeeded > 0) {
        const currentSize = this.calculateStorageSize();
        const availableSpace = this.MAX_STORAGE_SIZE - currentSize;

        if (spaceNeeded > availableSpace) {
          throw new Error(
            `No hay espacio suficiente. Se necesitan ${this.formatBytes(
              spaceNeeded
            )} pero solo hay ${this.formatBytes(availableSpace)} disponibles.`
          );
        }
      }

      const existingLists = this.getSavedLists();
      const listIndex = existingLists.findIndex(
        (list) => list.id === listData.id
      );

      const savedList: SavedList = {
        id: listData.id,
        name: listData.name,
        tasksCount: listData.tasks.length,
        completedCount: listData.tasks.filter((task) => task.completed).length,
        date: listData.modifiedDate,
        preview: listData.tasks
          .slice(0, 3)
          .map((task) => task.name)
          .join(', '),
        priority: listData.priority || false,
      };

      if (listIndex >= 0) {
        existingLists[listIndex] = savedList;
      } else {
        existingLists.push(savedList);
      }

      // Guardar la lista completa
      localStorage.setItem(listKey, listJson);

      // Guardar el índice de listas
      localStorage.setItem(this.LISTS_KEY, JSON.stringify(existingLists));

      // Verificar límites de almacenamiento después de guardar
      this.checkAndAlertStorageLimits();
    } catch (error) {
      console.error('Error saving list:', error);
      // Re-lanzar el error original si contiene información específica
      if (
        error instanceof Error &&
        error.message.includes('espacio suficiente')
      ) {
        throw error;
      }
      throw new Error('No se pudo guardar la lista. Espacio insuficiente.');
    }
  }

  /**
   * Obtiene todas las listas guardadas
   * @returns Array de listas guardadas
   */
  getSavedLists(): SavedList[] {
    try {
      const data = localStorage.getItem(this.LISTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading saved lists:', error);
      return [];
    }
  }

  /**
   * Carga una lista específica desde el almacenamiento local
   * @param listId ID de la lista a cargar
   * @returns Datos de la lista o null si no existe
   */
  loadList(listId: string): ChecklistData | null {
    try {
      const data = localStorage.getItem(`list_${listId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading list:', error);
      return null;
    }
  }

  /**
   * Elimina una lista del almacenamiento local
   * @param listId ID de la lista a eliminar
   * @throws Error si no se puede eliminar la lista
   */
  deleteList(listId: string): void {
    try {
      // Eliminar la lista completa
      localStorage.removeItem(`list_${listId}`);

      // Actualizar el índice
      const existingLists = this.getSavedLists();
      const updatedLists = existingLists.filter((list) => list.id !== listId);
      localStorage.setItem(this.LISTS_KEY, JSON.stringify(updatedLists));
    } catch (error) {
      console.error('Error deleting list:', error);
      throw new Error('No se pudo eliminar la lista.');
    }
  }

  /**
   * Renombra una lista guardada
   * @param listId ID de la lista a renombrar
   * @param newName Nuevo nombre para la lista
   * @throws Error si no se puede renombrar la lista
   */
  renameList(listId: string, newName: string): void {
    try {
      // Cargar la lista completa
      const listData = this.loadList(listId);
      if (!listData) {
        throw new Error('Lista no encontrada');
      }

      // Actualizar el nombre en los datos de la lista
      listData.name = newName;
      listData.modifiedDate = new Date().toISOString();

      // Guardar la lista completa actualizada
      localStorage.setItem(`list_${listId}`, JSON.stringify(listData));

      // Actualizar el índice de listas
      const existingLists = this.getSavedLists();
      const listIndex = existingLists.findIndex((list) => list.id === listId);

      if (listIndex >= 0) {
        existingLists[listIndex].name = newName;
        existingLists[listIndex].date = listData.modifiedDate;
        localStorage.setItem(this.LISTS_KEY, JSON.stringify(existingLists));
      }
    } catch (error) {
      console.error('Error renaming list:', error);
      throw new Error('No se pudo renombrar la lista.');
    }
  }

  /**
   * Calcula el tamaño total del almacenamiento utilizado
   * @returns Tamaño en bytes
   */
  calculateStorageSize(): number {
    let totalSize = 0;

    // Solo contar las claves de nuestra aplicación
    const appKeys = [
      this.STORAGE_KEY, // 'checklist_data'
      this.LISTS_KEY, // 'saved_lists'
    ];

    // Agregar todas las claves de listas individuales (list_*)
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('list_')) {
        appKeys.push(key);
      }
    }

    // Calcular tamaño solo de nuestras claves
    for (const key of appKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // UTF-16 usa 2 bytes por carácter
        totalSize += (key.length + value.length) * 2;
      }
    }

    return totalSize;
  }

  /**
   * Calcula el porcentaje de almacenamiento utilizado
   * @returns Porcentaje de uso (0-100)
   */
  getStoragePercentage(): number {
    const currentSize = this.calculateStorageSize();
    return Math.round((currentSize / this.MAX_STORAGE_SIZE) * 100);
  }

  /**
   * Verifica si el almacenamiento está cerca del límite
   * @returns true si el uso es mayor al 80%
   */
  isStorageNearLimit(): boolean {
    return this.getStoragePercentage() > 80;
  }

  /**
   * Genera un ID único para una nueva lista
   * @returns ID único en formato string
   */
  generateListId(): string {
    return 'list_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Verifica automáticamente los límites de almacenamiento y muestra alertas si es necesario
   * Solo para uso interno del sistema de almacenamiento
   */
  checkAndAlertStorageLimits(): void {
    const currentPercentage = this.getStoragePercentage();

    // Si está al 100% o más, mostrar alerta
    if (currentPercentage >= 100) {
      this.toastService.showAlert(
        `¡Almacenamiento lleno! (${currentPercentage.toFixed(
          1
        )}%) Elimina listas antiguas para continuar.`,
        'danger',
        5000
      );
      return;
    }

    // Si está entre 90-99%, advertir fuertemente
    if (currentPercentage >= 90) {
      this.toastService.showAlert(
        `¡Almacenamiento casi lleno! (${currentPercentage.toFixed(1)}%)`,
        'danger',
        4000
      );
    }
    // Si está entre 70-89%, advertir
    else if (currentPercentage >= 70) {
      this.toastService.showAlert(
        `Almacenamiento alto (${currentPercentage.toFixed(1)}%)`,
        'warning',
        3000
      );
    }
  }

  /**
   * Método eliminado: showStorageConfirm ya no es necesario
   * Se usa ToastService en su lugar como en el original
   */

  /**
   * Obtiene información de almacenamiento para mostrar en UI
   * @returns Objeto con información de almacenamiento
   */
  getStorageInfo(): {
    percentage: number;
    isNearLimit: boolean;
    isFull: boolean;
    formattedSize: string;
    level: 'safe' | 'warning' | 'danger';
  } {
    const percentage = this.getStoragePercentage();
    const currentSize = this.calculateStorageSize();

    let level: 'safe' | 'warning' | 'danger' = 'safe';
    if (percentage >= 90) level = 'danger';
    else if (percentage >= 70) level = 'warning';

    return {
      percentage,
      isNearLimit: this.isStorageNearLimit(),
      isFull: percentage >= 100,
      formattedSize: this.formatBytes(currentSize),
      level,
    };
  }

  /**
   * Guarda las preferencias del usuario
   * @param preferences Objeto con las preferencias del usuario
   */
  saveUserPreferences(preferences: any): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  /**
   * Carga las preferencias del usuario
   * @returns Preferencias del usuario o null si no existen
   */
  loadUserPreferences(): any {
    try {
      const data = localStorage.getItem(this.PREFERENCES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }

  /**
   * Formatea bytes en texto legible
   * @param bytes Cantidad de bytes
   * @returns String formateado
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
