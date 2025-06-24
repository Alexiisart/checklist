import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ExportImportService } from '../../../services/export-import.service';
import { ExportImportStateService } from './export-import-state.service';
import { ToastService } from '../../../services/toast.service';
import { SavedList } from '../../../models/task.interface';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../atomic/buttons';
import { CheckboxComponent } from '../../atomic/checkboxes';

/**
 * Componente dropdown para opciones de exportar/importar listas
 */
@Component({
  selector: 'app-export-import-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent,
    ButtonComponent,
    CheckboxComponent,
  ],
  templateUrl: './export-import-dropdown.component.html',
  styleUrls: ['./export-import-dropdown.component.css'],
})
export class ExportImportDropdownComponent implements OnDestroy {
  /** Listas guardadas disponibles */
  @Input() savedLists: SavedList[] = [];

  /** Evento emitido cuando se actualiza la lista */
  @Output() listsUpdated = new EventEmitter<void>();

  /** Subject para manejar la destrucción del componente */
  private destroy$ = new Subject<void>();

  constructor(
    private exportImportService: ExportImportService,
    public stateService: ExportImportStateService,
    private toastService: ToastService,
    private elementRef: ElementRef
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Maneja clics fuera del componente para cerrar dropdown */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.stateService.closeDropdown();
    }
  }

  /** Previene el cierre del modal al hacer clic en el overlay */
  onModalOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      event.stopPropagation();
    }
  }

  /** Alterna la visibilidad del dropdown */
  toggleDropdown(): void {
    this.stateService.toggleDropdown();
  }

  /** Exporta todas las listas */
  async exportAll(): Promise<void> {
    try {
      if (this.savedLists.length === 0) {
        this.toastService.showAlert('No hay listas para exportar', 'warning');
        return;
      }

      const jsonData = this.exportImportService.exportAllLists();
      const filename = `todas-las-listas-${
        new Date().toISOString().split('T')[0]
      }.json`;

      this.exportImportService.downloadJsonFile(jsonData, filename);
      this.toastService.showAlert(
        `${this.savedLists.length} listas exportadas correctamente`,
        'success'
      );
      this.stateService.closeDropdown();
    } catch (error) {
      console.error('Error exporting all lists:', error);
      this.toastService.showAlert('Error al exportar las listas', 'danger');
    }
  }

  /** Activa el modo de selección de listas para exportar */
  toggleSelectionMode(): void {
    if (this.savedLists.length === 0) {
      this.toastService.showAlert('No hay listas para exportar', 'warning');
      return;
    }
    this.stateService.toggleSelectionMode();
  }

  /** Exporta las listas seleccionadas */
  async exportSelected(): Promise<void> {
    try {
      const selectedCount = this.stateService.getSelectedExportListsCount();
      if (selectedCount === 0) {
        this.toastService.showAlert('Selecciona al menos una lista', 'warning');
        return;
      }

      const selectedIds = Array.from(
        this.stateService.getStateSnapshot().selectedExportLists
      );
      const jsonData =
        this.exportImportService.exportSelectedLists(selectedIds);
      const filename = `listas-seleccionadas-${
        new Date().toISOString().split('T')[0]
      }.json`;

      this.exportImportService.downloadJsonFile(jsonData, filename);
      this.toastService.showAlert(
        `${selectedIds.length} listas exportadas correctamente`,
        'success'
      );
      this.stateService.closeDropdown();
    } catch (error) {
      console.error('Error exporting selected lists:', error);
      this.toastService.showAlert(
        'Error al exportar las listas seleccionadas',
        'danger'
      );
    }
  }

  /** Abre el selector de archivos */
  triggerFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  /** Maneja la selección de archivo para importar */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      await this.stateService.processImportFile(file);
    } finally {
      input.value = '';
      this.stateService.closeDropdown();
    }
  }

  /** Selecciona todas las listas para exportar */
  selectAllExport(): void {
    this.stateService.selectAllExportLists(this.savedLists);
  }

  /** Deselecciona todas las listas para exportar */
  selectNoneExport(): void {
    this.stateService.selectNoneExportLists();
  }

  /** Alterna la selección de una lista específica para exportar */
  toggleExportListSelection(listId: string): void {
    this.stateService.toggleExportList(listId);
  }

  /** Cancela el modo de selección de exportar */
  cancelExportSelection(): void {
    this.stateService.cancelExportSelection();
  }

  /** Alterna la selección de una lista para importar */
  toggleListForImport(
    listId: string,
    listSize: number,
    checked: boolean
  ): void {
    const success = this.stateService.toggleListForImport(listId, listSize);

    // Si no pudo cambiar el estado (por ejemplo, por límites de espacio),
    // el checkbox mantendrá su estado anterior automáticamente
    if (!success) {
      this.toastService.showAlert(
        'No hay suficiente espacio disponible',
        'warning'
      );
    }
  }

  /** Confirma la selección manual de listas para importar */
  confirmManualSelection(): void {
    this.stateService.confirmManualSelection();
  }

  /** Cancela la selección manual de listas */
  cancelManualSelection(): void {
    this.stateService.cancelManualSelection();
  }

  /** Verifica si se pueden importar todas las listas */
  canImportAllLists(): boolean {
    const preview = this.stateService.getImportPreview();
    return preview ? preview.canImportAll : false;
  }

  /** Selecciona todas las listas para importar */
  selectAllImport(): void {
    this.stateService.selectAllImportLists();
  }

  /** Deselecciona todas las listas para importar */
  selectNoneImport(): void {
    this.stateService.selectNoneImportLists();
  }

  /** Maneja la confirmación de la importación */
  onConfirmImport(): void {
    this.executeImport();
  }

  /** Maneja la cancelación de la importación */
  onCancelImport(): void {
    this.stateService.closeConfirmation();
    this.stateService.cancelManualSelection();
  }

  /** Ejecuta la importación de listas */
  private async executeImport(): Promise<void> {
    try {
      const result = await this.stateService.executeImport();

      if (result.success) {
        this.handleImportSuccess(result);
        this.listsUpdated.emit();
      } else {
        this.toastService.showAlert(
          `❌ Error en la importación: ${result.errors.join(', ')}`,
          'danger',
          8000
        );
      }
    } catch (error) {
      console.error('Error importing lists:', error);
      this.toastService.showAlert('❌ Error al importar las listas', 'danger');
    } finally {
      this.stateService.closeConfirmation();
      this.stateService.cleanupAfterImport();
    }
  }

  /** Maneja el éxito de la importación con mensajes específicos */
  private handleImportSuccess(result: any): void {
    const selectedCount = this.stateService.getSelectedImportListsCount();

    if (selectedCount > 0) {
      this.toastService.showAlert(
        `✅ Importación manual exitosa: ${result.imported} listas seleccionadas importadas`,
        'success',
        5000
      );
    } else if (result.partialImport) {
      const totalLists = result.imported + (result.skippedDueToSpace || 0);
      this.toastService.showAlert(
        `✅ Espacio maximizado: Se importaron ${result.imported} de ${totalLists} listas. ` +
          `${
            result.skippedDueToSpace || 0
          } listas omitidas por ser demasiado grandes.`,
        'warning',
        7000
      );
    } else {
      this.toastService.showAlert(
        `✅ Importación exitosa: ${result.imported} listas importadas`,
        'success'
      );
    }
  }

  /** Obtiene el tamaño actual de las listas seleccionadas */
  getCurrentSelectedSize(): number {
    return this.stateService.getStateSnapshot().listSelection.selectedListsSize;
  }

  /** Calcula el porcentaje de uso del espacio total máximo */
  getSpaceUsagePercentage(): number {
    const preview = this.stateService.getImportPreview();
    if (!preview) return 0;

    const maxSize = 3.5 * 1024 * 1024; // 3.5 MB = nuestro límite artificial
    const currentUsed = maxSize - preview.availableSpace; // Espacio ya usado por nuestra app
    const selectedSize = this.getCurrentSelectedSize(); // Espacio de listas seleccionadas
    const totalUsed = currentUsed + selectedSize; // Espacio total que se usará

    return Math.min((totalUsed / maxSize) * 100, 100);
  }

  /** Formatea una fecha para mostrar */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  /** Formatea bytes en texto legible */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
