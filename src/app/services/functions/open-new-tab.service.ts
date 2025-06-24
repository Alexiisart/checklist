import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Servicio para manejar la apertura de listas en nueva pestaña
 * Mantiene consistencia con la arquitectura de servicios de funciones
 */
@Injectable({
  providedIn: 'root',
})
export class OpenNewTabService {
  constructor(private router: Router) {}

  /**
   * Abre una lista específica en una nueva pestaña del navegador
   * @param listId - ID de la lista a abrir
   */
  openListInNewTab(listId: string): void {
    try {
      const baseUrl = window.location.origin;
      const relativePath = this.router.serializeUrl(
        this.router.createUrlTree(['/checklist', listId])
      );
      const fullUrl = `${baseUrl}/#${relativePath}`;

      const newWindow = window.open(fullUrl, '_blank');

      if (!newWindow) {
        this.router.navigate(['/checklist', listId]);
      }
    } catch (error) {
      this.router.navigate(['/checklist', listId]);
    }
  }

  /**
   * Abre una nueva pestaña para crear una lista
   */
  openNewListInNewTab(): void {
    try {
      const baseUrl = window.location.origin;
      const relativePath = this.router.serializeUrl(
        this.router.createUrlTree(['/new-list'])
      );
      const fullUrl = `${baseUrl}/#${relativePath}`;

      const newWindow = window.open(fullUrl, '_blank');

      if (!newWindow) {
        console.warn(
          'No se pudo abrir la nueva pestaña. Puede estar bloqueada por el navegador.'
        );
        this.router.navigate(['/new-list']);
      }
    } catch (error) {
      console.error('Error al abrir nueva lista en nueva pestaña:', error);
      this.router.navigate(['/new-list']);
    }
  }
}
