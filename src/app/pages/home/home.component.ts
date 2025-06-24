import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import {
  SavedList,
  ConfirmData,
  AlertData,
  ModalData,
} from '../../models/task.interface';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ExportImportDropdownComponent } from '../../shared/components/export-import-dropdown/export-import-dropdown.component';

/**
 * Componente principal que muestra la pantalla de inicio con las listas guardadas
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent,
    AlertModalComponent,
    ModalComponent,
    ExportImportDropdownComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  /** Lista de listas guardadas */
  savedLists: SavedList[] = [];
  /** Porcentaje de almacenamiento usado */
  storagePercentage = 0;

  /** Controla la visibilidad del modal de confirmación */
  showConfirmModal = false;
  /** Datos para el modal de confirmación */
  confirmModalData: ConfirmData | null = null;
  /** Lista que se eliminará tras confirmación */
  listToDelete: SavedList | null = null;

  /** Controla la visibilidad del modal de alerta */
  showAlertModal = false;
  /** Datos para el modal de alerta */
  alertModalData: AlertData | null = null;

  /** Controla la visibilidad del modal de renombrar */
  showRenameModal = false;
  /** Datos para el modal de renombrar */
  renameModalData: ModalData | null = null;
  /** Lista que se renombrará */
  listToRename: SavedList | null = null;

  /** Modo de selección masiva activado */
  isSelectionMode = false;
  /** IDs de listas seleccionadas para eliminación masiva */
  selectedListIds = new Set<string>();

  constructor(
    private router: Router,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  /**
   * Inicializa el componente cargando las listas guardadas y el indicador de almacenamiento
   */
  ngOnInit(): void {
    this.loadSavedLists();
    this.updateStorageIndicator();
  }

  /**
   * Carga las listas guardadas desde el servicio de almacenamiento
   */
  loadSavedLists(): void {
    this.savedLists = this.storageService.getSavedLists();
  }

  /**
   * Actualiza el indicador de porcentaje de almacenamiento usado
   */
  updateStorageIndicator(): void {
    this.storagePercentage = this.storageService.getStoragePercentage();
  }

  /**
   * Navega a la pantalla de creación de nueva lista (como goToNewList del original)
   */
  async goToNewList(): Promise<void> {
    // TODO: Verificar si hay cambios sin guardar cuando implementemos el estado global
    // Por ahora navegar directamente
    this.router.navigate(['/new-list']);
  }

  /**
   * Carga una lista específica para su edición
   * @param listId ID de la lista a cargar
   */
  loadList(listId: string): void {
    const list = this.savedLists.find((l) => l.id === listId);
    if (list) {
      this.toastService.showAlert(`Lista "${list.name}" cargada`, 'success');
    }
    this.router.navigate(['/checklist', listId]);
  }

  /**
   * Muestra el modal de confirmación para eliminar una lista
   * @param list Lista que se desea eliminar
   */
  confirmDeleteList(list: SavedList): void {
    this.listToDelete = list;
    this.confirmModalData = {
      title: 'Eliminar lista',
      message: `¿Estás seguro de que quieres eliminar la lista "${
        list.name || 'Sin nombre'
      }"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };
    this.showConfirmModal = true;
  }

  /**
   * Elimina la lista confirmada y muestra una alerta con el resultado
   */
  deleteConfirmedList(): void {
    if (this.selectedListIds.size > 0) {
      // Eliminación masiva
      this.deleteSelectedLists();
    } else if (this.listToDelete) {
      // Eliminación individual
      try {
        this.storageService.deleteList(this.listToDelete.id);
        this.loadSavedLists();
        this.updateStorageIndicator();

        this.toastService.showAlert('Lista eliminada', 'info');
      } catch (error) {
        this.alertModalData = {
          message: 'Error al eliminar la lista',
          type: 'danger',
        };
        this.showAlertModal = true;
      }
    }

    // Cerrar el modal de confirmación y limpiar datos
    this.showConfirmModal = false;
    this.confirmModalData = null;
    this.listToDelete = null;
  }

  /**
   * Cancela la eliminación de la lista
   */
  cancelDelete(): void {
    this.showConfirmModal = false;
    this.confirmModalData = null;
    this.listToDelete = null;
  }

  /**
   * Cierra el modal de alerta
   */
  closeAlert(): void {
    this.showAlertModal = false;
  }

  /**
   * Formatea una fecha en string al formato local español
   * @param dateString Fecha en formato string
   * @returns Fecha formateada
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Calcula el porcentaje de progreso de una lista
   * @param list Lista para calcular el progreso
   * @returns Porcentaje de tareas completadas
   */
  getProgressPercentage(list: SavedList): number {
    return list.tasksCount > 0
      ? (list.completedCount / list.tasksCount) * 100
      : 0;
  }

  /**
   * Muestra el modal para renombrar una lista
   * @param list Lista que se desea renombrar
   */
  openRenameModal(list: SavedList): void {
    this.listToRename = list;
    this.renameModalData = {
      title: 'Renombrar Lista',
      label: 'Nuevo nombre de la lista:',
      placeholder: 'Nombre de la lista...',
      currentValue: list.name || '',
    };
    this.showRenameModal = true;
  }

  /**
   * Renombra la lista con el nuevo nombre proporcionado
   * @param newName Nuevo nombre para la lista
   */
  renameList(newName: string): void {
    if (!this.listToRename || !newName.trim()) {
      this.closeRenameModal();
      return;
    }

    try {
      this.storageService.renameList(this.listToRename.id, newName.trim());
      this.toastService.showAlert(`Lista renombrada a "${newName}"`, 'success');
      this.loadSavedLists(); // Recargar las listas para reflejar el cambio
      this.closeRenameModal();
    } catch (error) {
      console.error('Error renaming list:', error);
      this.toastService.showAlert('Error al renombrar la lista', 'danger');
    }
  }

  /**
   * Cierra el modal de renombrar y limpia los datos relacionados
   */
  closeRenameModal(): void {
    this.showRenameModal = false;
    this.renameModalData = null;
    this.listToRename = null;
  }

  /**
   * Maneja la actualización de listas después de importar
   */
  onListsUpdated(): void {
    this.loadSavedLists();
    this.updateStorageIndicator();
  }

  /**
   * Activa o desactiva el modo de selección masiva
   */
  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedListIds.clear();
    }
  }

  /**
   * Selecciona o deselecciona una lista
   */
  toggleListSelection(listId: string): void {
    if (this.selectedListIds.has(listId)) {
      this.selectedListIds.delete(listId);
    } else {
      this.selectedListIds.add(listId);
    }
  }

  /**
   * Verifica si una lista está seleccionada
   */
  isListSelected(listId: string): boolean {
    return this.selectedListIds.has(listId);
  }

  /**
   * Selecciona todas las listas
   */
  selectAllLists(): void {
    this.selectedListIds.clear();
    this.savedLists.forEach((list) => this.selectedListIds.add(list.id));
  }

  /**
   * Deselecciona todas las listas
   */
  deselectAllLists(): void {
    this.selectedListIds.clear();
  }

  /**
   * Obtiene el número de listas seleccionadas
   */
  getSelectedCount(): number {
    return this.selectedListIds.size;
  }

  /**
   * Confirma la eliminación masiva de listas seleccionadas
   */
  confirmDeleteSelected(): void {
    if (this.selectedListIds.size === 0) {
      this.toastService.showAlert(
        'Selecciona al menos una lista para eliminar',
        'warning'
      );
      return;
    }

    this.confirmModalData = {
      title: 'Eliminar Listas Seleccionadas',
      message: `¿Estás seguro de que deseas eliminar ${
        this.selectedListIds.size
      } lista${
        this.selectedListIds.size > 1 ? 's' : ''
      }? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };
    this.showConfirmModal = true;
  }

  /**
   * Ejecuta la eliminación masiva después de confirmación
   */
  private deleteSelectedLists(): void {
    try {
      const deletedCount = this.selectedListIds.size;
      const selectedIds = Array.from(this.selectedListIds);

      selectedIds.forEach((listId) => {
        this.storageService.deleteList(listId);
      });

      this.loadSavedLists();
      this.updateStorageIndicator();
      this.selectedListIds.clear();
      this.isSelectionMode = false;

      this.toastService.showAlert(
        `${deletedCount} lista${
          deletedCount > 1 ? 's eliminadas' : ' eliminada'
        } correctamente`,
        'success'
      );
    } catch (error) {
      console.error('Error eliminando listas:', error);
      this.toastService.showAlert('Error al eliminar las listas', 'danger');
    }
  }
}
