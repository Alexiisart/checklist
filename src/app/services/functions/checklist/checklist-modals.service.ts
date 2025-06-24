import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalData, AlertData } from '../../../models/task.interface';

/**
 * Servicio para manejar las funciones relacionadas con modales del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistModalsService {
  // Estados de modales
  private _showEditModal$ = new BehaviorSubject<boolean>(false);
  private _editModalData$ = new BehaviorSubject<ModalData | null>(null);

  private _showSaveModal$ = new BehaviorSubject<boolean>(false);
  private _saveModalData$ = new BehaviorSubject<ModalData | null>(null);

  private _showAlertModal$ = new BehaviorSubject<boolean>(false);
  private _alertModalData$ = new BehaviorSubject<AlertData | null>(null);

  // Observables públicos
  public readonly showEditModal$ = this._showEditModal$.asObservable();
  public readonly editModalData$ = this._editModalData$.asObservable();

  public readonly showSaveModal$ = this._showSaveModal$.asObservable();
  public readonly saveModalData$ = this._saveModalData$.asObservable();

  public readonly showAlertModal$ = this._showAlertModal$.asObservable();
  public readonly alertModalData$ = this._alertModalData$.asObservable();

  // ===== MODAL DE EDICIÓN =====

  /**
   * Muestra el modal de edición con las tareas actuales
   */
  showEditModal(tasksString: string): void {
    this._editModalData$.next({
      title: 'Editar Lista de Tareas',
      label: 'Tareas separadas por comas:',
      placeholder: 'Cliente, Vehículos, Reclamos, Inventario...',
      currentValue: tasksString,
    });
    this._showEditModal$.next(true);
  }

  /**
   * Cierra el modal de edición
   */
  closeEditModal(): void {
    this._showEditModal$.next(false);
    this._editModalData$.next(null);
  }

  // ===== MODAL DE GUARDADO =====

  /**
   * Muestra el modal para guardar la lista
   */
  showSaveModal(suggestedName: string): void {
    this._saveModalData$.next({
      title: 'Guardar Lista',
      label: 'Nombre de la lista:',
      placeholder: 'Mi checklist del día...',
      currentValue: suggestedName,
    });
    this._showSaveModal$.next(true);
  }

  /**
   * Cierra el modal de guardado
   */
  closeSaveModal(): void {
    this._showSaveModal$.next(false);
    this._saveModalData$.next(null);
  }

  // ===== MODAL DE ALERTA =====

  /**
   * Muestra el modal de alerta
   */
  showAlertModal(data: AlertData): void {
    this._alertModalData$.next(data);
    this._showAlertModal$.next(true);
  }

  /**
   * Cierra el modal de alerta
   */
  closeAlertModal(): void {
    this._showAlertModal$.next(false);
    this._alertModalData$.next(null);
  }

  // ===== GETTERS PARA VALORES ACTUALES =====

  get currentEditModalData(): ModalData | null {
    return this._editModalData$.value;
  }

  get currentSaveModalData(): ModalData | null {
    return this._saveModalData$.value;
  }

  get currentAlertModalData(): AlertData | null {
    return this._alertModalData$.value;
  }
}
