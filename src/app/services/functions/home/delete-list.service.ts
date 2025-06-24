import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../storage.service';
import { ToastService } from '../../toast.service';
import { SavedList, ConfirmData } from '../../../models/task.interface';

// Servicio para manejar la eliminación de listas guardadas
@Injectable({
  providedIn: 'root',
})
export class DeleteListService {
  // Subject para manejar el estado del modal de confirmación
  private _showConfirmModal$ = new BehaviorSubject<boolean>(false);
  private _confirmModalData$ = new BehaviorSubject<ConfirmData | null>(null);

  // Observables públicos
  public readonly showConfirmModal$ = this._showConfirmModal$.asObservable();
  public readonly confirmModalData$ = this._confirmModalData$.asObservable();

  // Listas temporales para la operación de eliminación
  private listToDelete: SavedList | null = null;
  private listsToDelete: SavedList[] = [];

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  // Inicia el proceso de eliminación de una sola lista
  initiateDelete(list: SavedList): void {
    this.listToDelete = list;
    this.listsToDelete = [];

    this._confirmModalData$.next({
      title: 'Eliminar Lista',
      message: `¿Estás seguro de que quieres eliminar la lista "${
        list.name || 'Sin nombre'
      }"?\n\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    this._showConfirmModal$.next(true);
  }

  // Inicia el proceso de eliminación masiva de listas seleccionadas
  initiateMassDelete(lists: SavedList[]): void {
    this.listToDelete = null;
    this.listsToDelete = lists;

    this._confirmModalData$.next({
      title: 'Eliminar Listas Seleccionadas',
      message: `¿Estás seguro de que deseas eliminar ${lists.length} lista${
        lists.length > 1 ? 's' : ''
      }?\n\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    this._showConfirmModal$.next(true);
  }

  // Confirma y ejecuta la eliminación
  confirmDelete(): void {
    try {
      if (this.listsToDelete.length > 0) {
        // Eliminación masiva
        this.performMassDelete();
      } else if (this.listToDelete) {
        // Eliminación individual
        this.performSingleDelete();
      }
    } catch (error) {
      console.error('Error al eliminar lista(s):', error);
      this.toastService.showAlert('Error al eliminar la(s) lista(s)', 'danger');
    } finally {
      this.cancelDelete();
    }
  }

  // Cancela el proceso de eliminación
  cancelDelete(): void {
    this.listToDelete = null;
    this.listsToDelete = [];
    this._showConfirmModal$.next(false);
    this._confirmModalData$.next(null);
  }

  // Realiza la eliminación de una sola lista
  private performSingleDelete(): void {
    if (!this.listToDelete) return;

    this.storageService.deleteList(this.listToDelete.id);
    this.toastService.showAlert('Lista eliminada', 'info');
  }

  // Realiza la eliminación masiva de listas
  private performMassDelete(): void {
    if (this.listsToDelete.length === 0) return;

    let deletedCount = 0;
    let errorCount = 0;

    this.listsToDelete.forEach((list) => {
      try {
        this.storageService.deleteList(list.id);
        deletedCount++;
      } catch (error) {
        console.error(`Error al eliminar lista ${list.name}:`, error);
        errorCount++;
      }
    });

    // Mostrar resultado
    if (errorCount === 0) {
      this.toastService.showAlert(
        `${deletedCount} lista${deletedCount > 1 ? 's' : ''} eliminada${
          deletedCount > 1 ? 's' : ''
        }, ${errorCount} con error${errorCount > 1 ? 'es' : ''}`,
        'info'
      );
    } else if (deletedCount > 0) {
      this.toastService.showAlert(
        `${deletedCount} lista${deletedCount > 1 ? 's' : ''} eliminada${
          deletedCount > 1 ? 's' : ''
        }, ${errorCount} con error${errorCount > 1 ? 'es' : ''}`,
        'warning'
      );
    } else {
      this.toastService.showAlert(
        'Error al eliminar las listas seleccionadas',
        'danger'
      );
    }
  }
}
