import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ChecklistData } from '../models/task.interface';

/**
 * Servicio para manejar la exportación e importación de listas de checklists
 */
@Injectable({
  providedIn: 'root',
})
export class ExportImportService {
  constructor(private storageService: StorageService) {}

  /**
   * Exporta todas las listas guardadas a un archivo JSON
   * @returns Datos de exportación en formato JSON
   */
  exportAllLists(): string {
    try {
      const savedLists = this.storageService.getSavedLists();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        lists: [] as ChecklistData[],
      };

      // Cargar datos completos de cada lista
      for (const savedList of savedLists) {
        const fullListData = this.storageService.loadList(savedList.id);
        if (fullListData) {
          exportData.lists.push(fullListData);
        }
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting lists:', error);
      throw new Error('Error al exportar las listas');
    }
  }

  /**
   * Exporta listas seleccionadas a un archivo JSON
   * @param selectedListIds Array de IDs de listas a exportar
   * @returns Datos de exportación en formato JSON
   */
  exportSelectedLists(selectedListIds: string[]): string {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        lists: [] as ChecklistData[],
      };

      // Cargar datos completos de las listas seleccionadas
      for (const listId of selectedListIds) {
        const fullListData = this.storageService.loadList(listId);
        if (fullListData) {
          exportData.lists.push(fullListData);
        }
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting selected lists:', error);
      throw new Error('Error al exportar las listas seleccionadas');
    }
  }

  /**
   * Descarga el archivo JSON con las listas exportadas
   * @param jsonData Datos en formato JSON
   * @param filename Nombre del archivo (opcional)
   */
  downloadJsonFile(jsonData: string, filename?: string): void {
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download =
        filename ||
        `checklist-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error al descargar el archivo');
    }
  }

  /**
   * Valida el formato del archivo de importación
   * @param jsonData Datos en formato JSON string
   * @returns Resultado de la validación
   */
  validateImportFile(jsonData: string): {
    isValid: boolean;
    error?: string;
    data?: any;
  } {
    try {
      const data = JSON.parse(jsonData);

      // Verificar estructura básica
      if (!data.version || !data.exportDate || !Array.isArray(data.lists)) {
        return {
          isValid: false,
          error: 'Formato de archivo inválido. Falta estructura requerida.',
        };
      }

      // Verificar versión compatible
      if (data.version !== '1.0') {
        return {
          isValid: false,
          error: 'Versión de archivo no compatible.',
        };
      }

      // Verificar que cada lista tenga la estructura correcta
      for (const list of data.lists) {
        if (!this.validateListStructure(list)) {
          return {
            isValid: false,
            error: 'Una o más listas tienen estructura inválida.',
          };
        }
      }

      return {
        isValid: true,
        data: data,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Archivo JSON inválido o corrupto.',
      };
    }
  }

  /**
   * Valida la estructura de una lista individual
   * @param list Datos de la lista a validar
   * @returns true si la estructura es válida
   */
  private validateListStructure(list: any): boolean {
    const requiredFields = ['id', 'name', 'tasks', 'observations'];

    for (const field of requiredFields) {
      if (!(field in list)) {
        return false;
      }
    }

    // Verificar que tasks sea un array
    if (!Array.isArray(list.tasks)) {
      return false;
    }

    // Verificar estructura básica de cada tarea
    for (const task of list.tasks) {
      if (!task.id || !task.name || typeof task.completed !== 'boolean') {
        return false;
      }

      if (!Array.isArray(task.subtasks) || !Array.isArray(task.errors)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Importa listas desde un archivo JSON validado
   * @param jsonData Datos en formato JSON string
   * @param options Opciones de importación
   * @returns Resultado de la importación
   */
  async importLists(
    jsonData: string,
    options: {
      overwriteExisting: boolean;
      createBackup: boolean;
    } = { overwriteExisting: false, createBackup: true }
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      // Validar archivo
      const validation = this.validateImportFile(jsonData);
      if (!validation.isValid) {
        result.errors.push(validation.error || 'Archivo inválido');
        return result;
      }

      const importData = validation.data;
      const existingLists = this.storageService.getSavedLists();

      // Crear backup si se solicita
      if (options.createBackup) {
        await this.createBackupBeforeImport();
      }

      // Importar cada lista
      for (const listData of importData.lists) {
        try {
          const existingList = existingLists.find((l) => l.id === listData.id);

          if (existingList && !options.overwriteExisting) {
            // Generar nuevo ID si ya existe y no se permite sobrescribir
            listData.id = this.storageService.generateListId();
            listData.name = `${listData.name} (Importada)`;
          }

          // Actualizar fechas
          listData.modifiedDate = new Date().toISOString();
          if (!listData.createdDate) {
            listData.createdDate = listData.modifiedDate;
          }

          // Guardar la lista
          this.storageService.saveList(listData);
          result.imported++;
        } catch (error) {
          console.error('Error importing list:', listData.name, error);
          result.errors.push(`Error al importar "${listData.name}"`);
          result.skipped++;
        }
      }

      result.success = result.imported > 0;
      return result;
    } catch (error) {
      console.error('Error during import process:', error);
      result.errors.push('Error general durante la importación');
      return result;
    }
  }

  /**
   * Crea un backup automático antes de importar
   */
  private async createBackupBeforeImport(): Promise<void> {
    try {
      const backupData = this.exportAllLists();
      const backupFilename = `backup-before-import-${
        new Date().toISOString().split('T')[0]
      }.json`;

      // Guardar en localStorage como backup temporal
      localStorage.setItem('last_backup_before_import', backupData);
      localStorage.setItem('last_backup_date', new Date().toISOString());
    } catch (error) {
      console.warn('No se pudo crear backup automático:', error);
    }
  }

  /**
   * Maneja la lectura de archivos subidos por el usuario
   * @param file Archivo seleccionado por el usuario
   * @returns Promise con el contenido del archivo como string
   */
  readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        reject(new Error('El archivo debe ser de tipo JSON'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          resolve(content);
        } catch (error) {
          reject(new Error('Error al leer el archivo'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Obtiene estadísticas del archivo de importación
   * @param jsonData Datos en formato JSON string
   * @returns Estadísticas del archivo
   */
  getImportStats(jsonData: string): {
    totalLists: number;
    totalTasks: number;
    exportDate: string;
    version: string;
  } | null {
    try {
      const validation = this.validateImportFile(jsonData);
      if (!validation.isValid || !validation.data) {
        return null;
      }

      const data = validation.data;
      const totalTasks = data.lists.reduce((total: number, list: any) => {
        return total + (list.tasks ? list.tasks.length : 0);
      }, 0);

      return {
        totalLists: data.lists.length,
        totalTasks: totalTasks,
        exportDate: data.exportDate,
        version: data.version,
      };
    } catch (error) {
      return null;
    }
  }
}
