import { Injectable } from '@angular/core';
import { ChecklistData } from '../../../models/task.interface';
import { UrlGeneratorService } from '../../external/url-generator.service';
import { ToastService } from '../../toast.service';

/**
 * Servicio para manejar las funciones relacionadas con compartir listas del checklist
 */
@Injectable({
  providedIn: 'root',
})
export class ShareListService {
  constructor(
    private urlGeneratorService: UrlGeneratorService,
    private toastService: ToastService
  ) {}

  /**
   * Genera una URL compartible para la lista actual
   * Maneja toda la lógica de validación, generación y copia al portapapeles
   * @param checklistData Datos de la lista a compartir
   */
  async generateShareLink(checklistData: ChecklistData): Promise<void> {
    if (!checklistData) {
      console.error('No hay datos de lista para compartir');
      return;
    }

    try {
      // Validar tamaño antes de generar
      const sizeInfo = this.urlGeneratorService.getUrlSizeInfo(checklistData);

      if (!sizeInfo.canGenerate) {
        // Si no se puede generar, el servicio ya mostrará el error específico
        await this.urlGeneratorService.generateShareableUrl(checklistData);
        return;
      }

      // Generar la URL compartible
      const shareUrl = await this.urlGeneratorService.generateShareableUrl(
        checklistData
      );

      if (shareUrl) {
        // Intentar copiar al portapapeles automáticamente
        await this.copyToClipboard(shareUrl);
      }
    } catch (error) {
      console.error('Error generando link de compartir:', error);
      this.showGenericError();
    }
  }

  /**
   * Obtiene información sobre el tamaño de URL que se generaría
   * Útil para mostrar estadísticas o advertencias previas
   * @param checklistData Datos de la lista
   * @returns Información del tamaño de la URL
   */
  getShareUrlSizeInfo(checklistData: ChecklistData) {
    return this.urlGeneratorService.getUrlSizeInfo(checklistData);
  }

  /**
   * Verifica si una lista puede ser compartida
   * @param checklistData Datos de la lista
   * @returns true si puede ser compartida, false si es muy extensa
   */
  canShareList(checklistData: ChecklistData): boolean {
    return this.urlGeneratorService.canGenerateUrl(checklistData);
  }

  /**
   * Intenta copiar la URL al portapapeles
   * Si falla, muestra un toast con la URL para copia manual
   * @param shareUrl URL a copiar
   */
  private async copyToClipboard(shareUrl: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Mostrar mensaje de éxito cuando se copia correctamente
      this.toastService.showAlert(
        'Enlace compartible copiado al portapapeles exitosamente',
        'success'
      );
    } catch (clipboardError) {
      console.error('Error copiando al portapapeles:', clipboardError);
      this.showManualCopyFallback(shareUrl);
    }
  }

  /**
   * Muestra la URL para copia manual cuando falla el portapapeles
   * @param shareUrl URL generada
   */
  private showManualCopyFallback(shareUrl: string): void {
    this.toastService.showAlert(
      `Enlace generado:\n${shareUrl}\n\nCopia manualmente este enlace.`,
      'info'
    );
  }

  /**
   * Muestra error genérico cuando falla la generación
   */
  private showGenericError(): void {
    this.toastService.showAlert(
      'Error al generar el enlace para compartir. Inténtalo de nuevo.',
      'danger'
    );
  }
}
