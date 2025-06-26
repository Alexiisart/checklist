import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import { SavedList, AlertData } from '../../models/task.interface';

// Interface para el estado de selección
interface SelectionState {
  isSelectionMode: boolean;
  selectedListIds: Set<string>;
}

// Interface para el estado de búsqueda
interface SearchState {
  searchTerm: string;
}

// Interface para el estado de filtrado
interface FilterState {
  filterOption: 'all' | 'completed' | 'incomplete';
}

// Interface para el estado de alerta (solo para alertas del state service)
interface ModalState {
  showAlertModal: boolean;
  alertModalData: AlertData | null;
}

// Servicio que maneja el estado y lógica de negocios del componente Home
@Injectable({
  providedIn: 'root',
})
export class HomeStateService {
  // Estados privados
  private readonly _savedLists$ = new BehaviorSubject<SavedList[]>([]);
  private readonly _storagePercentage$ = new BehaviorSubject<number>(0);
  private readonly _modalState$ = new BehaviorSubject<ModalState>({
    showAlertModal: false,
    alertModalData: null,
  });
  private readonly _selectionState$ = new BehaviorSubject<SelectionState>({
    isSelectionMode: false,
    selectedListIds: new Set<string>(),
  });
  private readonly _searchState$ = new BehaviorSubject<SearchState>({
    searchTerm: '',
  });
  private readonly _filterState$ = new BehaviorSubject<FilterState>({
    filterOption: 'all',
  });

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
  public readonly filterState$: Observable<FilterState> =
    this._filterState$.asObservable();

  // Observable derivado para listas filtradas
  public readonly filteredLists$: Observable<SavedList[]> = combineLatest([
    this.savedLists$,
    this.searchState$,
    this.filterState$,
  ]).pipe(
    map(([lists, searchState, filterState]) =>
      this.filterLists(lists, searchState.searchTerm, filterState.filterOption)
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
    this.loadFilterPreference();
  }

  // ========== GESTIÓN DE LISTAS ==========

  // Carga las listas guardadas desde el servicio de almacenamiento
  loadSavedLists(): void {
    const savedLists = this.storageService.getSavedLists();
    // Ordenar las listas poniendo las prioritarias primero
    const sortedLists = this.sortListsByPriority(savedLists);
    this._savedLists$.next(sortedLists);
  }

  // Actualiza el indicador de porcentaje de almacenamiento usado
  updateStorageIndicator(): void {
    const percentage = this.storageService.getStoragePercentage();
    this._storagePercentage$.next(percentage);
  }

  // Navega a la pantalla de creación de nueva lista
  async goToNewList(): Promise<void> {
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

  // ========== GESTIÓN DE MODALES ==========

  // Cierra el modal de alerta
  closeAlert(): void {
    const modalState = this._modalState$.value;
    this._modalState$.next({
      ...modalState,
      showAlertModal: false,
      alertModalData: null,
    });
  }

  // Muestra una alerta
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

  // ========== GESTIÓN DE SELECCIÓN ==========

  // Activa o desactiva el modo de selección masiva
  toggleSelectionMode(): void {
    const currentState = this._selectionState$.value;
    this._selectionState$.next({
      isSelectionMode: !currentState.isSelectionMode,
      selectedListIds: new Set<string>(),
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
    const allListIds = this._savedLists$.value.map((list) => list.id);
    this._selectionState$.next({
      ...currentState,
      selectedListIds: new Set(allListIds),
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

  // Limpia la selección (privado)
  private clearSelection(): void {
    const currentState = this._selectionState$.value;
    this._selectionState$.next({
      ...currentState,
      selectedListIds: new Set<string>(),
    });
  }

  // ========== GESTIÓN DE BÚSQUEDA ==========

  // Actualiza el término de búsqueda
  updateSearchTerm(searchTerm: string): void {
    this._searchState$.next({ searchTerm });
  }

  // Limpia el término de búsqueda
  clearSearch(): void {
    this._searchState$.next({ searchTerm: '' });
  }

  // Filtra las listas según el término de búsqueda, filtro de estado y mantiene ordenamiento por prioridad
  private filterLists(
    lists: SavedList[],
    searchTerm: string,
    filterOption: 'all' | 'completed' | 'incomplete'
  ): SavedList[] {
    // MANTENER el ordenamiento por prioridad que viene de loadSavedLists()
    // No reordenar aquí para preservar: prioritarias primero, luego por fecha
    let filteredByStatus = [...lists];

    // Filtrar por estado de completitud
    if (filterOption === 'completed') {
      filteredByStatus = lists.filter(
        (list) => list.completedCount === list.tasksCount && list.tasksCount > 0
      );
    } else if (filterOption === 'incomplete') {
      filteredByStatus = lists.filter(
        (list) => list.completedCount < list.tasksCount || list.tasksCount === 0
      );
    }

    // Filtrar por término de búsqueda si existe
    if (!searchTerm.trim()) {
      // Aplicar ordenamiento por prioridad al resultado filtrado
      return this.sortListsByPriority(filteredByStatus);
    }

    const searchTermLower = searchTerm.toLowerCase();
    const searchFiltered = filteredByStatus.filter(
      (list) =>
        (list.name || 'Lista sin nombre')
          .toLowerCase()
          .includes(searchTermLower) ||
        (list.preview || '').toLowerCase().includes(searchTermLower)
    );

    // Aplicar ordenamiento por prioridad al resultado final
    return this.sortListsByPriority(searchFiltered);
  }

  // ========== MÉTODOS UTILITARIOS ==========

  // Formatea una fecha en string al formato local español
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Calcula el porcentaje de progreso de una lista
  getProgressPercentage(list: SavedList): number {
    if (list.tasksCount === 0) return 0;
    return Math.round((list.completedCount / list.tasksCount) * 100);
  }

  // ========== MÉTODOS SÍNCRONOS PARA ACCESO DIRECTO ==========

  // Obtiene las listas guardadas actuales de forma síncrona
  getCurrentSavedLists(): SavedList[] {
    return this._savedLists$.value;
  }

  // Obtiene el estado de selección actual de forma síncrona
  getCurrentSelectionState(): SelectionState {
    return this._selectionState$.value;
  }

  // Obtiene el estado de modal actual de forma síncrona
  getCurrentModalState(): ModalState {
    return this._modalState$.value;
  }

  // Obtiene el término de búsqueda actual de forma síncrona
  getCurrentSearchTerm(): string {
    return this._searchState$.value.searchTerm;
  }

  // ========== GESTIÓN DE FILTRADO ==========

  // Actualiza el filtro de estado y guarda la preferencia
  updateFilterOption(filterOption: 'all' | 'completed' | 'incomplete'): void {
    this._filterState$.next({ filterOption });

    // Guardar preferencia del usuario
    const preferences = this.storageService.loadUserPreferences() || {};
    preferences.filterOption = filterOption;
    this.storageService.saveUserPreferences(preferences);
  }

  // Carga la preferencia de filtrado guardada
  loadFilterPreference(): void {
    const preferences = this.storageService.loadUserPreferences();
    if (preferences && preferences.filterOption) {
      this._filterState$.next({ filterOption: preferences.filterOption });
    }
  }

  // Obtiene el filtro actual de forma síncrona
  getCurrentFilterOption(): 'all' | 'completed' | 'incomplete' {
    return this._filterState$.value.filterOption;
  }

  // ========== MÉTODOS DE ORDENAMIENTO ==========

  // Ordena las listas poniendo las prioritarias primero
  public sortListsByPriority(lists: SavedList[]): SavedList[] {
    return lists.sort((a, b) => {
      // Las listas prioritarias van primero
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;

      // Si ambas tienen la misma prioridad, ordenar por fecha (más recientes primero)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}
