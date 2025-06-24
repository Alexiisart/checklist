import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../storage.service';
import { ToastService } from '../../toast.service';
import { SavedList, ModalData } from '../../../models/task.interface';

// Servicio para manejar el renombrado de listas guardadas
@Injectable({
  providedIn: 'root',
})
export class RenameListService {
  // Subject para manejar el estado del modal de renombrar
  private _showRenameModal$ = new BehaviorSubject<boolean>(false);
  private _renameModalData$ = new BehaviorSubject<ModalData | null>(null);

  // Observables públicos
  public readonly showRenameModal$ = this._showRenameModal$.asObservable();
  public readonly renameModalData$ = this._renameModalData$.asObservable();

  // Lista temporal para la operación de renombrado
  private listToRename: SavedList | null = null;

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  // Inicia el proceso de renombrado mostrando el modal
  initiateRename(list: SavedList): void {
    this.listToRename = list;

    this._renameModalData$.next({
      title: 'Renombrar Lista',
      label: 'Nuevo nombre:',
      placeholder: 'Ingresa el nuevo nombre de la lista',
      currentValue: list.name || 'Lista sin nombre',
    });

    this._showRenameModal$.next(true);
  }

  // Confirma y ejecuta el renombrado de la lista
  confirmRename(newName: string): void {
    if (!this.listToRename) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
      this.toastService.showAlert('El nombre no puede estar vacío', 'warning');
      return;
    }

    try {
      // Verificar si ya existe una lista con ese nombre
      const existingLists = this.storageService.getSavedLists();
      const nameExists = existingLists.some(
        (list) =>
          list.name.toLowerCase() === trimmedName.toLowerCase() &&
          list.id !== this.listToRename!.id
      );

      if (nameExists) {
        this.toastService.showAlert(
          'Ya existe una lista con ese nombre',
          'warning'
        );
        return;
      }

      // Renombrar la lista
      this.storageService.renameList(this.listToRename.id, trimmedName);

      this.toastService.showAlert(
        `Lista renombrada a "${trimmedName}"`,
        'success'
      );
    } catch (error) {
      console.error('Error al renombrar lista:', error);
      this.toastService.showAlert('Error al renombrar la lista', 'danger');
    } finally {
      this.cancelRename();
    }
  }

  // Cancela el proceso de renombrado
  cancelRename(): void {
    this.listToRename = null;
    this._showRenameModal$.next(false);
    this._renameModalData$.next(null);
  }
}
