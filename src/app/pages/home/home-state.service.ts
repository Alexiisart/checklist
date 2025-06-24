import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import {
  SavedList,
  ConfirmData,
  AlertData,
  ModalData,
} from '../../models/task.interface';

// Interface para el estado de los modales
interface ModalState {
  showConfirmModal: boolean;
  confirmModalData: ConfirmData | null;
  showAlertModal: boolean;
  alertModalData: AlertData | null;
  showRenameModal: boolean;
  renameModalData: ModalData | null;
}

// Interface para el estado de selección
interface SelectionState {
  isSelectionMode: boolean;
  selectedListIds: Set<string>;
}

// Interface para el estado de búsqueda
interface SearchState {
  searchTerm: string;
}

// Servicio que maneja todo el estado y lógica de negocios del componente Home
@Injectable({
  providedIn: 'root',
})
export class HomeStateService {
  // Estados privados
  private readonly _savedLists$ = new BehaviorSubject<SavedList[]>([]);
  private readonly _storagePercentage$ = new BehaviorSubject<number>(0);
  private readonly _modalState$ = new BehaviorSubject<ModalState>({
    showConfirmModal: false,
    confirmModalData: null,
    showAlertModal: false,
    alertModalData: null,
    showRenameModal: false,
    renameModalData: null,
  });
  private readonly _selectionState$ = new BehaviorSubject<SelectionState>({
    isSelectionMode: false,
    selectedListIds: new Set<string>(),
  });
  private readonly _searchState$ = new BehaviorSubject<SearchState>({
    searchTerm: '',
  });

  // Referencias temporales para operaciones
  private listToDelete: SavedList | null = null;
  private listToRename: SavedList | null = null;

  // Observables públicos
  public readonly savedLists$: Observable<SavedList[]> =
    this._savedLists$.asObservable();
  public readonly storagePercentage$: Observable<number> =
    this._storagePercentage$.asObservable();
  public readonly modalState$: Observable<ModalState> =
    this._modalState$.asObservable();
  public readonly selectionState$: Observable<SelectionState> =
    this._selectionState$.asObservable();
  public readonly searchState$: Observable<SearchState> =
    this._searchState$.asObservable();

  // Observable derivado para listas filtradas
  public readonly filteredLists$: Observable<SavedList[]> = combineLatest([
    this.savedLists$,
    this.searchState$,
  ]).pipe(
    map(([lists, searchState]) =>
      this.filterLists(lists, searchState.searchTerm)
    )
  );

  // Observable derivado para el conteo de seleccionados
  public readonly selectedCount$: Observable<number> =
    this.selectionState$.pipe(map((state) => state.selectedListIds.size));

  constructor(
    private router: Router,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  // ========== MÉTODOS DE INICIALIZACIÓN ==========

  // Inicializa el estado cargando las listas y actualizando el indicador de almacenamiento
  initialize(): void {
    this.loadSavedLists();
    this.updateStorageIndicator();
  }

  // ========== GESTIÓN DE LISTAS ==========

  // Carga las listas guardadas desde el servicio de almacenamiento
  loadSavedLists(): void {
    const savedLists = this.storageService.getSavedLists();
    this._savedLists$.next(savedLists);
  }

  // Actualiza el indicador de porcentaje de almacenamiento usado
  updateStorageIndicator(): void {
    const percentage = this.storageService.getStoragePercentage();
    this._storagePercentage$.next(percentage);
  }

  // Navega a la pantalla de creación de nueva lista
  async goToNewList(): Promise<void> {
    // TODO: Verificar si hay cambios sin guardar cuando implementemos el estado global
    // Por ahora navegar directamente
    this.router.navigate(['/new-list']);
  }

  // Carga una lista específica para su edición
  loadList(listId: string): void {
    const list = this._savedLists$.value.find((l) => l.id === listId);
    if (list) {
      this.toastService.showAlert(`Lista "${list.name}" cargada`, 'success');
    }
    this.router.navigate(['/checklist', listId]);
  }

  // Maneja la actualización de listas después de importar
  onListsUpdated(): void {
    this.loadSavedLists();
    this.updateStorageIndicator();
  }

  // ========== OPERACIONES DE ELIMINACIÓN ==========

  // Muestra el modal de confirmación para eliminar una lista
  confirmDeleteList(list: SavedList): void {
    this.listToDelete = list;
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showConfirmModal: true,
      confirmModalData: {
        title: 'Eliminar lista',
        message: `¿Estás seguro de que quieres eliminar la lista "${
          list.name || 'Sin nombre'
        }"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });
  }

  // Confirma la eliminación masiva de listas seleccionadas
  confirmDeleteSelected(): void {
    const selectionState = this._selectionState$.value;
    if (selectionState.selectedListIds.size === 0) {
      this.toastService.showAlert(
        'Selecciona al menos una lista para eliminar',
        'warning'
      );
      return;
    }

    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showConfirmModal: true,
      confirmModalData: {
        title: 'Eliminar Listas Seleccionadas',
        message: `¿Estás seguro de que deseas eliminar ${
          selectionState.selectedListIds.size
        } lista${
          selectionState.selectedListIds.size > 1 ? 's' : ''
        }? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      },
    });
  }

  // Elimina la lista confirmada y muestra una alerta con el resultado
  deleteConfirmedList(): void {
    const selectionState = this._selectionState$.value;

    if (selectionState.selectedListIds.size > 0) {
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
        this.showAlert('Error al eliminar la lista', 'danger');
      }
    }

    // Cerrar el modal de confirmación y limpiar datos
    this.closeConfirmModal();
  }

  // Ejecuta la eliminación masiva después de confirmación
  private deleteSelectedLists(): void {
    try {
      const selectionState = this._selectionState$.value;
      const deletedCount = selectionState.selectedListIds.size;
      const selectedIds = Array.from(selectionState.selectedListIds);

      selectedIds.forEach((listId) => {
        this.storageService.deleteList(listId);
      });

      this.loadSavedLists();
      this.updateStorageIndicator();
      this.clearSelection();

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

  // ========== OPERACIONES DE RENOMBRADO ==========

  // Muestra el modal para renombrar una lista
  openRenameModal(list: SavedList): void {
    this.listToRename = list;
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showRenameModal: true,
      renameModalData: {
        title: 'Renombrar Lista',
        label: 'Nuevo nombre de la lista:',
        placeholder: 'Nombre de la lista...',
        currentValue: list.name || '',
      },
    });
  }

  // Renombra la lista con el nuevo nombre proporcionado
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

  // ========== GESTIÓN DE MODALES ==========

  // Cancela la eliminación de la lista
  cancelDelete(): void {
    this.closeConfirmModal();
  }

  // Cierra el modal de confirmación y limpia los datos relacionados
  private closeConfirmModal(): void {
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showConfirmModal: false,
      confirmModalData: null,
    });
    this.listToDelete = null;
  }

  // Cierra el modal de alerta
  closeAlert(): void {
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showAlertModal: false,
      alertModalData: null,
    });
  }

  // Muestra un modal de alerta
  private showAlert(
    message: string,
    type: 'success' | 'danger' | 'warning' | 'info'
  ): void {
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showAlertModal: true,
      alertModalData: {
        message,
        type,
      },
    });
  }

  // Cierra el modal de renombrar y limpia los datos relacionados
  closeRenameModal(): void {
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showRenameModal: false,
      renameModalData: null,
    });
    this.listToRename = null;
  }

  // ========== GESTIÓN DE SELECCIÓN MASIVA ==========

  // Activa o desactiva el modo de selección masiva
  toggleSelectionMode(): void {
    const currentState = this._selectionState$.value;
    const newSelectionMode = !currentState.isSelectionMode;

    this._selectionState$.next({
      isSelectionMode: newSelectionMode,
      selectedListIds: newSelectionMode
        ? currentState.selectedListIds
        : new Set<string>(),
    });
  }

  // Selecciona o deselecciona una lista
  toggleListSelection(listId: string): void {
    const currentState = this._selectionState$.value;
    const newSelectedIds = new Set(currentState.selectedListIds);

    if (newSelectedIds.has(listId)) {
      newSelectedIds.delete(listId);
    } else {
      newSelectedIds.add(listId);
    }

    this._selectionState$.next({
      ...currentState,
      selectedListIds: newSelectedIds,
    });
  }

  // Verifica si una lista está seleccionada
  isListSelected(listId: string): boolean {
    return this._selectionState$.value.selectedListIds.has(listId);
  }

  // Selecciona todas las listas
  selectAllLists(): void {
    const currentState = this._selectionState$.value;
    const allListIds = new Set(this._savedLists$.value.map((list) => list.id));

    this._selectionState$.next({
      ...currentState,
      selectedListIds: allListIds,
    });
  }

  // Deselecciona todas las listas
  deselectAllLists(): void {
    const currentState = this._selectionState$.value;
    this._selectionState$.next({
      ...currentState,
      selectedListIds: new Set<string>(),
    });
  }

  // Limpia la selección y desactiva el modo de selección
  private clearSelection(): void {
    this._selectionState$.next({
      isSelectionMode: false,
      selectedListIds: new Set<string>(),
    });
  }

  // ========== FUNCIONALIDADES DE BÚSQUEDA ==========

  // Actualiza el término de búsqueda
  updateSearchTerm(searchTerm: string): void {
    this._searchState$.next({ searchTerm });
  }

  // Limpia el término de búsqueda
  clearSearch(): void {
    this._searchState$.next({ searchTerm: '' });
  }

  // Filtra las listas basado en el término de búsqueda
  private filterLists(lists: SavedList[], searchTerm: string): SavedList[] {
    if (!searchTerm.trim()) {
      return [...lists];
    }

    const searchTermLower = searchTerm.toLowerCase();
    return lists.filter(
      (list) =>
        (list.name || 'Lista sin nombre')
          .toLowerCase()
          .includes(searchTermLower) ||
        (list.preview || '').toLowerCase().includes(searchTermLower)
    );
  }

  // ========== MÉTODOS UTILITARIOS ==========

  // Formatea una fecha en string al formato local español
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

  // Calcula el porcentaje de progreso de una lista
  getProgressPercentage(list: SavedList): number {
    return list.tasksCount > 0
      ? (list.completedCount / list.tasksCount) * 100
      : 0;
  }

  // ========== GETTERS PARA VALORES ACTUALES ==========

  // Obtiene el valor actual de las listas guardadas
  getCurrentSavedLists(): SavedList[] {
    return this._savedLists$.value;
  }

  // Obtiene el valor actual del estado de selección
  getCurrentSelectionState(): SelectionState {
    return this._selectionState$.value;
  }

  // Obtiene el valor actual del estado de modales
  getCurrentModalState(): ModalState {
    return this._modalState$.value;
  }

  // Obtiene el valor actual del término de búsqueda
  getCurrentSearchTerm(): string {
    return this._searchState$.value.searchTerm;
  }
}
