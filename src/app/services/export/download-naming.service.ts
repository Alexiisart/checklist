import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExportImportService } from '../export-import.service';
import { TxtExportService } from './txt-export.service';
import { ToastService } from '../toast.service';
import {
  ModalData,
  SavedList,
  ChecklistData,
} from '../../models/task.interface';

export interface DownloadContext {
  type: 'exportAll' | 'exportSelected' | 'exportTXT' | 'exportTask';
  data?: {
    savedLists?: SavedList[];
    selectedIds?: string[];
    checklistData?: ChecklistData;
    taskId?: number;
  };
}

/**
 * Servicio para manejar la funcionalidad de nombrar descargas personalizadas
 */
@Injectable({
  providedIn: 'root',
})
export class DownloadNamingService {
  // Estado del modal
  private showModalSubject = new BehaviorSubject<boolean>(false);
  private modalDataSubject = new BehaviorSubject<ModalData | null>(null);

  // Contexto de descarga actual
  private currentContext: DownloadContext | null = null;

  constructor(
    private exportImportService: ExportImportService,
    private txtExportService: TxtExportService,
    private toastService: ToastService
  ) {}

  // Observables públicos
  get showModal$(): Observable<boolean> {
    return this.showModalSubject.asObservable();
  }

  get modalData$(): Observable<ModalData | null> {
    return this.modalDataSubject.asObservable();
  }

  /**
   * Inicia el proceso de exportar todas las listas con nombre personalizado
   */
  exportAllListsWithCustomName(savedLists: SavedList[]): void {
    if (savedLists.length === 0) {
      this.toastService.showAlert('No hay listas para exportar', 'warning');
      return;
    }

    this.currentContext = {
      type: 'exportAll',
      data: { savedLists },
    };

    this.showNamingModal({
      title: 'Nombrar archivo de exportación',
      label: 'Nombre del archivo:',
      placeholder: 'Ej: respaldo-listas-importantes',
      isTextarea: false,
      currentValue: 'todas-las-listas',
      confirmButtonText: 'Descargar',
    });
  }

  /**
   * Inicia el proceso de exportar listas seleccionadas con nombre personalizado
   */
  exportSelectedListsWithCustomName(selectedIds: string[]): void {
    if (selectedIds.length === 0) {
      this.toastService.showAlert('Selecciona al menos una lista', 'warning');
      return;
    }

    this.currentContext = {
      type: 'exportSelected',
      data: { selectedIds },
    };

    this.showNamingModal({
      title: 'Nombrar archivo de exportación',
      label: 'Nombre del archivo:',
      placeholder: 'Ej: listas-importantes',
      isTextarea: false,
      currentValue: 'listas-seleccionadas',
      confirmButtonText: 'Descargar',
    });
  }

  /**
   * Inicia el proceso de exportar una lista completa a TXT con nombre personalizado
   */
  exportListToTXTWithCustomName(checklistData: ChecklistData): void {
    if (!checklistData) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    this.currentContext = {
      type: 'exportTXT',
      data: { checklistData },
    };

    const defaultName = (checklistData.name || 'Lista')
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim();

    this.showNamingModal({
      title: 'Nombrar archivo TXT',
      label: 'Nombre del archivo:',
      placeholder: 'Ej: mi-lista-tareas',
      isTextarea: false,
      currentValue: defaultName,
      confirmButtonText: 'Descargar',
    });
  }

  /**
   * Inicia el proceso de exportar una tarea específica a TXT con nombre personalizado
   */
  exportTaskToTXTWithCustomName(
    checklistData: ChecklistData,
    taskId: number
  ): void {
    if (!checklistData) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    const task = checklistData.tasks.find((t) => t.id === taskId);
    if (!task) {
      this.toastService.showAlert('Tarea no encontrada', 'danger');
      return;
    }

    this.currentContext = {
      type: 'exportTask',
      data: { checklistData, taskId },
    };

    const defaultName =
      task.name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'Tarea';

    this.showNamingModal({
      title: 'Nombrar archivo de tarea',
      label: 'Nombre del archivo:',
      placeholder: 'Ej: mi-tarea-importante',
      isTextarea: false,
      currentValue: defaultName,
      confirmButtonText: 'Descargar',
    });
  }

  /**
   * Maneja la confirmación del nombre ingresado por el usuario
   */
  onNameConfirmed(fileName: string): void {
    if (!this.currentContext || !fileName.trim()) {
      this.closeModal();
      return;
    }

    const cleanFileName = fileName.trim();

    try {
      switch (this.currentContext.type) {
        case 'exportAll':
          this.executeExportAllLists(cleanFileName);
          break;
        case 'exportSelected':
          this.executeExportSelectedLists(cleanFileName);
          break;
        case 'exportTXT':
          this.executeExportListToTXT(cleanFileName);
          break;
        case 'exportTask':
          this.executeExportTaskToTXT(cleanFileName);
          break;
      }
    } catch (error) {
      console.error('Error during download execution:', error);
      this.toastService.showAlert('Error al procesar la descarga', 'danger');
    } finally {
      this.closeModal();
    }
  }

  /**
   * Maneja la cancelación del modal
   */
  onModalCancelled(): void {
    this.closeModal();
  }

  /**
   * Muestra el modal de nombrado
   */
  private showNamingModal(modalData: ModalData): void {
    this.modalDataSubject.next(modalData);
    this.showModalSubject.next(true);
  }

  /**
   * Cierra el modal y limpia el contexto
   */
  private closeModal(): void {
    this.showModalSubject.next(false);
    this.modalDataSubject.next(null);
    this.currentContext = null;
  }

  /**
   * Ejecuta la exportación de todas las listas
   */
  private executeExportAllLists(fileName: string): void {
    const savedLists = this.currentContext?.data?.savedLists;
    if (!savedLists) return;

    const jsonData = this.exportImportService.exportAllLists();
    this.exportImportService.downloadJsonFileWithCustomName(jsonData, fileName);
    this.toastService.showAlert(
      `${savedLists.length} listas exportadas con nombre "${fileName}"`,
      'success'
    );
  }

  /**
   * Ejecuta la exportación de listas seleccionadas
   */
  private executeExportSelectedLists(fileName: string): void {
    const selectedIds = this.currentContext?.data?.selectedIds;
    if (!selectedIds) return;

    const jsonData = this.exportImportService.exportSelectedLists(selectedIds);
    this.exportImportService.downloadJsonFileWithCustomName(jsonData, fileName);
    this.toastService.showAlert(
      `${selectedIds.length} listas exportadas con nombre "${fileName}"`,
      'success'
    );
  }

  /**
   * Ejecuta la exportación de lista a TXT
   */
  private executeExportListToTXT(fileName: string): void {
    const checklistData = this.currentContext?.data?.checklistData;
    if (!checklistData) return;

    this.txtExportService.exportToTXTWithCustomName(checklistData, fileName);
    this.toastService.showAlert(
      `Lista exportada a TXT con nombre "${fileName}"`,
      'success'
    );
  }

  /**
   * Ejecuta la exportación de tarea a TXT
   */
  private executeExportTaskToTXT(fileName: string): void {
    const { checklistData, taskId } = this.currentContext?.data || {};
    if (!checklistData || taskId === undefined) return;

    this.txtExportService.exportSingleTaskToTXTWithCustomName(
      checklistData,
      taskId,
      fileName
    );
    this.toastService.showAlert(
      `Tarea exportada a TXT con nombre "${fileName}"`,
      'success'
    );
  }
}
