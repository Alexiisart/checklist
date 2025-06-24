import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExportImportService } from '../../../services/export-import.service';
import { ToastService } from '../../../services/toast.service';
import { SavedList, ConfirmData } from '../../../models/task.interface';

/**
 * Estado del modal de selección de listas
 */
interface ListSelectionState {
  isVisible: boolean;
  importPreview: any | null;
  selectedListIds: Set<string>;
  selectedListsSize: number;
  listsWithSizes: Array<{ list: any; size: number; formattedSize: string }>;
}

/**
 * Estado del modal de confirmación
 */
interface ConfirmationState {
  isVisible: boolean;
  data: ConfirmData | null;
}

/**
 * Estado general de la importación
 */
interface ImportState {
  pendingContent: string | null;
  isProcessing: boolean;
}

/**
 * Estado completo del componente export-import
 */
interface ExportImportState {
  listSelection: ListSelectionState;
  confirmation: ConfirmationState;
  import: ImportState;
  isDropdownOpen: boolean;
  isSelectionMode: boolean;
  selectedExportLists: Set<string>;
}

/**
 * Servicio de estado para manejar la lógica compleja del componente export-import
 */
@Injectable({
  providedIn: 'root',
})
export class ExportImportStateService {
  /** Estado inicial del servicio */
  private initialState: ExportImportState = {
    listSelection: {
      isVisible: false,
      importPreview: null,
      selectedListIds: new Set<string>(),
      selectedListsSize: 0,
      listsWithSizes: [],
    },
    confirmation: {
      isVisible: false,
      data: null,
    },
    import: {
      pendingContent: null,
      isProcessing: false,
    },
    isDropdownOpen: false,
    isSelectionMode: false,
    selectedExportLists: new Set<string>(),
  };

  /** Subject principal del estado */
  private stateSubject = new BehaviorSubject<ExportImportState>(
    this.initialState
  );

  /** Observable del estado para componentes */
  public state$ = this.stateSubject.asObservable();

  constructor(
    private exportImportService: ExportImportService,
    private toastService: ToastService
  ) {}

  /** Obtiene el estado actual */
  private get currentState(): ExportImportState {
    return this.stateSubject.getValue();
  }

  /** Actualiza el estado con cambios parciales */
  private updateState(changes: Partial<ExportImportState>): void {
    const newState = { ...this.currentState, ...changes };
    this.stateSubject.next(newState);
  }

  /** Actualiza el estado de selección de listas con cambios parciales */
  private updateListSelectionState(changes: Partial<ListSelectionState>): void {
    const newState = {
      ...this.currentState,
      listSelection: { ...this.currentState.listSelection, ...changes },
    };
    this.stateSubject.next(newState);
  }

  /** Actualiza el estado de confirmación con cambios parciales */
  private updateConfirmationState(changes: Partial<ConfirmationState>): void {
    const newState = {
      ...this.currentState,
      confirmation: { ...this.currentState.confirmation, ...changes },
    };
    this.stateSubject.next(newState);
  }

  /** Actualiza el estado de importación con cambios parciales */
  private updateImportState(changes: Partial<ImportState>): void {
    const newState = {
      ...this.currentState,
      import: { ...this.currentState.import, ...changes },
    };
    this.stateSubject.next(newState);
  }

  /** Abre o cierra el dropdown principal */
  toggleDropdown(): void {
    this.updateState({ isDropdownOpen: !this.currentState.isDropdownOpen });
  }

  /** Cierra el dropdown y resetea estados relacionados */
  closeDropdown(): void {
    this.updateState({
      isDropdownOpen: false,
      isSelectionMode: false,
      selectedExportLists: new Set<string>(),
    });
  }

  /** Activa o desactiva el modo de selección de exportar */
  toggleSelectionMode(): void {
    this.updateState({ isSelectionMode: !this.currentState.isSelectionMode });
  }

  /** Cancela el modo de selección de exportar */
  cancelExportSelection(): void {
    this.updateState({
      isSelectionMode: false,
      selectedExportLists: new Set<string>(),
    });
  }

  /** Selecciona todas las listas para exportar */
  selectAllExportLists(savedLists: SavedList[]): void {
    const allIds = new Set(savedLists.map((list) => list.id));
    this.updateState({ selectedExportLists: allIds });
  }

  /** Deselecciona todas las listas para exportar */
  selectNoneExportLists(): void {
    this.updateState({ selectedExportLists: new Set<string>() });
  }

  /** Alterna la selección de una lista específica para exportar */
  toggleExportList(listId: string): void {
    const selectedLists = new Set(this.currentState.selectedExportLists);
    if (selectedLists.has(listId)) {
      selectedLists.delete(listId);
    } else {
      selectedLists.add(listId);
    }
    this.updateState({ selectedExportLists: selectedLists });
  }

  /** Procesa un archivo seleccionado para importar */
  async processImportFile(file: File): Promise<void> {
    this.updateImportState({ isProcessing: true });

    try {
      // Leer el archivo
      const fileContent = await this.exportImportService.readFileAsText(file);

      // Obtener vista previa de la importación
      const preview = this.exportImportService.getImportPreview(fileContent);

      if (!preview || !preview.isValid) {
        this.toastService.showAlert(
          preview?.error || 'Archivo inválido o corrupto',
          'danger'
        );
        return;
      }

      this.updateImportState({ pendingContent: fileContent });

      if (preview.canImportAll) {
        // Mostrar confirmación normal si caben todas las listas
        this.showNormalImportConfirmation(preview);
      } else {
        // Mostrar modal de selección manual si no hay espacio suficiente
        this.showListSelectionModal(preview, fileContent);
      }
    } catch (error) {
      console.error('Error processing import file:', error);
      this.toastService.showAlert('Error al procesar el archivo', 'danger');
    } finally {
      this.updateImportState({ isProcessing: false });
    }
  }

  /** Muestra el modal de confirmación normal para importación completa */
  private showNormalImportConfirmation(preview: any): void {
    const message =
      `¿Importar ${preview.totalLists} listas con ${preview.totalTasks} tareas?\n\n` +
      `Tamaño estimado: ${preview.formattedEstimatedSize}\n` +
      `Espacio disponible: ${preview.formattedAvailableSpace}\n\n` +
      `Esto creará copias de las listas. Las listas existentes no se modificarán.`;

    this.updateConfirmationState({
      isVisible: true,
      data: {
        title: 'Confirmar Importación',
        message: message,
        confirmText: 'Importar',
        cancelText: 'Cancelar',
      },
    });
  }

  /** Muestra el modal de selección manual de listas */
  private showListSelectionModal(preview: any, fileContent: string): void {
    const listsWithSizes =
      this.exportImportService.getListsWithSizes(fileContent) || [];

    this.updateListSelectionState({
      isVisible: true,
      importPreview: preview,
      selectedListIds: new Set<string>(),
      selectedListsSize: 0,
      listsWithSizes: listsWithSizes,
    });
  }

  /** Alterna la selección de una lista para importar */
  toggleListForImport(listId: string, listSize: number): boolean {
    const currentSelection = this.currentState.listSelection;
    const isCurrentlySelected = currentSelection.selectedListIds.has(listId);

    if (isCurrentlySelected) {
      // Deseleccionar
      const newSelectedIds = new Set(currentSelection.selectedListIds);
      newSelectedIds.delete(listId);

      this.updateListSelectionState({
        selectedListIds: newSelectedIds,
        selectedListsSize: currentSelection.selectedListsSize - listSize,
      });
      return true;
    } else {
      // Verificar si hay espacio suficiente para seleccionar
      const spaceAfterSelection = currentSelection.selectedListsSize + listSize;
      const availableSpace =
        currentSelection.importPreview?.availableSpace || 0;

      if (spaceAfterSelection <= availableSpace) {
        // Seleccionar
        const newSelectedIds = new Set(currentSelection.selectedListIds);
        newSelectedIds.add(listId);

        this.updateListSelectionState({
          selectedListIds: newSelectedIds,
          selectedListsSize: spaceAfterSelection,
        });
        return true;
      } else {
        // No hay espacio suficiente
        this.toastService.showAlert(
          'No hay espacio suficiente para esta lista',
          'warning',
          3000
        );
        return false;
      }
    }
  }

  /** Calcula el espacio restante para selección */
  getRemainingSpace(): number {
    const currentSelection = this.currentState.listSelection;
    const availableSpace = currentSelection.importPreview?.availableSpace || 0;
    return availableSpace - currentSelection.selectedListsSize;
  }

  /** Formatea el espacio restante en texto legible */
  getRemainingSpaceFormatted(): string {
    const remaining = this.getRemainingSpace();
    return this.formatBytes(remaining);
  }

  /** Confirma la selección manual de listas para importar */
  confirmManualSelection(): void {
    const currentSelection = this.currentState.listSelection;

    if (currentSelection.selectedListIds.size === 0) {
      this.toastService.showAlert(
        'Selecciona al menos una lista para importar',
        'warning'
      );
      return;
    }

    const selectedCount = currentSelection.selectedListIds.size;
    const totalCount = currentSelection.importPreview?.totalLists || 0;

    const message =
      `¿Importar las ${selectedCount} listas seleccionadas de ${totalCount} disponibles?\n\n` +
      `Espacio que se usará: ${this.formatBytes(
        currentSelection.selectedListsSize
      )}\n` +
      `Espacio disponible: ${currentSelection.importPreview?.formattedAvailableSpace}\n\n` +
      `Esto creará copias de las listas seleccionadas.`;

    this.updateConfirmationState({
      isVisible: true,
      data: {
        title: 'Confirmar Importación Seleccionada',
        message: message,
        confirmText: 'Importar seleccionadas',
        cancelText: 'Cancelar',
      },
    });

    this.updateListSelectionState({ isVisible: false });
  }

  /** Cancela la selección manual de listas */
  cancelManualSelection(): void {
    this.updateListSelectionState({
      isVisible: false,
      importPreview: null,
      selectedListIds: new Set<string>(),
      selectedListsSize: 0,
      listsWithSizes: [],
    });
    this.updateImportState({ pendingContent: null });
  }

  /** Selecciona todas las listas para importar */
  selectAllImportLists(): void {
    const listsWithSizes = this.currentState.listSelection.listsWithSizes;
    const availableSpace =
      this.currentState.listSelection.importPreview?.availableSpace || 0;

    let totalSize = 0;
    const selectedIds = new Set<string>();

    // Solo seleccionar las que quepan
    for (const item of listsWithSizes) {
      if (totalSize + item.size <= availableSpace) {
        selectedIds.add(item.list.id);
        totalSize += item.size;
      }
    }

    this.updateListSelectionState({
      selectedListIds: selectedIds,
      selectedListsSize: totalSize,
    });
  }

  /** Deselecciona todas las listas para importar */
  selectNoneImportLists(): void {
    this.updateListSelectionState({
      selectedListIds: new Set<string>(),
      selectedListsSize: 0,
    });
  }

  /** Ejecuta la importación de listas */
  async executeImport(): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
  }> {
    const currentState = this.currentState;
    const fileContent = currentState.import.pendingContent;

    if (!fileContent) {
      return {
        success: false,
        imported: 0,
        errors: ['No hay contenido para importar'],
      };
    }

    this.updateImportState({ isProcessing: true });

    try {
      let result;

      // Determinar si es importación manual o automática
      if (currentState.listSelection.selectedListIds.size > 0) {
        // Importación manual de listas seleccionadas
        const selectedIds = Array.from(
          currentState.listSelection.selectedListIds
        );
        result = await this.exportImportService.importSelectedLists(
          fileContent,
          selectedIds,
          {
            overwriteExisting: false,
            createBackup: true,
          }
        );
      } else {
        // Importación automática de todas las listas
        result = await this.exportImportService.importLists(fileContent, {
          overwriteExisting: false,
          createBackup: true,
        });
      }

      return result;
    } catch (error) {
      console.error('Error executing import:', error);
      return {
        success: false,
        imported: 0,
        errors: ['Error general durante la importación'],
      };
    } finally {
      this.updateImportState({ isProcessing: false });
    }
  }

  /** Muestra el modal de confirmación con datos específicos */
  showConfirmation(data: ConfirmData): void {
    this.updateConfirmationState({ isVisible: true, data });
  }

  /** Cierra el modal de confirmación */
  closeConfirmation(): void {
    this.updateConfirmationState({ isVisible: false, data: null });
  }

  /** Resetea todo el estado a valores iniciales */
  resetState(): void {
    this.stateSubject.next(this.initialState);
  }

  /** Limpia el estado después de una importación exitosa */
  cleanupAfterImport(): void {
    this.updateState({
      listSelection: {
        isVisible: false,
        importPreview: null,
        selectedListIds: new Set<string>(),
        selectedListsSize: 0,
        listsWithSizes: [],
      },
      confirmation: {
        isVisible: false,
        data: null,
      },
      import: {
        pendingContent: null,
        isProcessing: false,
      },
    });
  }

  /** Formatea bytes en texto legible */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /** Obtiene el estado actual como snapshot (para uso directo en templates) */
  getStateSnapshot(): ExportImportState {
    return this.currentState;
  }

  /** Verifica si una lista está seleccionada para importar */
  isListSelectedForImport(listId: string): boolean {
    return this.currentState.listSelection.selectedListIds.has(listId);
  }

  /** Verifica si una lista está seleccionada para exportar */
  isListSelectedForExport(listId: string): boolean {
    return this.currentState.selectedExportLists.has(listId);
  }

  /** Obtiene el número de listas seleccionadas para importar */
  getSelectedImportListsCount(): number {
    return this.currentState.listSelection.selectedListIds.size;
  }

  /** Obtiene el número de listas seleccionadas para exportar */
  getSelectedExportListsCount(): number {
    return this.currentState.selectedExportLists.size;
  }

  /** Obtiene las listas con tamaños para el modal de selección */
  getListsWithSizes(): Array<{
    list: any;
    size: number;
    formattedSize: string;
  }> {
    return this.currentState.listSelection.listsWithSizes;
  }

  /** Obtiene la vista previa de importación actual */
  getImportPreview(): any | null {
    return this.currentState.listSelection.importPreview;
  }

  /** Obtiene los datos del modal de confirmación */
  getConfirmationData(): ConfirmData | null {
    return this.currentState.confirmation.data;
  }

  /** Verifica si el dropdown está abierto */
  isDropdownOpen(): boolean {
    return this.currentState.isDropdownOpen;
  }

  /** Verifica si está en modo de selección de exportar */
  isInSelectionMode(): boolean {
    return this.currentState.isSelectionMode;
  }

  /** Verifica si el modal de selección de listas está visible */
  isListSelectionModalVisible(): boolean {
    return this.currentState.listSelection.isVisible;
  }

  /** Verifica si el modal de confirmación está visible */
  isConfirmationModalVisible(): boolean {
    return this.currentState.confirmation.isVisible;
  }

  /** Verifica si está procesando una importación */
  isProcessingImport(): boolean {
    return this.currentState.import.isProcessing;
  }
}
