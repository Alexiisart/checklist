import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Base64UrlService } from './base64-url.service';
import { ChecklistService } from '../checklist.service';
import { ToastService } from '../toast.service';
import { ChecklistData } from '../../models/task.interface';

/**
 * Servicio para detectar y cargar URLs compartidas
 * Se ejecuta al inicializar la aplicación
 */
@Injectable({
  providedIn: 'root',
})
export class SharedUrlLoaderService {
  constructor(
    private router: Router,
    private base64UrlService: Base64UrlService,
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Verifica si hay una URL compartida y la carga automáticamente
   * Se debe llamar desde app.component o el router principal
   */
  checkAndLoadSharedUrl(): void {
    try {
      // Verificar si hay datos compartidos almacenados desde main.ts
      const storedData = sessionStorage.getItem('pendingSharedData');

      if (storedData) {
        console.log('Lista compartida encontrada, cargando...');

        // Limpiar el storage
        sessionStorage.removeItem('pendingSharedData');

        // Decodificar los datos
        const sharedData = this.base64UrlService.decodeFromBase64(storedData);

        if (sharedData) {
          this.loadSharedList(sharedData);
        } else {
          console.log('Error decodificando datos compartidos');
          this.showInvalidDataError();
        }
      } else {
        // Fallback: intentar extraer de URL actual (para compatibilidad)
        const sharedData = this.base64UrlService.extractFromCurrentUrl();
        if (sharedData) {
          console.log('Lista compartida encontrada en URL, cargando...');
          this.loadSharedList(sharedData);
          this.clearUrlFragment();
        }
      }
    } catch (error) {
      console.error('Error procesando URL compartida:', error);
      this.showError();
    }
  }

  /**
   * Carga una lista compartida en el checklist
   * @param sharedData Datos de la lista compartida
   */
  private loadSharedList(sharedData: ChecklistData): void {
    try {
      // Validar que los datos son válidos
      if (!this.isValidSharedData(sharedData)) {
        this.showInvalidDataError();
        return;
      }

      // Cargar la lista compartida en el servicio
      this.checklistService.loadSharedList(sharedData);

      // Navegar al checklist sin ID específico
      this.router.navigate(['/checklist']);

      // Mostrar mensaje informativo después de un pequeño delay
      setTimeout(() => {
        this.showSuccessMessage(sharedData.name || 'Lista compartida');
      }, 500);
    } catch (error) {
      console.error('Error cargando lista compartida:', error);
      this.showError();
    }
  }

  /**
   * Valida que los datos compartidos sean correctos
   * @param data Datos a validar
   * @returns true si son válidos
   */
  private isValidSharedData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      Array.isArray(data.tasks) &&
      data.tasks.every(
        (task: any) =>
          task &&
          typeof task.id === 'number' &&
          typeof task.name === 'string' &&
          typeof task.completed === 'boolean' &&
          Array.isArray(task.subtasks) &&
          Array.isArray(task.errors)
      )
    );
  }

  /**
   * Limpia los datos compartidos de la URL después de cargar
   */
  private clearUrlFragment(): void {
    const url = new URL(window.location.href);

    // Limpiar query parameters
    url.searchParams.delete('shared');

    // Limpiar hash si contiene datos compartidos
    if (url.hash.match(/^#(?:share-data|shared)=/)) {
      url.hash = '';
    }

    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Muestra mensaje de éxito al cargar lista compartida
   * @param listName Nombre de la lista
   */
  private showSuccessMessage(listName: string): void {
    this.toastService.showAlert(
      `Lista "${listName}" cargada y guardada automáticamente`,
      'success'
    );
  }

  /**
   * Muestra error cuando los datos no son válidos
   */
  private showInvalidDataError(): void {
    this.toastService.showAlert(
      'El enlace compartido no es válido o está dañado',
      'danger'
    );
  }

  /**
   * Muestra error genérico
   */
  private showError(): void {
    this.toastService.showAlert(
      'Error al cargar la lista compartida. Verifica que el enlace sea correcto.',
      'danger'
    );
  }
}
