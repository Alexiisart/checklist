import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Base64UrlService } from './base64-url.service';
import { ChecklistService } from '../checklist.service';
import { ToastService } from '../toast.service';
import { ChecklistData } from '../../models/task.interface';
import { SharedListComparisonService } from './shared-list-comparison.service';
import { StorageService } from '../storage.service';

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
    private toastService: ToastService,
    private comparisonService: SharedListComparisonService,
    private storageService: StorageService
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
        // Limpiar el storage
        sessionStorage.removeItem('pendingSharedData');

        // Decodificar los datos
        const sharedData = this.base64UrlService.decodeFromBase64(storedData);

        if (sharedData) {
          this.loadSharedList(sharedData);
        } else {
          this.showInvalidDataError();
        }
      } else {
        // Fallback: intentar extraer de URL actual (para compatibilidad)
        const sharedData = this.base64UrlService.extractFromCurrentUrl();
        if (sharedData) {
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
   * Verifica si existe una lista con el mismo nombre y muestra opciones de comparación
   * @param sharedData Datos de la lista compartida
   */
  private loadSharedList(sharedData: ChecklistData): void {
    try {
      // Validar que los datos son válidos
      if (!this.isValidSharedData(sharedData)) {
        this.showInvalidDataError();
        return;
      }

      // Agregar metadatos de compartir si no existen
      if (!sharedData.sharedAt) {
        sharedData.sharedAt = new Date().toISOString();
      }
      if (!sharedData.shareVersion) {
        sharedData.shareVersion = '1.2';
      }

      // Verificar si existe una lista con el mismo nombre
      const existingList =
        this.comparisonService.findExistingListByName(sharedData);

      if (existingList) {
        // Existe una lista con el mismo nombre, mostrar modal de comparación
        this.comparisonService.showComparisonModal(sharedData, existingList);

        // Navegar al home para mostrar el modal
        this.router.navigate(['/']);
      } else {
        // No existe lista con el mismo nombre, cargar directamente
        this.loadSharedListDirectly(sharedData);
      }
    } catch (error) {
      console.error('Error cargando lista compartida:', error);
      this.showError();
    }
  }

  /**
   * Carga la lista compartida directamente sin comparación
   * @param sharedData Datos de la lista compartida
   */
  public loadSharedListDirectly(sharedData: ChecklistData): void {
    try {
      // Cargar la lista compartida en el servicio
      this.checklistService.loadSharedList(sharedData);

      // Navegar al checklist sin ID específico
      this.router.navigate(['/checklist']);

      // Mostrar mensaje informativo después de un pequeño delay
      setTimeout(() => {
        this.showSuccessMessage(sharedData.name || 'Lista compartida');
      }, 500);
    } catch (error) {
      console.error('Error cargando lista compartida directamente:', error);
      this.showError();
    }
  }

  /**
   * Actualiza una lista existente con los datos compartidos
   * @param sharedData Datos de la lista compartida
   * @param existingList Lista existente a actualizar
   */
  public updateExistingList(
    sharedData: ChecklistData,
    existingList: ChecklistData
  ): void {
    try {
      // Crear datos actualizados manteniendo el ID original
      const updatedData: ChecklistData = {
        ...sharedData,
        id: existingList.id, // Mantener el ID original
        name: existingList.name, // Mantener el nombre original (sin sufijo)
        createdDate: existingList.createdDate, // Mantener fecha de creación original
        modifiedDate: new Date().toISOString(), // Actualizar fecha de modificación
      };

      // Guardar la lista actualizada
      this.storageService.saveList(updatedData);

      // Navegar al checklist con la lista actualizada
      this.router.navigate(['/checklist', existingList.id]);

      // Mostrar mensaje de éxito
      setTimeout(() => {
        this.toastService.showAlert(
          `Lista "${existingList.name}" actualizada exitosamente con los cambios compartidos`,
          'success'
        );
      }, 500);
    } catch (error) {
      console.error('Error actualizando lista existente:', error);
      this.toastService.showAlert(
        'Error al actualizar la lista existente. Inténtalo de nuevo.',
        'danger'
      );
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
