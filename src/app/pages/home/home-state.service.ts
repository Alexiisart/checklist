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

  // Filtra las listas según el término de búsqueda y las ordena por fecha (más recientes primero)
  private filterLists(lists: SavedList[], searchTerm: string): SavedList[] {
    // Primero ordenar por fecha (más recientes primero)
    const sortedLists = [...lists].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Orden descendente (más recientes primero)
    });

    // Luego filtrar por término de búsqueda si existe
    if (!searchTerm.trim()) {
      return sortedLists;
    }

    const searchTermLower = searchTerm.toLowerCase();
    return sortedLists.filter(
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
}
