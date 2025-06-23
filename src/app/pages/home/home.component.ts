import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';
import { SavedList, ConfirmData, AlertData } from '../../models/task.interface';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';

/**
 * Componente principal que muestra la pantalla de inicio con las listas guardadas
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, AlertModalComponent],
  template: `
    <div class="home-screen">
      <div class="home-header">
        <h2>Mis Listas Guardadas</h2>
        <button class="primary-btn" (click)="goToNewList()">Nueva Lista</button>
      </div>

      <!-- Indicador de almacenamiento -->
      <div class="storage-indicator" *ngIf="storagePercentage > 60">
        <div class="storage-header">
          <span class="material-icons-outlined">storage</span>
          <span class="storage-text"
            >Espacio usado: {{ storagePercentage }}%</span
          >
        </div>
        <div class="storage-progress">
          <div
            class="storage-progress-fill"
            [style.width.%]="storagePercentage"
          ></div>
        </div>
        <p *ngIf="storagePercentage > 80" class="storage-warning">
          ⚠️ Espacio casi lleno. Considera eliminar listas antiguas.
        </p>
      </div>

      <!-- Lista de cards guardadas -->
      <div class="saved-lists-container" *ngIf="savedLists.length > 0">
        <div
          class="list-card"
          *ngFor="let list of savedLists"
          (click)="loadList(list.id)"
        >
          <div class="list-card-header">
            <h3 class="list-card-title">
              {{ list.name || 'Lista sin nombre' }}
            </h3>
            <span class="list-card-date">{{ formatDate(list.date) }}</span>
          </div>
          <p class="list-card-preview">{{ list.preview }}</p>
          <div class="list-card-stats">
            <span
              >{{ list.completedCount }} de
              {{ list.tasksCount }} completadas</span
            >
          </div>
          <div class="list-card-progress">
            <div
              class="list-card-progress-bar"
              [style.width.%]="getProgressPercentage(list)"
            ></div>
          </div>
          <div class="list-card-actions" (click)="$event.stopPropagation()">
            <button
              class="delete-list-btn"
              (click)="confirmDeleteList(list)"
              title="Eliminar lista"
            >
              <span class="material-icons-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="savedLists.length === 0">
        <span class="material-icons-outlined empty-icon">checklist</span>
        <h3>No tienes listas guardadas</h3>
        <p>
          Crea tu primera lista para comenzar a organizar tus tareas diarias
        </p>
        <button class="primary-btn" (click)="goToNewList()">
          Crear Primera Lista
        </button>
      </div>
    </div>

    <app-confirm-modal
      [isVisible]="showConfirmModal"
      [data]="confirmModalData"
      (confirmed)="deleteConfirmedList()"
      (cancelled)="cancelDelete()"
    >
    </app-confirm-modal>

    <app-alert-modal
      [isVisible]="showAlertModal"
      [data]="alertModalData"
      (closed)="closeAlert()"
    >
    </app-alert-modal>
  `,
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
    // Verificar límites de almacenamiento antes de continuar
    const hasStorageSpace = this.storageService.checkStorageLimits();
    if (!hasStorageSpace) {
      return;
    }

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
    if (this.listToDelete) {
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
    this.listToDelete = null;
  }

  /**
   * Cancela la eliminación de la lista
   */
  cancelDelete(): void {
    this.listToDelete = null;
    this.showConfirmModal = false;
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
}
