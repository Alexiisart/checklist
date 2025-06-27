import { Injectable } from '@angular/core';
import { ChecklistData } from '../../models/task.interface';
import { ToastService } from '../toast.service';
import { Base64UrlService } from './base64-url.service';
import { TinyUrlService } from './tiny-url.service';

/**
 * Servicio principal para generar URLs compartibles de listas
 * Maneja la lógica de validación de límites y coordinación de servicios
 */
@Injectable({
  providedIn: 'root',
})
export class UrlGeneratorService {
  private readonly MAX_URL_LENGTH = 60000; // Límite seguro antes del máximo de TinyURL (65,536)

  constructor(
    private base64UrlService: Base64UrlService,
    private tinyUrlService: TinyUrlService,
    private toastService: ToastService
  ) {}

  /**
   * Genera una URL compartible para una lista
   * @param checklistData Datos de la lista a compartir
   * @returns Promise con la URL acortada o null si hay error
   */
  async generateShareableUrl(
    checklistData: ChecklistData
  ): Promise<string | null> {
    try {
      // 1. Generar URL base con Base64
      const fullUrl = this.base64UrlService.generateFullUrl(checklistData);

      // 2. Validar límite de caracteres
      if (fullUrl.length > this.MAX_URL_LENGTH) {
        this.showExtensiveListError(fullUrl.length);
        return null;
      }

      // 3. Acortar con TinyURL
      const shortUrl = await this.tinyUrlService.shortenUrl(fullUrl);

      if (shortUrl) {
        // NO mostrar notificación aquí - se hace en ShareListService
        return shortUrl;
      } else {
        this.showTinyUrlError();
        return null;
      }
    } catch (error) {
      console.error('Error generando URL compartible:', error);
      this.showGenericError();
      return null;
    }
  }

  /**
   * Valida si una lista puede ser convertida a URL sin generar la URL
   * @param checklistData Datos de la lista a validar
   * @returns true si puede ser convertida, false si es muy extensa
   */
  canGenerateUrl(checklistData: ChecklistData): boolean {
    const estimatedLength =
      this.base64UrlService.estimateUrlLength(checklistData);
    return estimatedLength <= this.MAX_URL_LENGTH;
  }

  /**
   * Obtiene estadísticas sobre el tamaño de la URL que se generaría
   * @param checklistData Datos de la lista
   * @returns Información sobre el tamaño
   */
  getUrlSizeInfo(checklistData: ChecklistData): {
    estimatedLength: number;
    maxLength: number;
    canGenerate: boolean;
    usagePercentage: number;
  } {
    const estimatedLength =
      this.base64UrlService.estimateUrlLength(checklistData);
    const usagePercentage = Math.round(
      (estimatedLength / this.MAX_URL_LENGTH) * 100
    );

    return {
      estimatedLength,
      maxLength: this.MAX_URL_LENGTH,
      canGenerate: estimatedLength <= this.MAX_URL_LENGTH,
      usagePercentage,
    };
  }

  private showExtensiveListError(actualLength: number): void {
    const exceeded = actualLength - this.MAX_URL_LENGTH;
    this.toastService.showAlert(
      `No se puede generar la URL porque la lista es muy extensa. ` +
        `Excede el límite por ${exceeded.toLocaleString()} caracteres. ` +
        `Considera reducir el número de tareas o subtareas.`,
      'danger',
      10000
    );
  }

  private showSuccessMessage(): void {
    this.toastService.showAlert(
      'URL de compartir generada exitosamente',
      'success'
    );
  }

  private showTinyUrlError(): void {
    this.toastService.showAlert(
      'Error al acortar la URL. Inténtalo de nuevo más tarde.',
      'danger'
    );
  }

  private showGenericError(): void {
    this.toastService.showAlert(
      'Error al generar la URL compartible. Inténtalo de nuevo.',
      'danger'
    );
  }
}
