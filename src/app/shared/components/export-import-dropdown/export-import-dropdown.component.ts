import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportImportService } from '../../../services/export-import.service';
import { ToastService } from '../../../services/toast.service';
import { SavedList, ConfirmData } from '../../../models/task.interface';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

/**
 * Componente dropdown para opciones de exportar/importar listas
 */
@Component({
  selector: 'app-export-import-dropdown',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    <div class="dropdown-container">
      <button
        class="dropdown-toggle"
        (click)="toggleDropdown()"
        [class.active]="isOpen"
        title="Opciones de exportar/importar"
      >
        <span class="material-icons-outlined">import_export</span>
        <span class="dropdown-text">Exportar/Importar</span>
        <span
          class="material-icons-outlined dropdown-icon"
          [class.rotated]="isOpen"
          >expand_more</span
        >
      </button>

      @if (isOpen) {
      <div class="dropdown-menu" (click)="$event.stopPropagation()">
        <!-- Sección de Exportar -->
        <div class="dropdown-section">
          <div class="section-title">Exportar</div>

          <button class="dropdown-item" (click)="exportAll()">
            <span class="material-icons-outlined">download</span>
            <span>Exportar todas las listas</span>
          </button>

          <button class="dropdown-item" (click)="toggleSelectionMode()">
            <span class="material-icons-outlined">checklist</span>
            <span>Exportar listas seleccionadas</span>
          </button>
        </div>

        <div class="dropdown-divider"></div>

        <!-- Sección de Importar -->
        <div class="dropdown-section">
          <div class="section-title">Importar</div>

          <button class="dropdown-item" (click)="triggerFileInput()">
            <span class="material-icons-outlined">upload</span>
            <span>Importar listas desde archivo</span>
          </button>
        </div>

        <!-- Input de archivo oculto -->
        <input
          #fileInput
          type="file"
          accept=".json"
          style="display: none"
          (change)="onFileSelected($event)"
        />
      </div>
      }
    </div>

    <!-- Modal de selección múltiple -->
    @if (selectionMode) {
    <div class="modal" (click)="onModalOverlayClick($event)">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Seleccionar listas para exportar</h3>
          <button class="close-modal-btn" (click)="cancelSelection()">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="selection-actions">
            <button class="action-btn secondary" (click)="selectAll()">
              Seleccionar todas
            </button>
            <button class="action-btn secondary" (click)="selectNone()">
              Deseleccionar todas
            </button>
          </div>

          <div class="selection-list">
            @for (list of savedLists; track list.id) {
            <label class="selection-item">
              <input
                type="checkbox"
                [checked]="selectedLists.has(list.id)"
                (change)="toggleListSelection(list.id, $event)"
              />
              <span class="list-info">
                <span class="list-name">{{
                  list.name || 'Lista sin nombre'
                }}</span>
                <span class="list-details"
                  >{{ list.tasksCount }} tareas •
                  {{ formatDate(list.date) }}</span
                >
              </span>
            </label>
            }
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" (click)="cancelSelection()">
            Cancelar
          </button>
          <button
            class="primary-btn"
            (click)="exportSelected()"
            [disabled]="selectedLists.size === 0"
          >
            Exportar {{ selectedLists.size }} lista{{
              selectedLists.size !== 1 ? 's' : ''
            }}
          </button>
        </div>
      </div>
    </div>
    }

    <!-- Modal de confirmación para importar -->
    <app-confirm-modal
      [isVisible]="showConfirmModal"
      [data]="confirmModalData"
      (confirmed)="onConfirmImport()"
      (cancelled)="onCancelImport()"
    >
    </app-confirm-modal>
  `,
  styleUrls: ['./export-import-dropdown.component.css'],
})
export class ExportImportDropdownComponent {
  /** Listas guardadas disponibles */
  @Input() savedLists: SavedList[] = [];

  /** Evento emitido cuando se actualiza la lista */
  @Output() listsUpdated = new EventEmitter<void>();

  /** Controla si el dropdown está abierto */
  isOpen = false;

  /** Controla si está en modo de selección */
  selectionMode = false;

  /** Set de IDs de listas seleccionadas */
  selectedLists = new Set<string>();

  /** Controla la visibilidad del modal de confirmación */
  showConfirmModal = false;

  /** Datos para el modal de confirmación */
  confirmModalData: ConfirmData | null = null;

  /** Contenido del archivo pendiente de importar */
  private pendingImportContent: string | null = null;

  constructor(
    private exportImportService: ExportImportService,
    private toastService: ToastService,
    private elementRef: ElementRef
  ) {}

  /**
   * Maneja clics fuera del componente para cerrar el dropdown
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  /**
   * Maneja clics en el overlay del modal
   */
  onModalOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelSelection();
    }
  }

  /**
   * Alterna la visibilidad del dropdown
   */
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.selectionMode = false;
      this.selectedLists.clear();
    }
  }

  /**
   * Exporta todas las listas
   */
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
      this.closeDropdown();
    } catch (error) {
      console.error('Error exporting all lists:', error);
      this.toastService.showAlert('Error al exportar las listas', 'danger');
    }
  }

  /**
   * Activa el modo de selección de listas
   */
  toggleSelectionMode(): void {
    if (this.savedLists.length === 0) {
      this.toastService.showAlert('No hay listas para exportar', 'warning');
      return;
    }
    this.selectionMode = true;
  }

  /**
   * Exporta las listas seleccionadas
   */
  async exportSelected(): Promise<void> {
    try {
      if (this.selectedLists.size === 0) {
        this.toastService.showAlert('Selecciona al menos una lista', 'warning');
        return;
      }

      const selectedIds = Array.from(this.selectedLists);
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
      this.closeDropdown();
    } catch (error) {
      console.error('Error exporting selected lists:', error);
      this.toastService.showAlert(
        'Error al exportar las listas seleccionadas',
        'danger'
      );
    }
  }

  /**
   * Abre el selector de archivos
   */
  triggerFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Maneja la selección de archivo para importar
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      // Leer el archivo
      const fileContent = await this.exportImportService.readFileAsText(file);

      // Obtener estadísticas del archivo
      const stats = this.exportImportService.getImportStats(fileContent);
      if (!stats) {
        this.toastService.showAlert('Archivo inválido o corrupto', 'danger');
        return;
      }

      // Confirmar importación
      this.confirmModalData = {
        title: 'Confirmar Importación',
        message: `¿Importar ${stats.totalLists} listas con ${stats.totalTasks} tareas?\n\nEsto creará copias de las listas. Las listas existentes no se modificarán.`,
        confirmText: 'Importar',
        cancelText: 'Cancelar',
      };
      this.showConfirmModal = true;
      this.pendingImportContent = fileContent;
    } catch (error) {
      console.error('Error importing file:', error);
      this.toastService.showAlert('Error al procesar el archivo', 'danger');
    } finally {
      // Limpiar el input
      input.value = '';
      this.closeDropdown();
    }
  }

  /**
   * Selecciona todas las listas
   */
  selectAll(): void {
    this.selectedLists.clear();
    this.savedLists.forEach((list) => this.selectedLists.add(list.id));
  }

  /**
   * Deselecciona todas las listas
   */
  selectNone(): void {
    this.selectedLists.clear();
  }

  /**
   * Alterna la selección de una lista específica
   */
  toggleListSelection(listId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedLists.add(listId);
    } else {
      this.selectedLists.delete(listId);
    }
  }

  /**
   * Cancela el modo de selección
   */
  cancelSelection(): void {
    this.selectionMode = false;
    this.selectedLists.clear();
  }

  /**
   * Cierra el dropdown y resetea estados
   */
  private closeDropdown(): void {
    this.isOpen = false;
    this.selectionMode = false;
    this.selectedLists.clear();
  }

  /**
   * Formatea una fecha para mostrar
   */
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

  /**
   * Maneja la confirmación de la importación
   */
  onConfirmImport(): void {
    if (this.pendingImportContent) {
      this.importLists(this.pendingImportContent);
    }
  }

  /**
   * Maneja la cancelación de la importación
   */
  onCancelImport(): void {
    this.showConfirmModal = false;
    this.pendingImportContent = null;
  }

  /**
   * Importa las listas desde el contenido del archivo
   */
  private async importLists(fileContent: string): Promise<void> {
    try {
      // Importar con configuración por defecto (no sobrescribir, crear backup)
      const result = await this.exportImportService.importLists(fileContent, {
        overwriteExisting: false,
        createBackup: true,
      });

      if (result.success) {
        this.toastService.showAlert(
          `Importación exitosa: ${result.imported} listas importadas`,
          'success'
        );
        this.listsUpdated.emit(); // Notificar para actualizar la vista
      } else {
        this.toastService.showAlert(
          `Error en la importación: ${result.errors.join(', ')}`,
          'danger'
        );
      }
    } catch (error) {
      console.error('Error importing lists:', error);
      this.toastService.showAlert('Error al importar las listas', 'danger');
    } finally {
      this.showConfirmModal = false;
      this.pendingImportContent = null;
    }
  }
}
