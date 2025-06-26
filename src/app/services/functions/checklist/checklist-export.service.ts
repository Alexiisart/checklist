import { Injectable } from '@angular/core';
import { PdfExportService } from '../../export/pdf-export.service';
import { TxtExportService } from '../../export/txt-export.service';
import { DownloadNamingService } from '../../export/download-naming.service';
import { ToastService } from '../../toast.service';
import { ChecklistData } from '../../../models/task.interface';

/**
 * Servicio para manejar las funciones relacionadas con exportación del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistExportService {
  constructor(
    private pdfExportService: PdfExportService,
    private txtExportService: TxtExportService,
    private downloadNamingService: DownloadNamingService,
    private toastService: ToastService
  ) {}

  /**
   * Exporta la lista actual a PDF
   */
  exportToPDF(currentList: ChecklistData): void {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    this.toastService.showAlert(
      'Presiona Ctrl+P para exportar como PDF',
      'info',
      4000
    );

    setTimeout(() => {
      this.pdfExportService.exportToPDF(currentList);
    }, 500);
  }

  /**
   * Exporta la lista actual a TXT con modal de nombrado
   */
  exportToTXT(currentList: ChecklistData): void {
    this.downloadNamingService.exportListToTXTWithCustomName(currentList);
  }

  /**
   * Exporta una tarea específica con sus subtareas a TXT con modal de nombrado
   */
  exportSingleTaskToTXT(currentList: ChecklistData, taskId: number): void {
    this.downloadNamingService.exportTaskToTXTWithCustomName(
      currentList,
      taskId
    );
  }

  /**
   * Exporta la lista actual a TXT con nombre personalizado
   */
  exportToTXTWithCustomName(
    currentList: ChecklistData,
    customName: string
  ): void {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    try {
      this.txtExportService.exportToTXTWithCustomName(currentList, customName);
      this.toastService.showAlert(
        `Archivo TXT descargado como "${customName}"`,
        'success',
        3000
      );
    } catch (error) {
      this.toastService.showAlert(
        'Error al exportar archivo TXT',
        'danger',
        4000
      );
    }
  }

  /**
   * Exporta una tarea específica con nombre personalizado
   */
  exportSingleTaskToTXTWithCustomName(
    currentList: ChecklistData,
    taskId: number,
    customName: string
  ): void {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    try {
      this.txtExportService.exportSingleTaskToTXTWithCustomName(
        currentList,
        taskId,
        customName
      );
      this.toastService.showAlert(
        `Tarea exportada como "${customName}"`,
        'success',
        3000
      );
    } catch (error) {
      this.toastService.showAlert(
        'Error al exportar tarea a TXT',
        'danger',
        4000
      );
    }
  }
}
