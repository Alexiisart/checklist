import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, first } from 'rxjs';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';
import { ChecklistData, ConfirmData } from '../../../models/task.interface';

/**
 * Servicio para manejar las funciones relacionadas con navegación del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistNavigationService {
  // Subject para manejar el estado del modal de confirmación
  private _showConfirmModal$ = new BehaviorSubject<boolean>(false);
  private _confirmModalData$ = new BehaviorSubject<ConfirmData | null>(null);

  // Observables públicos
  public readonly showConfirmModal$ = this._showConfirmModal$.asObservable();
  public readonly confirmModalData$ = this._confirmModalData$.asObservable();

  // Acción pendiente para ejecutar después de la confirmación
  private pendingAction: string | null = null;

  constructor(
    private router: Router,
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Guarda directamente o retorna false si necesita nombre
   */
  saveProgressDirectly(currentList: ChecklistData | null): boolean {
    if (!currentList) {
      this.toastService.showAlert('No hay lista para guardar', 'warning');
      return false;
    }

    // Si la lista no tiene nombre, retorna false para que el componente muestre el modal
    if (!currentList.name || currentList.name.trim() === '') {
      return false;
    }

    // Si ya tiene nombre, guardar directamente
    const saved = this.checklistService.saveList(currentList.name);

    if (saved) {
      this.toastService.showAlert('Lista actualizada', 'success', 2000);
      return true;
    } else {
      this.toastService.showAlert('Error al guardar', 'danger');
      return false;
    }
  }

  /**
   * Confirma el guardado de la lista
   */
  saveList(name: string): boolean {
    if (!name.trim()) {
      this.toastService.showAlert('El nombre no puede estar vacío', 'warning');
      return false;
    }

    const saved = this.checklistService.saveList(name);

    if (saved) {
      this.toastService.showAlert('Lista guardada exitosamente', 'success');
      return true;
    }

    return false;
  }

  /**
   * Confirma el inicio de una nueva lista, verificando cambios pendientes
   */
  confirmStartNewList(): void {
    this.checklistService.hasUnsavedChanges$
      .pipe(first())
      .subscribe((hasUnsavedChanges) => {
        if (hasUnsavedChanges) {
          this._confirmModalData$.next({
            title: 'Cambios sin guardar',
            message:
              'Tienes cambios sin guardar. ¿Quieres guardar antes de comenzar una nueva lista?',
            confirmText: 'Guardar y nueva lista',
            cancelText: 'Nueva lista sin guardar',
          });
          this._showConfirmModal$.next(true);
          this.pendingAction = 'start-new-list-with-save';
        } else {
          // Si no hay cambios, ir directamente a nueva lista
          this.navigateToNewList();
        }
      });
  }

  /**
   * Navega a la página principal, verificando cambios sin guardar
   */
  goHome(): void {
    this.checklistService.hasUnsavedChanges$
      .pipe(first())
      .subscribe((hasUnsavedChanges) => {
        if (hasUnsavedChanges) {
          this._confirmModalData$.next({
            title: 'Cambios sin guardar',
            message:
              'Tienes cambios sin guardar. ¿Quieres guardar antes de salir?',
            confirmText: 'Guardar y salir',
            cancelText: 'Salir sin guardar',
          });
          this._showConfirmModal$.next(true);
          this.pendingAction = 'go-home';
        } else {
          this.router.navigate(['/home']);
        }
      });
  }

  /**
   * Confirma la acción pendiente
   */
  confirmAction(currentList: ChecklistData | null): void {
    if (this.pendingAction === 'start-new-list-with-save') {
      // Guardar primero y luego ir a nueva lista
      if (currentList) {
        const currentName =
          currentList.name || `Lista ${new Date().toLocaleDateString()}`;
        const saved = this.checklistService.saveList(currentName);
        if (saved) {
          this.toastService.showAlert('Lista guardada', 'success', 1500);
          setTimeout(() => {
            this.navigateToNewList();
          }, 1500);
        }
      }
    } else if (this.pendingAction === 'go-home') {
      // Guardar y ir a home
      if (currentList) {
        // Si la lista ya tiene nombre, guardar directamente
        if (currentList.name && currentList.name.trim() !== '') {
          const saved = this.checklistService.saveList(currentList.name);
          if (saved) {
            this.toastService.showAlert('Lista guardada', 'success', 1000);
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          }
        } else {
          // Si no tiene nombre, indicar que se necesita mostrar modal de guardado
          this.closeConfirmModal();
          return; // Retornar para que el componente maneje el modal de guardado
        }
      }
    }

    this.closeConfirmModal();
  }

  /**
   * Cancela la acción pendiente
   */
  cancelAction(): void {
    if (this.pendingAction === 'go-home') {
      this.router.navigate(['/home']);
    } else if (this.pendingAction === 'start-new-list-with-save') {
      // Si cancela "Guardar y nueva lista", significa "Nueva lista sin guardar"
      this.navigateToNewList();
    }
    this.closeConfirmModal();
  }

  /**
   * Cierra el modal de confirmación
   */
  closeConfirmModal(): void {
    this._showConfirmModal$.next(false);
    this._confirmModalData$.next(null);
    this.pendingAction = null;
  }

  /**
   * Navega a nueva lista limpiando todo
   */
  private navigateToNewList(): void {
    this.checklistService.clearAll();
    this.toastService.showAlert('Comenzando nueva lista', 'info');
    this.router.navigate(['/new-list']);
  }

  /**
   * Actualiza las observaciones de la lista
   */
  updateObservations(observations: string): void {
    this.checklistService.updateObservations(observations);
  }

  /**
   * Edita tareas en bulk preservando datos existentes
   */
  editTasksInBulk(newTasksString: string): void {
    this.checklistService.updateTasks(newTasksString);
    this.toastService.showAlert(
      'Lista actualizada preservando datos existentes',
      'success'
    );
  }

  /**
   * Obtiene la acción pendiente actual
   */
  get currentPendingAction(): string | null {
    return this.pendingAction;
  }

  /**
   * Establece una acción pendiente
   */
  setPendingAction(action: string): void {
    this.pendingAction = action;
  }
}
