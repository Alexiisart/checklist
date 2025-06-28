import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ChecklistService } from '../../services/checklist.service';
import { ToastService } from '../../services/toast.service';
import { ChecklistData } from '../../models/task.interface';

// No importar servicios de funciones - van directo al componente

/** Interfaz que define la estructura del estado del checklist */
export interface ChecklistState {
  currentList: ChecklistData | null;
  progress: { completed: number; total: number; percentage: number };
  hasUnsavedChanges: boolean;
}

/**
 * Servicio que maneja únicamente el estado básico del checklist.
 * Sigue el patrón de HomeStateService: solo estado, sin servicios de funciones.
 * Ver CHECKLIST_ARCHITECTURE.md para detalles completos.
 */
@Injectable()
export class ChecklistStateService implements OnDestroy {
  private readonly AUTO_SAVE_INTERVAL = 15000; // 15 segundos

  private stateSubject = new BehaviorSubject<ChecklistState>({
    currentList: null,
    progress: { completed: 0, total: 0, percentage: 0 },
    hasUnsavedChanges: false,
  });

  private destroy$ = new Subject<void>();
  private autoSaveInterval: any = null;
  private listId: string | null = null;
  private hasShownCongratulations = false; // Bandera para evitar mostrar felicitaciones múltiples veces

  // Observable público para el estado
  state$ = this.stateSubject.asObservable();

  constructor(
    private router: Router,
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {
    this.subscribeToChecklistChanges();
  }

  /** Limpia recursos cuando se destruye el servicio */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** Inicializa el estado con un ID de lista específico y comienza el autoguardado */
  initializeWithListId(listId: string): void {
    this.listId = listId;
    this.hasShownCongratulations = false; // Resetear bandera al cargar nueva lista
    if (this.listId) {
      this.loadList(this.listId);
    }
    this.startAutoSave();
    this.updateState({ hasUnsavedChanges: true });
  }

  /** Limpia recursos y detiene el autoguardado */
  cleanup(): void {
    this.stopAutoSave();
    this.hasShownCongratulations = false; // Resetear bandera al limpiar
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Suscribe el servicio a cambios en la lista del checklist */
  private subscribeToChecklistChanges(): void {
    this.checklistService.currentList$.subscribe((list) => {
      this.updateState({ currentList: list });
      this.updateProgress();
    });
  }

  /** Carga una lista por su ID */
  private loadList(listId: string): void {
    const list = this.checklistService.loadList(listId);
    if (!list) {
      this.toastService.showAlert('Lista no encontrada', 'danger');
      this.router.navigate(['/home']);
    }
  }

  /** Actualiza el progreso de las tareas completadas */
  private updateProgress(): void {
    const progress = this.checklistService.getProgress();
    this.updateState({ progress });

    if (progress.total > 0 && progress.completed === progress.total) {
      // Todas las tareas están completas
      if (!this.hasShownCongratulations) {
        setTimeout(() => {
          this.toastService.showAlert(
            '¡Felicitaciones! Has completado todas las tareas',
            'success'
          );
          this.hasShownCongratulations = true;
        }, 300);
      }
    } else {
      // No todas las tareas están completas, resetear bandera
      this.hasShownCongratulations = false;
    }
  }

  /** Actualiza el estado del checklist */
  updateState(partialState: Partial<ChecklistState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  /** Marca el estado como modificado */
  markAsChanged(): void {
    this.updateState({ hasUnsavedChanges: true });
  }

  // ===== AUTO-GUARDADO =====

  /** Inicia el intervalo de autoguardado */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.performAutoSave();
    }, this.AUTO_SAVE_INTERVAL);
  }

  /** Detiene el intervalo de autoguardado */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /** Realiza el autoguardado si hay cambios pendientes */
  private performAutoSave(): void {
    const currentState = this.stateSubject.value;
    if (
      currentState.hasUnsavedChanges &&
      currentState.currentList &&
      currentState.currentList.name
    ) {
      const success = this.checklistService.saveList(
        currentState.currentList.name
      );
      if (success) {
        this.updateState({ hasUnsavedChanges: false });
        this.toastService.showAlert(
          'Lista guardada automáticamente',
          'info',
          2000
        );
      }
    }
  }
}
