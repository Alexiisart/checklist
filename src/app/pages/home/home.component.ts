import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { ListCardComponent } from '../../shared/components/list-card/list-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ExportImportDropdownComponent } from '../../shared/components/export-import-dropdown/export-import-dropdown.component';
import { StorageProgressIndicatorComponent } from '../../shared/components/storage-progress-indicator/storage-progress-indicator.component';
import { ButtonComponent } from '../../shared/atomic/buttons';
import { HomeStateService } from './home-state.service';
import { DuplicateListService } from '../../services/functions/home/duplicate-list.service';
import { RenameListService } from '../../services/functions/home/rename-list.service';
import { DeleteListService } from '../../services/functions/home/delete-list.service';
import { OpenNewTabService } from '../../services/functions/home/open-new-tab.service';
import { ChecklistCopyService } from '../../services/functions/checklist/checklist-copy.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { SavedList } from '../../models/task.interface';

// Componente principal de la página de inicio. Muestra las listas guardadas y proporciona opciones para gestionar y crear listas
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    ListCardComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    AlertModalComponent,
    ModalComponent,
    ExportImportDropdownComponent,
    StorageProgressIndicatorComponent,
    ButtonComponent,
  ],
  providers: [HomeStateService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Observables públicos para el template
  public savedLists$!: Observable<SavedList[]>;
  public filteredLists$!: Observable<SavedList[]>;
  public storagePercentage$!: Observable<number>;
  public modalState$!: Observable<any>;
  public selectionState$!: Observable<any>;
  public searchState$!: Observable<any>;
  public selectedCount$!: Observable<number>;

  // Observables del servicio de duplicación
  public duplicateShowConfirmModal$!: Observable<boolean>;
  public duplicateConfirmModalData$!: Observable<any>;

  // Observables del servicio de renombrar
  public renameShowModal$!: Observable<boolean>;
  public renameModalData$!: Observable<any>;

  // Observables del servicio de eliminar
  public deleteShowConfirmModal$!: Observable<boolean>;
  public deleteConfirmModalData$!: Observable<any>;

  // Subject para limpiar subscripciones
  private readonly destroy$ = new Subject<void>();

  // Propiedades para el template (usando async pipe donde sea posible)
  searchTerm = '';

  constructor(
    private homeStateService: HomeStateService,
    private duplicateListService: DuplicateListService,
    private renameListService: RenameListService,
    private deleteListService: DeleteListService,
    private openNewTabService: OpenNewTabService,
    private copyService: ChecklistCopyService
  ) {
    // Inicializar observables en el constructor
    this.savedLists$ = this.homeStateService.savedLists$;
    this.filteredLists$ = this.homeStateService.filteredLists$;
    this.storagePercentage$ = this.homeStateService.storagePercentage$;
    this.modalState$ = this.homeStateService.modalState$;
    this.selectionState$ = this.homeStateService.selectionState$;
    this.searchState$ = this.homeStateService.searchState$;
    this.selectedCount$ = this.homeStateService.selectedCount$;

    // Observables del servicio de duplicación
    this.duplicateShowConfirmModal$ =
      this.duplicateListService.showConfirmModal$;
    this.duplicateConfirmModalData$ =
      this.duplicateListService.confirmModalData$;

    // Observables del servicio de renombrar
    this.renameShowModal$ = this.renameListService.showRenameModal$;
    this.renameModalData$ = this.renameListService.renameModalData$;

    // Observables del servicio de eliminar
    this.deleteShowConfirmModal$ = this.deleteListService.showConfirmModal$;
    this.deleteConfirmModalData$ = this.deleteListService.confirmModalData$;
  }

  // Inicializa el componente
  ngOnInit(): void {
    this.homeStateService.initialize();
    this.setupServiceSubscriptions();

    // Suscribirse al término de búsqueda para el two-way binding
    this.homeStateService.searchState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.searchTerm = state.searchTerm;
      });
  }

  // Limpia las subscripciones al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Configura suscripciones a los servicios para actualizar listas cuando se completen operaciones
  private setupServiceSubscriptions(): void {
    // Actualizar cuando se complete duplicación
    this.duplicateListService.showConfirmModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible) => {
        if (!isVisible) {
          this.homeStateService.loadSavedLists();
          this.homeStateService.updateStorageIndicator();
        }
      });

    // Actualizar cuando se complete renombrado
    this.renameListService.showRenameModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible) => {
        if (!isVisible) {
          this.homeStateService.loadSavedLists();
          this.homeStateService.updateStorageIndicator();
        }
      });

    // Actualizar cuando se complete eliminación
    this.deleteListService.showConfirmModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible) => {
        if (!isVisible) {
          this.homeStateService.loadSavedLists();
          this.homeStateService.updateStorageIndicator();
          // Limpiar selección después de eliminar listas
          this.homeStateService.deselectAllLists();
        }
      });
  }

  // ========== DELEGACIÓN DE MÉTODOS AL STATE SERVICE ==========

  // Navega a la pantalla de creación de nueva lista
  async goToNewList(): Promise<void> {
    await this.homeStateService.goToNewList();
  }

  // Carga una lista específica para su edición
  loadList(listId: string): void {
    this.homeStateService.loadList(listId);
  }

  // Maneja la actualización de listas después de importar
  onListsUpdated(): void {
    this.homeStateService.onListsUpdated();
  }

  // Activa o desactiva el modo de selección masiva
  toggleSelectionMode(): void {
    this.homeStateService.toggleSelectionMode();
  }

  // Selecciona o deselecciona una lista
  toggleListSelection(listId: string): void {
    this.homeStateService.toggleListSelection(listId);
  }

  // Verifica si una lista está seleccionada
  isListSelected(listId: string): boolean {
    return this.homeStateService.isListSelected(listId);
  }

  // Selecciona todas las listas
  selectAllLists(): void {
    this.homeStateService.selectAllLists();
  }

  // Deselecciona todas las listas
  deselectAllLists(): void {
    this.homeStateService.deselectAllLists();
  }

  // Confirma la eliminación masiva de listas seleccionadas
  confirmDeleteSelected(): void {
    const selectionState = this.homeStateService.getCurrentSelectionState();
    if (selectionState.selectedListIds.size > 0) {
      const allLists = this.homeStateService.getCurrentSavedLists();
      const selectedLists = allLists.filter((list) =>
        selectionState.selectedListIds.has(list.id)
      );
      this.deleteListService.initiateMassDelete(selectedLists);
    }
  }

  // Maneja el cambio en el término de búsqueda
  onSearchChange(searchTerm?: string): void {
    if (searchTerm !== undefined) {
      this.searchTerm = searchTerm;
    }
    this.homeStateService.updateSearchTerm(this.searchTerm);
  }

  // Limpia el término de búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.homeStateService.clearSearch();
  }

  // Maneja el clic en una tarjeta de lista
  onListCardClick(listId: string): void {
    const selectionState = this.homeStateService.getCurrentSelectionState();
    if (selectionState.isSelectionMode) {
      this.toggleListSelection(listId);
    } else {
      this.loadList(listId);
    }
  }

  // ========== MÉTODOS DE SERVICIOS DE FUNCIONES ==========

  // Duplicar lista
  duplicateList(list: SavedList): void {
    this.duplicateListService.initiateDuplication(list);
  }

  confirmDuplicateList(): void {
    this.duplicateListService.confirmDuplication();
  }

  cancelDuplicateList(): void {
    this.duplicateListService.cancelDuplication();
  }

  // Renombrar lista
  openRenameModal(list: SavedList): void {
    this.renameListService.initiateRename(list);
  }

  renameList(newName: string): void {
    this.renameListService.confirmRename(newName);
  }

  closeRenameModal(): void {
    this.renameListService.cancelRename();
  }

  // Eliminar lista
  confirmDeleteList(list: SavedList): void {
    this.deleteListService.initiateDelete(list);
  }

  deleteConfirmedList(): void {
    this.deleteListService.confirmDelete();
  }

  cancelDelete(): void {
    this.deleteListService.cancelDelete();
  }

  // Abrir lista en nueva pestaña
  openListInNewTab(listId: string): void {
    this.openNewTabService.openListInNewTab(listId);
  }

  // Copiar lista al portapapeles desde el card
  copyListFromCard(list: SavedList): void {
    this.copyService.copyListFromCard(list);
  }

  // ========== MÉTODOS DE COMPATIBILIDAD CON STATE SERVICE ==========

  // Cierra el modal de alerta (para compatibilidad)
  closeAlert(): void {
    this.homeStateService.closeAlert();
  }

  // ========== MÉTODOS UTILITARIOS ==========

  // Formatea una fecha en string al formato local español
  formatDate(dateString: string): string {
    return this.homeStateService.formatDate(dateString);
  }

  // Calcula el porcentaje de progreso de una lista
  getProgressPercentage(list: SavedList): number {
    return this.homeStateService.getProgressPercentage(list);
  }

  // ========== MÉTODOS SÍNCRONOS PARA EL TEMPLATE ==========

  // Obtiene las listas filtradas para uso síncrono en el template
  getFilteredLists(): SavedList[] {
    const currentLists = this.homeStateService.getCurrentSavedLists();
    const currentSearchTerm = this.homeStateService.getCurrentSearchTerm();

    if (!currentSearchTerm.trim()) {
      return [...currentLists];
    }

    const searchTermLower = currentSearchTerm.toLowerCase();
    return currentLists.filter(
      (list) =>
        (list.name || 'Lista sin nombre')
          .toLowerCase()
          .includes(searchTermLower) ||
        (list.preview || '').toLowerCase().includes(searchTermLower)
    );
  }

  // Obtiene el número de listas seleccionadas de forma síncrona
  getSelectedCount(): number {
    return this.homeStateService.getCurrentSelectionState().selectedListIds
      .size;
  }
}
