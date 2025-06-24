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
   * Calcula el tamaño aproximado de una lista en bytes
   * @param listData Datos de la lista
   * @returns Tamaño aproximado en bytes
   */
  private calculateListSize(listData: ChecklistData): number {
    // Calcular el tamaño real que ocupará en localStorage
    const listJson = JSON.stringify(listData);
    const listKey = `list_${listData.id}`;

    // Tamaño = longitud del JSON + longitud de la clave + overhead mínimo
    // Multiplicar por 2 para caracteres Unicode (JavaScript usa UTF-16)
    const jsonSize = listJson.length * 2;
    const keySize = listKey.length * 2;

    // Agregar un pequeño overhead para metadatos del navegador
    const overhead = 50;

    return jsonSize + keySize + overhead;
  }

  /**
   * Calcula el espacio disponible en almacenamiento
   * @returns Espacio disponible en bytes
   */
  private getAvailableStorage(): number {
    const currentSize = this.storageService.calculateStorageSize();
    const maxSize = 3.5 * 1024 * 1024; // 3.5 MB
    const availableSpace = maxSize - currentSize;

    // Permitir usar hasta el 100% del espacio disponible
    // Retornar 0 si ya se excedió el límite
    return Math.max(0, availableSpace);
  }

  /**
   * Selecciona las listas que caben en el espacio disponible
   * @param lists Array de listas a evaluar
   * @param availableSpace Espacio disponible en bytes
   * @returns Array con las listas que caben y el espacio usado
   */
  private selectListsThatFit(
    lists: ChecklistData[],
    availableSpace: number
  ): {
    listsToImport: ChecklistData[];
    totalSizeUsed: number;
    skippedLists: ChecklistData[];
  } {
    const listsToImport: ChecklistData[] = [];
    const skippedLists: ChecklistData[] = [];
    let totalSizeUsed = 0;

    // Crear array con listas y sus tamaños para optimizar
    const listsWithSizes = lists.map((list) => ({
      list,
      size: this.calculateListSize(list),
    }));

    // Ordenar por tamaño ascendente para maximizar cantidad
    listsWithSizes.sort((a, b) => a.size - b.size);

    // Primera pasada: agregar listas en orden de menor a mayor tamaño
    for (let i = 0; i < listsWithSizes.length; i++) {
      const { list, size } = listsWithSizes[i];
      const spaceRemaining = availableSpace - totalSizeUsed;

      if (size <= spaceRemaining) {
        listsToImport.push(list);
        totalSizeUsed += size;
        listsWithSizes.splice(i, 1); // Remover de la lista
        i--; // Ajustar índice debido a la eliminación
      }
    }

    // Segunda pasada: intentar aprovechar mejor el espacio restante
    // Buscar combinaciones que aprovechen mejor el espacio restante
    let improved = true;
    while (improved && listsWithSizes.length > 0) {
      improved = false;
      const spaceRemaining = availableSpace - totalSizeUsed;

      // Buscar la lista más grande que aún quepa en el espacio restante
      for (let i = listsWithSizes.length - 1; i >= 0; i--) {
        const { list, size } = listsWithSizes[i];

        if (size <= spaceRemaining) {
          listsToImport.push(list);
          totalSizeUsed += size;
          listsWithSizes.splice(i, 1);
          improved = true;
          break;
        }
      }
    }

    // Las listas restantes no caben
    skippedLists.push(...listsWithSizes.map((item) => item.list));

    return { listsToImport, totalSizeUsed, skippedLists };
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
    skippedDueToSpace?: number;
    partialImport?: boolean;
  }> {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      skippedDueToSpace: 0,
      partialImport: false,
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

      // Verificar espacio disponible
      const availableSpace = this.getAvailableStorage();
      const totalImportSize = importData.lists.reduce(
        (total: number, list: any) => total + this.calculateListSize(list),
        0
      );

      let listsToProcess = importData.lists;

      // Si el archivo es más grande que el espacio disponible
      if (totalImportSize > availableSpace) {
        const selectionResult = this.selectListsThatFit(
          importData.lists,
          availableSpace
        );
        listsToProcess = selectionResult.listsToImport;
        result.skippedDueToSpace = selectionResult.skippedLists.length;
        result.partialImport = true;

        // Informar al usuario sobre la importación parcial
        if (result.skippedDueToSpace > 0) {
          result.errors.push(
            `⚠️ Importación parcial: Se omitieron ${result.skippedDueToSpace} listas por falta de espacio de almacenamiento. Se importaron las ${listsToProcess.length} listas más pequeñas que caben en el espacio disponible.`
          );
        }
      }

      // Crear backup si se solicita (funcionalidad removida por simplicidad)

      // Importar cada lista seleccionada
      for (const listData of listsToProcess) {
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
          result.errors.push(`Error al importar "${listData.name}": ${error}`);
          result.skipped++;
        }
      }

      result.success = result.imported > 0;

      // Mensaje de éxito con información adicional
      if (result.success && result.partialImport) {
        result.errors.unshift(
          `✅ Importación parcial completada: ${result.imported} listas importadas de ${importData.lists.length} totales.`
        );
      }

      return result;
    } catch (error) {
      console.error('Error during import process:', error);
      result.errors.push('Error general durante la importación');
      return result;
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
   * Obtiene información previa a la importación incluyendo espacio disponible
   * @param jsonData Datos en formato JSON string
   * @returns Información detallada sobre la importación planificada
   */
  getImportPreview(jsonData: string): {
    isValid: boolean;
    error?: string;
    totalLists: number;
    totalTasks: number;
    estimatedSize: number;
    availableSpace: number;
    canImportAll: boolean;
    listsToImport: number;
    listsToSkip: number;
    formattedEstimatedSize: string;
    formattedAvailableSpace: string;
  } | null {
    try {
      const validation = this.validateImportFile(jsonData);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error,
          totalLists: 0,
          totalTasks: 0,
          estimatedSize: 0,
          availableSpace: 0,
          canImportAll: false,
          listsToImport: 0,
          listsToSkip: 0,
          formattedEstimatedSize: '0 Bytes',
          formattedAvailableSpace: '0 Bytes',
        };
      }

      const data = validation.data;
      const availableSpace = this.getAvailableStorage();

      // Calcular tamaño total estimado
      const estimatedSize = data.lists.reduce(
        (total: number, list: any) => total + this.calculateListSize(list),
        0
      );

      // Determinar qué se puede importar
      const canImportAll = estimatedSize <= availableSpace;
      let listsToImport = data.lists.length;
      let listsToSkip = 0;

      if (!canImportAll) {
        const selectionResult = this.selectListsThatFit(
          data.lists,
          availableSpace
        );
        listsToImport = selectionResult.listsToImport.length;
        listsToSkip = selectionResult.skippedLists.length;
      }

      const totalTasks = data.lists.reduce((total: number, list: any) => {
        return total + (list.tasks ? list.tasks.length : 0);
      }, 0);

      return {
        isValid: true,
        totalLists: data.lists.length,
        totalTasks: totalTasks,
        estimatedSize: estimatedSize,
        availableSpace: availableSpace,
        canImportAll: canImportAll,
        listsToImport: listsToImport,
        listsToSkip: listsToSkip,
        formattedEstimatedSize: this.formatBytes(estimatedSize),
        formattedAvailableSpace: this.formatBytes(availableSpace),
      };
    } catch (error) {
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

  /**
   * Obtiene las listas del archivo con información de tamaño para selección manual
   * @param jsonData Datos en formato JSON string
   * @returns Array de listas con información de tamaño
   */
  getListsWithSizes(jsonData: string):
    | {
        list: ChecklistData;
        size: number;
        formattedSize: string;
      }[]
    | null {
    try {
      const validation = this.validateImportFile(jsonData);
      if (!validation.isValid || !validation.data) {
        return null;
      }

      const data = validation.data;
      return data.lists.map((list: ChecklistData) => {
        const size = this.calculateListSize(list);
        return {
          list,
          size,
          formattedSize: this.formatBytes(size),
        };
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Importa solo las listas seleccionadas manualmente
   * @param jsonData Datos en formato JSON string
   * @param selectedListIds Array de IDs de listas a importar
   * @param options Opciones de importación
   * @returns Resultado de la importación
   */
  async importSelectedLists(
    jsonData: string,
    selectedListIds: string[],
    options: {
      overwriteExisting: boolean;
      createBackup: boolean;
    } = { overwriteExisting: false, createBackup: true }
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
    skippedDueToSpace?: number;
    partialImport?: boolean;
  }> {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      skippedDueToSpace: 0,
      partialImport: false,
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

      // Filtrar solo las listas seleccionadas
      const selectedLists = importData.lists.filter((list: any) =>
        selectedListIds.includes(list.id)
      );

      if (selectedLists.length === 0) {
        result.errors.push('No se encontraron listas seleccionadas');
        return result;
      }

      // Crear backup si se solicita (funcionalidad removida por simplicidad)

      // Importar cada lista seleccionada
      for (const listData of selectedLists) {
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
          result.errors.push(`Error al importar "${listData.name}": ${error}`);
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
}
