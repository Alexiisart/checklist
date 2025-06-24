import { Injectable } from '@angular/core';
import { PdfExportService } from '../../export/pdf-export.service';
import { TxtExportService } from '../../export/txt-export.service';
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
   * Exporta la lista actual a TXT
   */
  exportToTXT(currentList: ChecklistData): void {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    try {
      this.txtExportService.exportToTXT(currentList);
      this.toastService.showAlert(
        'Archivo TXT descargado exitosamente',
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
   * Exporta una tarea específica con sus subtareas a TXT
   */
  exportSingleTaskToTXT(currentList: ChecklistData, taskId: number): void {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para exportar', 'warning');
      return;
    }

    try {
      this.txtExportService.exportSingleTaskToTXT(currentList, taskId);
      this.toastService.showAlert(
        'Tarea exportada a TXT exitosamente',
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
