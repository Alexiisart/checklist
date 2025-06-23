import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChecklistService } from '../../services/checklist.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ConfirmData } from '../../models/task.interface';

/**
 * Componente para crear una nueva lista de tareas.
 * Permite al usuario ingresar tareas separadas por comas y generar un checklist.
 */
@Component({
  selector: 'app-new-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="input-section">
      <div class="input-header">
        <button class="secondary-btn" (click)="backToHome()">
          <span class="material-icons-outlined">home</span> Volver
        </button>
        <h2>Nueva Lista</h2>
        <div class="spacer"></div>
      </div>

      <div class="input-container">
        <label for="taskInput">Ingresa tus tareas separadas por comas:</label>
        <textarea
          id="taskInput"
          [(ngModel)]="taskInput"
          placeholder="Comer, dormir, etc."
          rows="3"
          (keypress)="onKeyPress($event)"
        >
        </textarea>
        <button
          class="primary-btn"
          (click)="generateChecklist()"
          [disabled]="!taskInput.trim()"
        >
          Generar Checklist
        </button>
      </div>

      <div class="example-section">
        <h3>💡 Ejemplo de uso:</h3>
        <div class="example-input">
          <strong>Input:</strong> Cliente, Vehículos, Reclamos, Seguimiento de
          pólizas
        </div>
        <div class="example-result">
          <strong>Resultado:</strong>
          <ul>
            <li>☐ Cliente</li>
            <li>☐ Vehículos</li>
            <li>☐ Reclamos</li>
            <li>☐ Seguimiento de pólizas</li>
          </ul>
          <p class="example-note">
            ✨ Luego podrás agregar subtareas, errores, observaciones y más!
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <app-confirm-modal
      [isVisible]="showConfirmModal"
      [data]="confirmModalData"
      (confirmed)="onConfirmAction()"
      (cancelled)="onCancelAction()"
    >
    </app-confirm-modal>
  `,
  styleUrls: ['./new-list.component.css'],
})
export class NewListComponent {
  /** Input de texto donde el usuario ingresa las tareas */
  taskInput = '';

  /** Controla la visibilidad del modal de confirmación */
  showConfirmModal = false;

  /** Datos para el modal de confirmación */
  confirmModalData: ConfirmData | null = null;

  constructor(
    private router: Router,
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Maneja el evento de presionar una tecla en el textarea.
   * Si se presiona Enter sin Shift, genera el checklist.
   * @param event Evento del teclado
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.generateChecklist();
    }
  }

  /**
   * Genera un nuevo checklist a partir del texto ingresado.
   * Valida el input, crea la lista y navega a la vista del checklist.
   */
  generateChecklist(): void {
    const input = this.taskInput.trim();
    if (!input) {
      this.toastService.showAlert(
        'Por favor ingresa al menos una tarea',
        'warning'
      );
      return;
    }

    // Parsear las tareas del input
    const taskNames = input
      .split(',')
      .map((task) => task.trim())
      .filter((task) => task);

    if (taskNames.length === 0) {
      this.toastService.showAlert(
        'No se encontraron tareas válidas',
        'warning'
      );
      return;
    }

    // Crear nueva lista
    const newList = this.checklistService.createNewList(taskNames);

    this.toastService.showAlert(
      `Checklist generado con ${taskNames.length} tareas`,
      'success'
    );

    // Navegar al checklist después de un breve retraso
    setTimeout(() => {
      this.router.navigate(['/checklist']);
    }, 1500);
  }

  /**
   * Navega de vuelta a la página de inicio (como backToHome del original)
   */
  backToHome(): void {
    const hasInputContent = this.taskInput.trim().length > 0;

    if (hasInputContent) {
      this.confirmModalData = {
        title: 'Volver al inicio',
        message:
          '¿Quieres volver al inicio? Se perderá el contenido que hayas escrito.',
        confirmText: 'Sí, volver',
        cancelText: 'Cancelar',
      };
      this.showConfirmModal = true;
    } else {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Maneja la confirmación del modal
   */
  onConfirmAction(): void {
    this.taskInput = '';
    this.router.navigate(['/home']);
    this.closeConfirmModal();
  }

  /**
   * Maneja la cancelación del modal
   */
  onCancelAction(): void {
    this.closeConfirmModal();
  }

  /**
   * Cierra el modal de confirmación
   */
  private closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmModalData = null;
  }
}
