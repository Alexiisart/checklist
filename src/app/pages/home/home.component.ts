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

  // Subject para limpiar subscripciones
  private readonly destroy$ = new Subject<void>();

  // Propiedades para el template (usando async pipe donde sea posible)
  searchTerm = '';

  constructor(private homeStateService: HomeStateService) {
    // Inicializar observables en el constructor
    this.savedLists$ = this.homeStateService.savedLists$;
    this.filteredLists$ = this.homeStateService.filteredLists$;
    this.storagePercentage$ = this.homeStateService.storagePercentage$;
    this.modalState$ = this.homeStateService.modalState$;
    this.selectionState$ = this.homeStateService.selectionState$;
    this.searchState$ = this.homeStateService.searchState$;
    this.selectedCount$ = this.homeStateService.selectedCount$;
  }

  // Inicializa el componente
  ngOnInit(): void {
    this.homeStateService.initialize();

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

  // ========== DELEGACIÓN DE MÉTODOS AL SERVICE ==========

  // Navega a la pantalla de creación de nueva lista
  async goToNewList(): Promise<void> {
    await this.homeStateService.goToNewList();
  }

  // Carga una lista específica para su edición
  loadList(listId: string): void {
    this.homeStateService.loadList(listId);
  }

  // Muestra el modal de confirmación para eliminar una lista
  confirmDeleteList(list: SavedList): void {
    this.homeStateService.confirmDeleteList(list);
  }

  // Elimina la lista confirmada
  deleteConfirmedList(): void {
    this.homeStateService.deleteConfirmedList();
  }

  // Cancela la eliminación de la lista
  cancelDelete(): void {
    this.homeStateService.cancelDelete();
  }

  // Cierra el modal de alerta
  closeAlert(): void {
    this.homeStateService.closeAlert();
  }

  // Muestra el modal para renombrar una lista
  openRenameModal(list: SavedList): void {
    this.homeStateService.openRenameModal(list);
  }

  // Renombra la lista con el nuevo nombre proporcionado
  renameList(newName: string): void {
    this.homeStateService.renameList(newName);
  }

  // Cierra el modal de renombrar
  closeRenameModal(): void {
    this.homeStateService.closeRenameModal();
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
    this.homeStateService.confirmDeleteSelected();
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
  // Estos métodos devuelven valores actuales para uso inmediato en el template

  // Obtiene las listas filtradas para uso síncrono en el template
  getFilteredLists(): SavedList[] {
    // Si necesitas acceso síncrono a las listas filtradas
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
