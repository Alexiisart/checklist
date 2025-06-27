import { Injectable } from '@angular/core';
import { ChecklistData } from '../../models/task.interface';
import { DateManagerService } from '../date-manager.service';

/**
 * Servicio para convertir listas a formato Base64 y generar URLs
 */
@Injectable({
  providedIn: 'root',
})
export class Base64UrlService {
  private readonly BASE_URL = window.location.origin;

  constructor(private dateManager: DateManagerService) {}

  /**
   * Convierte una lista a formato Base64
   * @param checklistData Datos de la lista
   * @returns String en formato Base64
   */
  encodeToBase64(checklistData: ChecklistData): string {
    try {
      // Crear una copia limpia de los datos sin propiedades innecesarias
      const cleanData = this.cleanDataForSharing(checklistData);

      // Convertir a JSON y luego a Base64
      const jsonString = JSON.stringify(cleanData);
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      console.error('Error convirtiendo a Base64:', error);
      throw new Error('Error al procesar los datos de la lista');
    }
  }

  /**
   * Decodifica una cadena Base64 a datos de lista
   * @param base64String Cadena en formato Base64
   * @returns Datos de la lista o null si hay error
   */
  decodeFromBase64(base64String: string): ChecklistData | null {
    try {
      const jsonString = decodeURIComponent(atob(base64String));
      const data = JSON.parse(jsonString);

      // Validar que tenga la estructura básica esperada
      if (this.isValidChecklistData(data)) {
        return data as ChecklistData;
      }

      return null;
    } catch (error) {
      console.error('Error decodificando Base64:', error);
      return null;
    }
  }

  /**
   * Genera la URL completa con los datos de la lista
   * @param checklistData Datos de la lista
   * @returns URL completa con query parameter
   */
  generateFullUrl(checklistData: ChecklistData): string {
    const base64Data = this.encodeToBase64(checklistData);
    return `${this.BASE_URL}?shared=${base64Data}`;
  }

  /**
   * Estima la longitud de la URL que se generaría
   * @param checklistData Datos de la lista
   * @returns Longitud estimada en caracteres
   */
  estimateUrlLength(checklistData: ChecklistData): number {
    try {
      const base64Data = this.encodeToBase64(checklistData);
      return `${this.BASE_URL}?shared=${base64Data}`.length;
    } catch (error) {
      // Si hay error, devolver un valor alto para que falle la validación
      return 100000;
    }
  }

  /**
   * Extrae datos de lista desde la URL actual
   * @returns Datos de la lista si están presentes en la URL, null si no
   */
  extractFromCurrentUrl(): ChecklistData | null {
    try {
      // Intentar primero con query parameters (nuevo formato)
      const urlParams = new URLSearchParams(window.location.search);
      let sharedData = urlParams.get('shared');

      // Si no encontramos con query params, intentar con hash (compatibilidad)
      if (!sharedData) {
        const hash = window.location.hash;

        // Buscar tanto #share-data= como #shared= para compatibilidad
        const match = hash.match(/^#(?:share-data|shared)=(.+)$/);
        if (match && match[1]) {
          sharedData = match[1];
        }
      }

      if (sharedData) {
        const decoded = this.decodeFromBase64(sharedData);
        return decoded;
      }

      return null;
    } catch (error) {
      console.error('Error extrayendo datos de URL:', error);
      return null;
    }
  }

  /**
   * Limpia los datos de la lista para compartir, removiendo información innecesaria
   * @param data Datos originales de la lista
   * @returns Datos limpios para compartir
   */
  private cleanDataForSharing(data: ChecklistData): any {
    return {
      name: data.name,
      tasks:
        data.tasks?.map((task) => ({
          id: task.id,
          name: task.name,
          completed: task.completed,
          priority: task.priority || false,
          dueDate: task.dueDate || null,
          completedDate: task.completedDate || null,
          leader: task.leader,
          subtasks:
            task.subtasks?.map((subtask) => ({
              id: subtask.id,
              name: subtask.name,
              completed: subtask.completed,
              priority: subtask.priority || false,
              assignedMember: subtask.assignedMember,
            })) || [],
          errors:
            task.errors?.map((error) => ({
              id: error.id,
              name: error.name,
            })) || [],
        })) || [],
      team: data.team || [],
      observations: data.observations || '',
      // Agregar metadatos de compartir usando servicio centralizado
      sharedAt: this.dateManager.formatDateToISO(new Date()),
      shareVersion: '1.2', // Incrementar versión para incluir fechas de tareas
    };
  }

  /**
   * Valida que los datos tengan la estructura básica de una lista
   * @param data Datos a validar
   * @returns true si es válido, false si no
   */
  private isValidChecklistData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      Array.isArray(data.tasks)
    );
  }
}
