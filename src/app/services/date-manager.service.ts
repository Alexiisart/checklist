import { Injectable } from '@angular/core';
import { ChecklistService } from './checklist.service';
import { ToastService } from './toast.service';

/**
 * Servicio centralizado para gestionar fechas de cumplimiento de tareas
 * Proporciona métodos consistentes para crear, formatear y validar fechas
 * en zona horaria local del usuario
 */
@Injectable({
  providedIn: 'root',
})
export class DateManagerService {
  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  // ===== FUNCIONES UTILITARIAS CENTRALIZADAS =====

  /**
   * Crea una fecha en zona horaria local desde un string
   * @param dateString String de fecha en formato ISO, YYYY-MM-DD, o Date
   * @returns Fecha en zona horaria local
   */
  public createLocalDate(dateString: string | Date): Date {
    if (dateString instanceof Date) {
      return new Date(dateString);
    }

    // Si es solo fecha (YYYY-MM-DD), agregar tiempo para forzar zona local
    if (typeof dateString === 'string' && dateString.length === 10) {
      return new Date(dateString + 'T00:00:00');
    }

    return new Date(dateString);
  }

  /**
   * Obtiene la fecha de hoy a medianoche en zona horaria local
   * @returns Fecha de hoy normalizada a medianoche local
   */
  public getTodayLocal(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Convierte una fecha a string en formato YYYY-MM-DD (para inputs date)
   * @param date Fecha a convertir
   * @returns String en formato YYYY-MM-DD
   */
  public formatDateForInput(date: string | Date | null): string {
    if (!date) return '';

    const localDate = this.createLocalDate(date);

    // Usar toLocaleDateString con configuración específica para evitar problemas de zona horaria
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte una fecha a string ISO pero manteniendo zona horaria local
   * @param date Fecha a convertir
   * @returns String ISO en zona horaria local
   */
  public formatDateToISO(date: string | Date | null): string | null {
    if (!date) return null;

    const localDate = this.createLocalDate(date);
    return localDate.toISOString();
  }

  /**
   * Formatea una fecha para mostrar al usuario en español
   * @param date Fecha a formatear
   * @returns String formateado en español (ej: "26 jun. 2025")
   */
  public formatDateForDisplay(date: string | Date | null): string {
    if (!date) return '';

    const localDate = this.createLocalDate(date);
    return localDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Obtiene la fecha de hoy en formato YYYY-MM-DD para usar como minDate
   * @returns String fecha de hoy en formato YYYY-MM-DD
   */
  public getTodayForInput(): string {
    return this.formatDateForInput(this.getTodayLocal());
  }

  /**
   * Verifica si una fecha está vencida (anterior al día de hoy en zona local)
   * @param dateString String de fecha a verificar
   * @param isCompleted Si la tarea/item está completado
   * @returns true si está vencida
   */
  public isOverdue(
    dateString: string | null,
    isCompleted: boolean = false
  ): boolean {
    if (!dateString || isCompleted) return false;

    const dueDate = this.createLocalDate(dateString);
    const today = this.getTodayLocal();
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  /**
   * Verifica si dos fechas son el mismo día
   * @param date1 Primera fecha
   * @param date2 Segunda fecha
   * @returns true si son el mismo día
   */
  public isSameDay(
    date1: string | Date | null,
    date2: string | Date | null
  ): boolean {
    if (!date1 || !date2) return false;

    const d1 = this.createLocalDate(date1);
    const d2 = this.createLocalDate(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /**
   * Convierte un input de date (YYYY-MM-DD) a ISO string manteniendo zona local
   * @param inputValue Valor del input date
   * @returns ISO string o null
   */
  public convertInputToISO(inputValue: string): string | null {
    if (!inputValue) return null;

    // Crear fecha local a medianoche
    const localDate = new Date(inputValue + 'T00:00:00');
    return localDate.toISOString();
  }

  // ===== FUNCIONES DE GESTIÓN DE FECHAS DE TAREAS =====

  /**
   * Actualiza la fecha de vencimiento de una tarea
   */
  updateTaskDueDate(taskId: number, dueDate: string | null): void {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.dueDate = dueDate;
      this.checklistService['updateList'](currentList);

      const message = dueDate
        ? 'Fecha de vencimiento establecida'
        : 'Fecha de vencimiento eliminada';
      this.toastService.showAlert(message, 'success');
    }
  }

  /**
   * Establece automáticamente la fecha de completado de una tarea
   */
  setTaskCompletedDate(taskId: number, completed: boolean): void {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completedDate = completed ? new Date().toISOString() : null;
      this.checklistService['updateList'](currentList);
    }
  }

  /**
   * Obtiene estadísticas de fechas para una lista
   */
  getDateStatistics() {
    const currentList = this.checklistService['getCurrentList']();
    if (!currentList) return null;

    const today = this.getTodayLocal();
    const stats = {
      totalWithDates: 0,
      overdue: 0,
      dueSoon: 0,
      completed: 0,
    };

    currentList.tasks.forEach((task) => {
      if (task.dueDate) {
        stats.totalWithDates++;
        const dueDate = this.createLocalDate(task.dueDate);

        if (task.completed) {
          stats.completed++;
        } else {
          // Normalizar fecha de vencimiento a medianoche local
          dueDate.setHours(0, 0, 0, 0);

          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(today.getDate() + 3);

          if (dueDate < today) {
            stats.overdue++;
          } else if (dueDate <= threeDaysFromNow) {
            stats.dueSoon++;
          }
        }
      }
    });

    return stats;
  }
}
